

const db = require("../config/db");
const axios = require("axios"); // Import axios
const DocumentModel = require("../models/documentModel");
const File = require("../models/File"); // Import the File model
const FileChunkModel = require("../models/FileChunk");
const ChunkVectorModel = require("../models/ChunkVector");
const ProcessingJobModel = require("../models/ProcessingJob");
const FileChat = require("../models/FileChat");
// const { countTokens, countConversationTokens } = require('../utils/tokenCounter');
const { countTokens, countConversationTokens, countWords, calculatePricing } = require('../utils/tokenCounter');

const { validate: isUuid } = require("uuid");
const { uploadToGCS, getSignedUrl } = require("../services/gcsService");
const {
  convertHtmlToDocx,
  convertHtmlToPdf,
} = require("../services/conversionService");

// ✅ CORRECTED: Consolidated imports from aiService
const {
  askLLM,
  analyzeWithGemini,
  getSummaryFromChunks,
} = require("../services/aiService");

const { extractText } = require("../utils/textExtractor");
const {
  extractTextFromDocument,
  batchProcessDocument,
  getOperationStatus,
  fetchBatchResults,
} = require("../services/documentAiService");
const { chunkDocument } = require("../services/chunkingService");
const {
  generateEmbedding,
  generateEmbeddings,
} = require("../services/embeddingService");
const { normalizeGcsKey } = require("../utils/gcsKey");
const TokenUsageService = require("../services/tokenUsageService");
const { fileInputBucket, fileOutputBucket } = require("../config/gcs");

const { v4: uuidv4 } = require("uuid");

/**
 * @description Uploads a document, saves its metadata, and initiates asynchronous processing.
 * @route POST /api/doc/upload
 */

/**
 * @description Asynchronously processes a document by extracting text, chunking, generating embeddings, and summarizing.
 */
async function processDocument(fileId, fileBuffer, mimetype, userId) {
  const jobId = uuidv4();
  await ProcessingJobModel.createJob({
    job_id: jobId,
    file_id: fileId,
    type: "synchronous",
    document_ai_operation_name: null,
    status: "queued",
  });
  await DocumentModel.updateFileStatus(fileId, "processing", 0.0);

  try {
    const file = await DocumentModel.getFileById(fileId);
    if (file.status === "processed") {
      const existingChunks = await FileChunkModel.getChunksByFileId(fileId);
      if (existingChunks && existingChunks.length > 0) {
        console.log(
          `[processDocument] Returning cached chunks for file ID ${fileId}.`
        );
        await ProcessingJobModel.updateJobStatus(jobId, "completed");
        console.log(
          `✅ Document ID ${fileId} already processed. Skipping re-processing.`
        );
        return;
      }
    }

    let extractedTexts = [];
    const ocrMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/tiff",
    ];
    const useOCR = Boolean(
      mimetype && ocrMimeTypes.includes(String(mimetype).toLowerCase())
    );

    if (useOCR) {
      console.log(`Using Document AI OCR for file ID ${fileId}`);
      extractedTexts = await extractTextFromDocument(fileBuffer, mimetype);
    } else {
      console.log(`Using standard text extraction for file ID ${fileId}`);
      const text = await extractText(fileBuffer, mimetype);
      extractedTexts.push({ text: text });
    }

    if (
      !extractedTexts ||
      extractedTexts.length === 0 ||
      extractedTexts.every(
        (item) => !item || !item.text || item.text.trim() === ""
      )
    ) {
      throw new Error(
        "Could not extract any meaningful text content from document."
      );
    }

    await DocumentModel.updateFileStatus(fileId, "processing", 25.0);

    const chunks = await chunkDocument(extractedTexts, fileId);
    console.log(`Chunked file ID ${fileId} into ${chunks.length} chunks.`);
    await DocumentModel.updateFileStatus(fileId, "processing", 50.0);

    if (chunks.length === 0) {
      console.warn(
        `No chunks generated for file ID ${fileId}. Skipping embedding generation.`
      );
      await DocumentModel.updateFileProcessedAt(fileId);
      await DocumentModel.updateFileStatus(fileId, "processed", 100.0);
      await ProcessingJobModel.updateJobStatus(jobId, "completed");
      console.log(
        `✅ Document ID ${fileId} processed successfully (no chunks).`
      );
      return;
    }

    const chunkContents = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkContents);

    if (chunks.length !== embeddings.length) {
      throw new Error(
        "Mismatch between number of chunks and embeddings generated."
      );
    }

    const chunksToSave = chunks.map((chunk, i) => ({
      file_id: fileId,
      chunk_index: i,
      content: chunk.content,
      token_count: chunk.token_count,
      page_start: chunk.metadata.page_start,
      page_end: chunk.metadata.page_end,
      heading: chunk.metadata.heading,
    }));

    const savedChunks = await FileChunkModel.saveMultipleChunks(chunksToSave);

    const vectorsToSave = savedChunks.map((savedChunk) => {
      const originalChunkIndex = savedChunk.chunk_index;
      const originalChunk = chunks[originalChunkIndex];
      const embedding = embeddings[originalChunkIndex];
      return {
        chunk_id: savedChunk.id,
        embedding: embedding,
        file_id: fileId,
      };
    });

    await ChunkVectorModel.saveMultipleChunkVectors(vectorsToSave);

    await DocumentModel.updateFileStatus(fileId, "processing", 75.0);

    let summary = null;
    try {
      const fullTextForSummary = chunks.map((c) => c.content).join("\n\n");
      if (fullTextForSummary.length > 0) {
        summary = await getSummaryFromChunks(fullTextForSummary);
        await DocumentModel.updateFileSummary(fileId, summary);
        console.log(`📝 Generated summary for document ID ${fileId}.`);
      }
    } catch (summaryError) {
      console.warn(
        `⚠️ Could not generate summary for document ID ${fileId}:`,
        summaryError.message
      );
    }

    await DocumentModel.updateFileProcessedAt(fileId);
    await DocumentModel.updateFileStatus(fileId, "processed", 100.0);
    await ProcessingJobModel.updateJobStatus(jobId, "completed");

    console.log(`✅ Document ID ${fileId} processed successfully.`);
  } catch (error) {
    console.error(`❌ Error processing document ID ${fileId}:`, error);
    await DocumentModel.updateFileStatus(fileId, "error", 0.0);
    await ProcessingJobModel.updateJobStatus(jobId, "failed", error.message);
  }
}

/**
 * @description Analyzes a processed document using AI and returns insights.
 * @route POST /api/doc/analyze
 */
exports.analyzeDocument = async (req, res) => {
  try {
    const { file_id } = req.body;
    if (!file_id)
      return res.status(400).json({ error: "file_id is required." });

    const file = await DocumentModel.getFileById(file_id);
    if (!file) return res.status(404).json({ error: "File not found." });
    if (file.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied." });

    if (file.status !== "processed") {
      return res.status(400).json({
        error: "Document is still processing or failed.",
        status: file.status,
        progress: file.processing_progress,
      });
    }

    const chunks = await FileChunkModel.getChunksByFileId(file_id);
    const fullText = chunks.map((c) => c.content).join("\n\n");

    const analysisCost = Math.ceil(fullText.length / 500);

    // 🚨 TEMPORARY BYPASS: Token reservation and deduction bypassed for debugging.
    console.warn(`⚠️ Token reservation bypassed for user ${req.user.id} for analysis.`);
    // const tokensReserved = await TokenUsageService.checkAndReserveTokens(req.user.id, analysisCost);
    // if (!tokensReserved) {
    //   return res.status(403).json({ message: "User token limit is exceeded for document analysis." });
    // }

    let insights;
    try {
      insights = await analyzeWithGemini(fullText);
      // 🚨 TEMPORARY BYPASS: Token commitment bypassed for debugging.
      console.warn(`⚠️ Token commitment bypassed for user ${req.user.id} for analysis.`);
      // await TokenUsageService.commitTokens(req.user.id, analysisCost, `Document analysis for file ${file_id}`);
    } catch (aiError) {
      console.error("❌ Gemini analysis error:", aiError);
      // 🚨 TEMPORARY BYPASS: Token rollback bypassed for debugging.
      console.warn(`⚠️ Token rollback bypassed for user ${req.user.id} for analysis.`);
      // await TokenUsageService.rollbackTokens(req.user.id, analysisCost);
      return res
        .status(500)
        .json({
          error: "Failed to get AI analysis.",
          details: aiError.message,
        });
    }

    return res.json(insights);
  } catch (error) {
    console.error("❌ analyzeDocument error:", error);
    return res.status(500).json({ error: "Failed to analyze document." });
  }
};
// Add this new endpoint
exports.getTokenStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const overallStats = await FileChat.getUserTokenStats(userId, parseInt(days));
    const dailyStats = await FileChat.getDailyTokenUsage(userId, 7);

    const avgTokensPerQuery = overallStats.total_queries > 0 
      ? Math.round(overallStats.total_tokens / overallStats.total_queries)
      : 0;

    return res.json({
      overall: {
        totalPromptTokens: parseInt(overallStats.total_prompt_tokens) || 0,
        totalCompletionTokens: parseInt(overallStats.total_completion_tokens) || 0,
        totalTokens: parseInt(overallStats.total_tokens) || 0,
        totalQueries: parseInt(overallStats.total_queries) || 0,
        activeDays: parseInt(overallStats.active_days) || 0,
        avgTokensPerQuery
      },
      daily: dailyStats,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error("Error fetching token stats:", error);
    return res.status(500).json({ 
      error: "Failed to fetch token statistics",
      details: error.message 
    });
  }
};

// Update chatWithDocument to include token tracking
// exports.chatWithDocument = async (req, res) => {
//   let userId = null;
//   let tokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

//   try {
//     const { file_id, question, used_secret_prompt = false, prompt_label = null, session_id = null, llmModelName } = req.body;
//     userId = req.user.id;

//     // ... your existing validation code ...

//     const questionEmbedding = await generateEmbedding(question);
//     const relevantChunks = await ChunkVectorModel.findNearestChunks(questionEmbedding, 5, file_id);
//     const relevantChunkContents = relevantChunks.map((chunk) => chunk.content);
//     const usedChunkIds = relevantChunks.map((chunk) => chunk.chunk_id);
//     const context = relevantChunkContents.length === 0 ? "No relevant context found in the document." : relevantChunkContents.join("\n\n");

//     const inputTokenCount = countConversationTokens(question, context, llmModelName);
//     tokenUsage.inputTokens = inputTokenCount.totalInputTokens;

//     let answer;
//     if (relevantChunkContents.length === 0) {
//       answer = await askLLM(llmModelName, "No relevant context found in the document.", question);
//     } else {
//       answer = await askLLM(llmModelName, question, context);
//     }

//     tokenUsage.outputTokens = countTokens(answer, llmModelName);
//     tokenUsage.totalTokens = tokenUsage.inputTokens + tokenUsage.outputTokens;

//     console.log(`Token Usage - Prompt: ${tokenUsage.inputTokens}, Completion: ${tokenUsage.outputTokens}, Total: ${tokenUsage.totalTokens}`);

//     const storedQuestion = used_secret_prompt ? `[${prompt_label || "Secret Prompt"}]` : question;
//     const tokenUsageData = {
//       promptTokens: tokenUsage.inputTokens,
//       completionTokens: tokenUsage.outputTokens,
//       totalTokens: tokenUsage.totalTokens
//     };

//     const savedChat = await FileChat.saveChat(
//       file_id, userId, storedQuestion, answer, session_id,
//       usedChunkIds, used_secret_prompt, used_secret_prompt ? prompt_label : null,
//       llmModelName, tokenUsageData
//     );

//     const history = await FileChat.getChatHistory(file_id, savedChat.session_id);
//     const sessionStats = await FileChat.getSessionTokenUsage(savedChat.session_id);

//     return res.json({
//       session_id: savedChat.session_id,
//       answer,
//       history,
//       llmModelName,
//       tokenUsage: tokenUsageData,
//       sessionStats
//     });
//   } catch (error) {
//     console.error("Error chatting with document:", error);
//     return res.status(500).json({ error: "Failed to get AI answer.", details: error.message });
//   }
// };


// exports.chatWithDocument = async (req, res) => {
//   console.log("chatWithDocument function called");
//   let chatCost;
//   let userId = null;
//   let tokenUsage = {
//     inputTokens: 0,
//     outputTokens: 0,
//     totalTokens: 0
//   };

//   try {
//     const {
//       file_id,
//       question,
//       used_secret_prompt = false,
//       prompt_label = null,
//       session_id = null,
//     } = req.body;
//     const { llmModelName } = req.body;
//     console.log(`[chatWithDocument] llmModelName: ${llmModelName}`);

//     userId = req.user.id;

//     // Validation
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     if (!file_id || !question) {
//       console.error("❌ Chat Error: file_id or question missing.");
//       return res.status(400).json({ error: "file_id and question are required." });
//     }
//     if (!uuidRegex.test(file_id)) {
//       console.error(`❌ Chat Error: Invalid file ID format for file_id: ${file_id}`);
//       return res.status(400).json({ error: "Invalid file ID format." });
//     }

//     // Check file access
//     const file = await DocumentModel.getFileById(file_id);
//     if (!file) return res.status(404).json({ error: "File not found." });
//     if (String(file.user_id) !== String(userId)) {
//       return res.status(403).json({ error: "Access denied." });
//     }
//     if (file.status !== "processed") {
//       console.error(`❌ Chat Error: Document ${file_id} not yet processed. Current status: ${file.status}`);
//       return res.status(400).json({
//         error: "Document is not yet processed.",
//         status: file.status,
//         progress: file.processing_progress,
//       });
//     }

//     // Build document text
//     const allChunks = await FileChunkModel.getChunksByFileId(file_id);
//     const documentFullText = allChunks.map((c) => c.content).join("\n\n");
//     if (!documentFullText || documentFullText.trim() === "") {
//       console.error(`❌ Chat Error: Document ${file_id} has no readable content.`);
//       return res.status(400).json({ error: "Document has no readable content." });
//     }

//     // Token cost (legacy - keeping for reference)
//     const chatContentLength = question.length + documentFullText.length;
//     chatCost = Math.ceil(chatContentLength / 100);

//     console.warn(`⚠️ Token reservation bypassed for user ${userId}.`);

//     // Find context
//     const questionEmbedding = await generateEmbedding(question);
//     const relevantChunks = await ChunkVectorModel.findNearestChunks(
//       questionEmbedding,
//       5,
//       file_id
//     );
//     const relevantChunkContents = relevantChunks.map((chunk) => chunk.content);
//     const usedChunkIds = relevantChunks.map((chunk) => chunk.chunk_id);

//     // Build context
//     const context = relevantChunkContents.length === 0 
//       ? "No relevant context found in the document." 
//       : relevantChunkContents.join("\n\n");

//     // ✅ COUNT INPUT TOKENS
//     const inputTokenCount = countConversationTokens(question, context, llmModelName);
//     tokenUsage.inputTokens = inputTokenCount.totalInputTokens;

//     console.log(`📊 Token Usage Breakdown:`);
//     console.log(`   Question Tokens: ${inputTokenCount.questionTokens}`);
//     console.log(`   Context Tokens: ${inputTokenCount.contextTokens}`);
//     console.log(`   Total Input Tokens: ${inputTokenCount.totalInputTokens}`);

//     // Call LLM
//     console.log("Checking if askLLM is defined:", typeof askLLM);
//     let answer;
//     try {
//       if (relevantChunkContents.length === 0) {
//         answer = await askLLM(llmModelName, "No relevant context found in the document.", question);
//       } else {
//         answer = await askLLM(llmModelName, question, context);
//       }
//     } catch (llmError) {
//       console.error("❌ LLM Error:", llmError);
//       return res.status(500).json({ 
//         error: "Failed to get AI response", 
//         details: llmError.message 
//       });
//     }

//     // ✅ COUNT OUTPUT TOKENS
//     tokenUsage.outputTokens = countTokens(answer, llmModelName);
//     tokenUsage.totalTokens = tokenUsage.inputTokens + tokenUsage.outputTokens;

//     console.log(`   Completion Tokens: ${tokenUsage.outputTokens}`);
//     console.log(`   Total Tokens: ${tokenUsage.totalTokens}`);
//     console.log(`   Model: ${llmModelName}`);

//     // Store chat
//     const storedQuestion = used_secret_prompt
//       ? `[${prompt_label || "Secret Prompt"}]`
//       : question;

//     // ✅ CREATE PROPERLY STRUCTURED TOKEN USAGE OBJECT
//     const tokenUsageData = {
//       promptTokens: tokenUsage.inputTokens,
//       completionTokens: tokenUsage.outputTokens,
//       totalTokens: tokenUsage.totalTokens
//     };

//     console.log('🔍 Token data being passed to saveChat:', JSON.stringify(tokenUsageData, null, 2));

//     // ✅ SAVE CHAT WITH TOKEN DATA
//     const savedChat = await FileChat.saveChat(
//       file_id,
//       userId,
//       storedQuestion,
//       answer,
//       session_id,
//       usedChunkIds,
//       used_secret_prompt,
//       used_secret_prompt ? prompt_label : null,
//       llmModelName,
//       tokenUsageData  // ✅ PASSING TOKEN DATA HERE
//     );

//     console.log('✅ Chat saved with ID:', savedChat.id);
//     console.warn(`⚠️ Token commitment bypassed for user ${userId}.`);

//     // Fetch full session history
//     const history = await FileChat.getChatHistory(file_id, savedChat.session_id);

//     // Get session token summary
//     const sessionStats = await FileChat.getSessionTokenUsage(savedChat.session_id);
//     console.log('📊 Session stats:', sessionStats);

//     return res.json({
//       session_id: savedChat.session_id,
//       answer,
//       history,
//       llmModelName: llmModelName,
//       tokenUsage: tokenUsageData,
//       sessionStats
//     });
//   } catch (error) {
//     console.error("❌ Error chatting with document:", error);
//     if (chatCost && userId) {
//       console.warn(`⚠️ Token rollback bypassed for user ${userId}.`);
//     }
//     return res.status(500).json({ 
//       error: "Failed to get AI answer.", 
//       details: error.message 
//     });
//   }
// };



// exports.chatWithDocument = async (req, res) => {
//   console.log("chatWithDocument function called");
//   let userId = null;

//   try {
//     const { file_id, question, used_secret_prompt = false, prompt_label = null, session_id = null, llmModelName } = req.body;
//     userId = req.user.id;

//     // Validate
//     if (!file_id || !question) return res.status(400).json({ error: "file_id and question are required." });

//     const file = await DocumentModel.getFileById(file_id);
//     if (!file || file.user_id !== userId) return res.status(403).json({ error: "Access denied or file not found." });
//     if (file.status !== "processed") return res.status(400).json({ error: "File not ready." });

//     // Build document text
//     const allChunks = await FileChunkModel.getChunksByFileId(file_id);
//     const documentFullText = allChunks.map(c => c.content).join("\n\n");

//     // ✅ Word + char count
//     const totalWords = countWords(documentFullText);
//     const totalChars = documentFullText.length;

//     // Find context
//     const questionEmbedding = await generateEmbedding(question);
//     const relevantChunks = await ChunkVectorModel.findNearestChunks(questionEmbedding, 5, file_id);
//     const relevantChunkContents = relevantChunks.map(chunk => chunk.content);
//     const usedChunkIds = relevantChunks.map(chunk => chunk.chunk_id);
//     const context = relevantChunkContents.length === 0 ? "No relevant context found in the document." : relevantChunkContents.join("\n\n");

//     // ✅ Count tokens
//     const inputTokenCount = countConversationTokens(question, context, llmModelName);
//     const outputAnswer = await askLLM(llmModelName, question, context);
//     const outputTokenCount = countTokens(outputAnswer, llmModelName);

//     const totalTokens = inputTokenCount.totalInputTokens + outputTokenCount;

//     // ✅ Pricing
//     const pricing = calculatePricing(inputTokenCount.totalInputTokens, outputTokenCount);

//     // ✅ Console logs
//     console.log("📊 Token + Cost Breakdown:");
//     console.log(`   Total Words in PDF: ${totalWords}`);
//     console.log(`   Total Characters in PDF: ${totalChars}`);
//     console.log(`   Input Tokens (Q+Context): ${inputTokenCount.totalInputTokens}`);
//     console.log(`   Output Tokens: ${outputTokenCount}`);
//     console.log(`   Total Tokens: ${totalTokens}`);
//     console.log(`   Input Cost (INR): ₹${pricing.inputCostINR}`);
//     console.log(`   Output Cost (INR): ₹${pricing.outputCostINR}`);
//     console.log(`   Total Cost (INR): ₹${pricing.totalCostINR}`);

//     // Save chat
//     const tokenUsageData = {
//       promptTokens: inputTokenCount.totalInputTokens,
//       completionTokens: outputTokenCount,
//       totalTokens,
//       wordCount: totalWords,
//       charCount: totalChars,
//       inputCostINR: pricing.inputCostINR,
//       outputCostINR: pricing.outputCostINR,
//       totalCostINR: pricing.totalCostINR
//     };

//     const savedChat = await FileChat.saveChat(
//       file_id, userId, question, outputAnswer, session_id,
//       usedChunkIds, used_secret_prompt, prompt_label, llmModelName, tokenUsageData
//     );

//     const history = await FileChat.getChatHistory(file_id, savedChat.session_id);
//     const sessionStats = await FileChat.getSessionTokenUsage(savedChat.session_id);

//     return res.json({
//       session_id: savedChat.session_id,
//       answer: outputAnswer,
//       history,
//       tokenUsage: tokenUsageData,
//       sessionStats
//     });
//   } catch (err) {
//     console.error("❌ chatWithDocument error:", err);
//     return res.status(500).json({ error: "Failed to get AI answer.", details: err.message });
//   }
// };
exports.chatWithDocument = async (req, res) => {
  console.log("chatWithDocument function called");
  let userId = null;

  try {
    const {
      file_id,
      question,
      used_secret_prompt = false,
      prompt_label = null,
      session_id = null,
      llmModelName
    } = req.body;

    userId = req.user.id;

    // Validate
    if (!file_id || !question) {
      return res.status(400).json({ error: "file_id and question are required." });
    }

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== userId) {
      return res.status(403).json({ error: "Access denied or file not found." });
    }
    if (file.status !== "processed") {
      return res.status(400).json({ error: "File not ready." });
    }

    // Build document text
    const allChunks = await FileChunkModel.getChunksByFileId(file_id);
    const documentFullText = allChunks.map((c) => c.content).join("\n\n");

    // Word + char count
    const totalWords = countWords(documentFullText);
    const totalChars = documentFullText.length;

    // Find context
    const questionEmbedding = await generateEmbedding(question);
    const relevantChunks = await ChunkVectorModel.findNearestChunks(
      questionEmbedding,
      5,
      file_id
    );
    const relevantChunkContents = relevantChunks.map((chunk) => chunk.content);
    const usedChunkIds = relevantChunks.map((chunk) => chunk.chunk_id);
    const context = relevantChunkContents.length === 0
      ? "No relevant context found in the document."
      : relevantChunkContents.join("\n\n");

    // Count input tokens
    const inputTokenCount = countConversationTokens(question, context, llmModelName);

    // Get LLM response
    const outputAnswer = await askLLM(llmModelName, question, context);

    // Count output tokens
    const outputTokenCount = countTokens(outputAnswer, llmModelName);
    const totalTokens = inputTokenCount.totalInputTokens + outputTokenCount;

    // Calculate pricing
    const pricing = calculatePricing(
      inputTokenCount.totalInputTokens,
      outputTokenCount
    );

    // Console logs
    console.log("📊 Token + Cost Breakdown:");
    console.log(`   Total Words in PDF: ${totalWords}`);
    console.log(`   Total Characters in PDF: ${totalChars}`);
    console.log(`   Input Tokens (Q+Context): ${inputTokenCount.totalInputTokens}`);
    console.log(`   Output Tokens: ${outputTokenCount}`);
    console.log(`   Total Tokens: ${totalTokens}`);
    console.log(`   Input Cost (INR): ₹${pricing.inputCostINR}`);
    console.log(`   Output Cost (INR): ₹${pricing.outputCostINR}`);
    console.log(`   Total Cost (INR): ₹${pricing.totalCostINR}`);

    // Prepare token usage data
    const tokenUsageData = {
      promptTokens: inputTokenCount.totalInputTokens,
      completionTokens: outputTokenCount,
      totalTokens,
      wordCount: totalWords,
      charCount: totalChars,
      inputCostINR: pricing.inputCostINR,
      outputCostINR: pricing.outputCostINR,
      totalCostINR: pricing.totalCostINR
    };

    // Save chat
    const savedChat = await FileChat.saveChat(
      file_id,
      userId,
      question,
      outputAnswer,
      session_id,
      usedChunkIds,
      used_secret_prompt,
      prompt_label,
      llmModelName,
      tokenUsageData
    );

    // Get updated history and session stats
    const history = await FileChat.getChatHistory(file_id, savedChat.session_id);
    const sessionStats = await FileChat.getSessionStats(savedChat.session_id);

    console.log('📊 Session Stats:', sessionStats);

    return res.json({
      session_id: savedChat.session_id,
      answer: outputAnswer,
      history,
      tokenUsage: tokenUsageData,
      sessionStats
    });
  } catch (err) {
    console.error("❌ chatWithDocument error:", err);
    return res.status(500).json({
      error: "Failed to get AI answer.",
      details: err.message
    });
  }
};
/**
 * @description Retrieves token + cost stats for the authenticated user
 * @route GET /api/doc/cost-stats
 */
/**
 * @description Retrieves token + cost stats for the authenticated user
 * @route GET /api/doc/cost-stats
 */
exports.getCostStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Aggregate overall stats - CHANGED pool TO db
    const overallStats = await db.query(
      `SELECT 
        COALESCE(SUM(total_prompt_tokens), 0)::int as total_prompt_tokens,
        COALESCE(SUM(total_completion_tokens), 0)::int as total_completion_tokens,
        COALESCE(SUM(total_tokens), 0)::int as total_tokens,
        COALESCE(SUM(total_queries), 0)::int as total_queries,
        COALESCE(SUM(total_input_cost_inr), 0)::numeric(12,4) as total_input_cost_inr,
        COALESCE(SUM(total_output_cost_inr), 0)::numeric(12,4) as total_output_cost_inr,
        COALESCE(SUM(total_cost_inr), 0)::numeric(12,4) as total_cost_inr,
        COUNT(DISTINCT date)::int as active_days
      FROM user_token_usage
      WHERE user_id = $1 
        AND date >= CURRENT_DATE - $2::int * INTERVAL '1 day'`,
      [userId, days]
    );

    // Daily stats - CHANGED pool TO db
    const dailyStats = await db.query(
      `SELECT 
        date,
        total_prompt_tokens,
        total_completion_tokens,
        total_tokens,
        total_queries,
        total_input_cost_inr,
        total_output_cost_inr,
        total_cost_inr
       FROM user_token_usage
       WHERE user_id = $1 
         AND date >= CURRENT_DATE - $2::int * INTERVAL '1 day'
       ORDER BY date DESC`,
      [userId, days]
    );

    const overall = overallStats.rows[0];

    // Console log
    console.log("📊 Cost + Token Stats Report:");
    console.log(`   Period: Last ${days} days`);
    console.log(`   Total Queries: ${overall.total_queries}`);
    console.log(`   Total Input Tokens: ${overall.total_prompt_tokens}`);
    console.log(`   Total Output Tokens: ${overall.total_completion_tokens}`);
    console.log(`   Total Tokens: ${overall.total_tokens}`);
    console.log(`   Total Input Cost (INR): ₹${overall.total_input_cost_inr}`);
    console.log(`   Total Output Cost (INR): ₹${overall.total_output_cost_inr}`);
    console.log(`   Total Cost (INR): ₹${overall.total_cost_inr}`);
    console.log(`   Active Days: ${overall.active_days}`);

    return res.json({
      overall: {
        totalPromptTokens: parseInt(overall.total_prompt_tokens) || 0,
        totalCompletionTokens: parseInt(overall.total_completion_tokens) || 0,
        totalTokens: parseInt(overall.total_tokens) || 0,
        totalQueries: parseInt(overall.total_queries) || 0,
        totalInputCostINR: parseFloat(overall.total_input_cost_inr) || 0,
        totalOutputCostINR: parseFloat(overall.total_output_cost_inr) || 0,
        totalCostINR: parseFloat(overall.total_cost_inr) || 0,
        activeDays: parseInt(overall.active_days) || 0
      },
      daily: dailyStats.rows,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error("❌ getCostStats error:", error);
    return res.status(500).json({
      error: "Failed to fetch cost statistics",
      details: error.message
    });
  }
};

/**
 *
 * @description Generates a summary for selected chunks of a document using AI.
 * @route POST /api/doc/summary
 */
exports.getSummary = async (req, res) => {
  try {
    const { file_id, selected_chunk_ids } = req.body;
    const userId = req.user.id;

    if (!file_id)
      return res.status(400).json({ error: "file_id is required." });
    if (!Array.isArray(selected_chunk_ids) || selected_chunk_ids.length === 0) {
      return res.status(400).json({ error: "No chunks selected for summary." });
    }

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied or file not found." });
    }

    if (file.status !== "processed") {
      return res.status(400).json({
        error: "Document is still processing or failed.",
        status: file.status,
        progress: file.processing_progress,
      });
    }

    const fileChunks = await FileChunkModel.getChunksByFileId(file_id);
    const allowedIds = new Set(fileChunks.map((c) => c.id));
    const safeChunkIds = selected_chunk_ids.filter((id) => allowedIds.has(id));

    if (safeChunkIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Selected chunks are invalid for this file." });
    }

    const selectedChunks = await FileChunkModel.getChunkContentByIds(
      safeChunkIds
    );
    const combinedText = selectedChunks
      .map((chunk) => chunk.content)
      .join("\n\n");

    if (!combinedText.trim()) {
      return res
        .status(400)
        .json({ error: "Selected chunks contain no readable content." });
    }

    const summaryCost = Math.ceil(combinedText.length / 200);

    // 🚨 TEMPORARY BYPASS: Token reservation and deduction bypassed for debugging.
    console.warn(`⚠️ Token reservation bypassed for user ${userId} for summary.`);
    // const tokensReserved = await TokenUsageService.checkAndReserveTokens(userId, summaryCost);
    // if (!tokensReserved) {
    //   return res.status(403).json({ message: "User token limit is exceeded for summary generation." });
    // }

    let summary;
    try {
      summary = await getSummaryFromChunks(combinedText);
      // 🚨 TEMPORARY BYPASS: Token commitment bypassed for debugging.
      console.warn(`⚠️ Token commitment bypassed for user ${userId} for summary.`);
      // await TokenUsageService.commitTokens(userId, summaryCost, `Summary generation for file ${file_id}`);
    } catch (aiError) {
      console.error("❌ Gemini summary error:", aiError);
      // 🚨 TEMPORARY BYPASS: Token rollback bypassed for debugging.
      console.warn(`⚠️ Token rollback bypassed for user ${userId} for summary.`);
      // await TokenUsageService.rollbackTokens(userId, summaryCost);
      return res
        .status(500)
        .json({
          error: "Failed to generate summary.",
          details: aiError.message,
        });
    }

    return res.json({ summary, used_chunk_ids: safeChunkIds });
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    return res.status(500).json({ error: "Failed to generate summary." });
  }
};

/**
 * @description Allows users to chat with a document using AI, leveraging relevant chunks as context.
 * @route POST /api/doc/chat
 */
// exports.chatWithDocument = async (req, res) => {
//   console.log("chatWithDocument function called");
//   let chatCost;
//   let userId = null;

//   try {
//     const {
//       file_id,
//       question,
//       used_secret_prompt = false,
//       prompt_label = null,
//       session_id = null, // ✅ allow frontend to pass session
//     } = req.body;
//     const { llmModelName } = req.body;
//     console.log(`[chatWithDocument] llmModelName: ${llmModelName}`);

//     userId = req.user.id;

//     // Validation
//     const uuidRegex =
//       /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//     if (!file_id || !question) {
//       console.error("❌ Chat Error: file_id or question missing.");
//       return res
//         .status(400)
//         .json({ error: "file_id and question are required." });
//     }
//     if (!uuidRegex.test(file_id)) {
//       console.error(`❌ Chat Error: Invalid file ID format for file_id: ${file_id}`);
//       return res.status(400).json({ error: "Invalid file ID format." });
//     }

//     // Check file access
//     const file = await DocumentModel.getFileById(file_id);
//     if (!file) return res.status(404).json({ error: "File not found." });
//     if (String(file.user_id) !== String(userId)) {
//       return res.status(403).json({ error: "Access denied." });
//     }
//     if (file.status !== "processed") {
//       console.error(`❌ Chat Error: Document ${file_id} not yet processed. Current status: ${file.status}`);
//       return res.status(400).json({
//         error: "Document is not yet processed.",
//         status: file.status,
//         progress: file.processing_progress,
//       });
//     }

//     // Build document text
//     const allChunks = await FileChunkModel.getChunksByFileId(file_id);
//     const documentFullText = allChunks.map((c) => c.content).join("\n\n");
//     if (!documentFullText || documentFullText.trim() === "") {
//       console.error(`❌ Chat Error: Document ${file_id} has no readable content.`);
//       return res.status(400).json({ error: "Document has no readable content." });
//     }

//     // Token cost
//     const chatContentLength = question.length + documentFullText.length;
//     chatCost = Math.ceil(chatContentLength / 100);

//     // 🚨 TEMPORARY BYPASS: Token reservation and deduction bypassed for debugging.
//     console.warn(`⚠️ Token reservation bypassed for user ${userId}.`);
//     // const tokensReserved = await TokenUsageService.checkAndReserveTokens(userId, chatCost);
//     // if (!tokensReserved) {
//     //   return res.status(403).json({ message: "Token limit exceeded." });
//     // }

//     // Find context
//     const questionEmbedding = await generateEmbedding(question);
//     const relevantChunks = await ChunkVectorModel.findNearestChunks(
//       questionEmbedding,
//       5,
//       file_id
//     );
//     const relevantChunkContents = relevantChunks.map((chunk) => chunk.content);
//     const usedChunkIds = relevantChunks.map((chunk) => chunk.chunk_id);

    
//     console.log("Checking if askLLM is defined:", typeof askLLM);
//         let answer;
//         if (relevantChunkContents.length === 0) {
//           answer = await askLLM(llmModelName, "No relevant context found in the document.", question);
//         } else {
//           const context = relevantChunkContents.join("\n\n");
//           answer = await askLLM(llmModelName, question, context);
//         }
//     // Store chat
//     const storedQuestion = used_secret_prompt
//       ? `[${prompt_label || "Secret Prompt"}]`
//       : question;

//     const savedChat = await FileChat.saveChat(
//       file_id,
//       userId,
//       storedQuestion,
//       answer,
//       session_id, // ✅ if null, new session is created in saveChat
//       usedChunkIds,
//       used_secret_prompt,
//       used_secret_prompt ? prompt_label : null,
//       llmModelName
//     );

//     // Commit tokens
//     // 🚨 TEMPORARY BYPASS: Token commitment bypassed for debugging.
//     console.warn(`⚠️ Token commitment bypassed for user ${userId}.`);
//     // await TokenUsageService.commitTokens(userId, chatCost, `AI chat for document ${file_id}`);

//     // ✅ Fetch full session history so frontend gets all messages live
//     const history = await FileChat.getChatHistory(file_id, savedChat.session_id);

//     return res.json({
//       session_id: savedChat.session_id,
//       answer,
//       history, // ✅ full conversation thread,
//       llmModelName: llmModelName
//     });
//   } catch (error) {
//     console.error("❌ Error chatting with document:", error);
//     if (chatCost && userId) {
//       // 🚨 TEMPORARY BYPASS: Token rollback bypassed for debugging.
//       console.warn(`⚠️ Token rollback bypassed for user ${userId}.`);
//       // await TokenUsageService.rollbackTokens(userId, chatCost, "Token rollback due to error");
//     }
//     return res
//       .status(500)
//       .json({ error: "Failed to get AI answer.", details: error.message });
//   }
// };

// Add this import at the top of the file with other imports

/**
 * @description Allows users to chat with a document using AI, leveraging relevant chunks as context.
 * @route POST /api/doc/chat
 */

/**
 * @description Saves edited HTML content of a document by converting it to DOCX and PDF, then uploading to GCS.
 * @route POST /api/doc/save
 */
exports.saveEditedDocument = async (req, res) => {
  try {
    const { file_id, edited_html } = req.body;
    if (!file_id || typeof edited_html !== "string") {
      return res
        .status(400)
        .json({ error: "file_id and edited_html are required." });
    }

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Access denied or file not found." });
    }

    const docxBuffer = await convertHtmlToDocx(edited_html);
    const pdfBuffer = await convertHtmlToPdf(edited_html);

    const { gsUri: docxUrl } = await uploadToGCS(
      `edited_${file_id}.docx`,
      docxBuffer,
      "edited",
      false,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    const { gsUri: pdfUrl } = await uploadToGCS(
      `edited_${file_id}.pdf`,
      pdfBuffer,
      "edited",
      false,
      "application/pdf"
    );

    await DocumentModel.saveEditedVersions(file_id, docxUrl, pdfUrl);

    return res.json({ docx_download_url: docxUrl, pdf_download_url: pdfUrl });
  } catch (error) {
    console.error("❌ saveEditedDocument error:", error);
    return res.status(500).json({ error: "Failed to save edited document." });
  }
};

/**
 * @description Get all chat sessions for a user with token data
 * @route GET /api/doc/chat-sessions
 */
exports.getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`📥 Fetching chat sessions for user ${userId}, page ${page}`);

    // Get all sessions for this user
    const sessionsResult = await db.query(
      `SELECT DISTINCT session_id, file_id, user_id, 
              MIN(created_at) as first_message_at,
              MAX(created_at) as last_message_at
       FROM file_chats
       WHERE user_id = $1
       GROUP BY session_id, file_id, user_id
       ORDER BY MAX(created_at) DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    if (sessionsResult.rows.length === 0) {
      console.log(`No sessions found for user ${userId}`);
      return res.json([]);
    }

    console.log(`Found ${sessionsResult.rows.length} sessions`);

    // For each session, get all messages WITH TOKEN DATA
    const sessions = await Promise.all(
      sessionsResult.rows.map(async (session) => {
        const messagesResult = await db.query(
          `SELECT id, question, answer, 
                  prompt_tokens, completion_tokens, total_tokens,
                  word_count, char_count,
                  input_cost_inr, output_cost_inr, total_cost_inr,
                  created_at, llm_model_name
           FROM file_chats
           WHERE session_id = $1
           ORDER BY created_at ASC`,
          [session.session_id]
        );

        console.log(`Session ${session.session_id}: ${messagesResult.rows.length} messages`);
        
        if (messagesResult.rows.length > 0) {
          const firstMsg = messagesResult.rows[0];
          console.log(`  First message has tokens:`, {
            prompt: firstMsg.prompt_tokens,
            completion: firstMsg.completion_tokens,
            total: firstMsg.total_tokens,
            cost: firstMsg.total_cost_inr
          });
        }

        return {
          session_id: session.session_id,
          file_id: session.file_id,
          user_id: session.user_id,
          first_message_at: session.first_message_at,
          last_message_at: session.last_message_at,
          messages: messagesResult.rows
        };
      })
    );

    console.log(`✅ Returning ${sessions.length} sessions with full token data`);
    return res.json(sessions);
  } catch (error) {
    console.error("❌ getChatSessions error:", error);
    return res.status(500).json({ 
      error: "Failed to fetch chat sessions", 
      details: error.message 
    });
  }
};

/**
 * @description Generates a signed URL to download a specific format (DOCX or PDF) of an edited document.
 * @route GET /api/doc/download/:file_id/:format
 */
exports.downloadDocument = async (req, res) => {
  try {
    const { file_id, format } = req.params;
    if (!file_id || !format)
      return res
        .status(400)
        .json({ error: "file_id and format are required." });
    if (!["docx", "pdf"].includes(format))
      return res
        .status(400)
        .json({ error: "Invalid format. Use docx or pdf." });

    const file = await DocumentModel.getFileById(file_id);
    if (!file) return res.status(404).json({ error: "File not found." });
    if (file.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const targetUrl =
      format === "docx" ? file.edited_docx_path : file.edited_pdf_path;
    if (!targetUrl)
      return res
        .status(404)
        .json({ error: "File not found or not yet generated" });

    const gcsKey = normalizeGcsKey(targetUrl, process.env.GCS_BUCKET);
    if (!gcsKey)
      return res.status(500).json({ error: "Invalid GCS path for the file." });

    const signedUrl = await getSignedUrl(gcsKey);
    return res.redirect(signedUrl);
  } catch (error) {
    console.error("❌ Error generating signed URL:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate signed download link" });
  }
};

/**
 * @description Retrieves the chat history for a specific document.
 * @route GET /api/doc/chat-history/:file_id
 */
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Fetch all chats for this user (grouped by session)
    const chats = await FileChat.getChatHistoryByUserId(userId);

    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: "No chat history found for this user." });
    }

    // ✅ Group chats by session_id for better organization
    const sessions = chats.reduce((acc, chat) => {
      if (!acc[chat.session_id]) {
        acc[chat.session_id] = {
          session_id: chat.session_id,
          file_id: chat.file_id,
          user_id: chat.user_id,
          messages: []
        };
      }

      acc[chat.session_id].messages.push({
        id: chat.id,
        question: chat.question,
        answer: chat.answer,
        used_chunk_ids: chat.used_chunk_ids,
        used_secret_prompt: chat.used_secret_prompt,
        prompt_label: chat.prompt_label,
        created_at: chat.created_at
      });

      return acc;
    }, {});

    return res.json(Object.values(sessions));
  } catch (error) {
    console.error("❌ getChatHistory error:", error);
    return res.status(500).json({ error: "Failed to fetch chat history." });
  }
};

/**
 * @description Retrieves the processing status of a document, including progress and extracted chunks/summary if available.
 * @route GET /api/doc/status/:file_id
 */
exports.getDocumentProcessingStatus = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) {
      console.error("❌ getDocumentProcessingStatus Error: file_id is missing from request parameters.");
      return res.status(400).json({ error: "file_id is required." });
    }
    console.log(`[getDocumentProcessingStatus] Received request for file_id: ${file_id}`);

    const file = await DocumentModel.getFileById(file_id);
    if (!file || String(file.user_id) !== String(req.user.id)) {
      console.error(`❌ getDocumentProcessingStatus Error: Access denied for file ${file_id}. File owner: ${file.user_id}, Requesting user: ${req.user.id}`);
      return res
        .status(403)
        .json({ error: "Access denied or file not found." });
    }

    const job = await ProcessingJobModel.getJobByFileId(file_id);

    if (file.status === "processed") {
      const existingChunks = await FileChunkModel.getChunksByFileId(file_id);
      if (existingChunks && existingChunks.length > 0) {
        const formattedChunks = existingChunks.map((chunk) => ({
          text: chunk.content,
          metadata: {
            page_start: chunk.page_start,
            page_end: chunk.page_end,
            heading: chunk.heading,
          },
        }));
        return res.json({
          document_id: file.id,
          status: file.status,
          processing_progress: file.processing_progress,
          job_status: job ? job.status : "completed",
          job_error: job ? job.error_message : null,
          last_updated: file.updated_at,
          chunks: formattedChunks,
          summary: file.summary,
        });
      }
    }

    if (!job || !job.document_ai_operation_name) {
      return res.json({
        document_id: file.id,
        status: file.status,
        processing_progress: file.processing_progress,
        job_status: "not_queued",
        job_error: null,
        last_updated: file.updated_at,
        chunks: [],
        summary: file.summary,
      });
    }

    console.log(`[getDocumentProcessingStatus] Checking Document AI operation status for job: ${job.document_ai_operation_name}`);
    const status = await getOperationStatus(job.document_ai_operation_name);
    console.log(`[getDocumentProcessingStatus] Document AI operation status: ${JSON.stringify(status)}`);

    if (!status.done) {
      return res.json({
        file_id: file.id,
        status: "batch_processing",
        processing_progress: file.processing_progress,
        job_status: "running",
        job_error: null,
        last_updated: file.updated_at,
      });
    }

    if (status.error) {
      console.error(`[getDocumentProcessingStatus] Document AI operation failed with error: ${status.error.message}`);
      await DocumentModel.updateFileStatus(file_id, "error", 0.0);
      await ProcessingJobModel.updateJobStatus(
        job.id,
        "failed",
        status.error.message
      );
      return res.status(500).json({
        file_id: file.id,
        status: "error",
        processing_progress: 0.0,
        job_status: "failed",
        job_error: status.error.message,
        last_updated: new Date().toISOString(),
      });
    }

    const bucketName = process.env.GCS_OUTPUT_BUCKET_NAME;
    const prefix = job.gcs_output_uri_prefix.replace(`gs://${bucketName}/`, "");
    console.log(`[getDocumentProcessingStatus] Document AI operation completed. Fetching results from GCS. Bucket: ${bucketName}, Prefix: ${prefix}`);
    const extractedBatchTexts = await fetchBatchResults(bucketName, prefix);
    console.log(`[getDocumentProcessingStatus] Extracted ${extractedBatchTexts.length} text items from batch results.`);
    if (extractedBatchTexts.length === 0) {
      console.warn(`[getDocumentProcessingStatus] No text extracted from batch results for file ID ${file_id}.`);
    }

    if (
      !extractedBatchTexts ||
      extractedBatchTexts.length === 0 ||
      extractedBatchTexts.every(
        (item) => !item || !item.text || item.text.trim() === ""
      )
    ) {
      throw new Error(
        "Could not extract any meaningful text content from batch document."
      );
    }

    await DocumentModel.updateFileStatus(file_id, "processing", 75.0);
    console.log(`[getDocumentProcessingStatus] Document ID ${file_id} status updated to 75% (text extracted).`);

    console.log(`[getDocumentProcessingStatus] Starting chunking for file ID ${file_id}.`);
    const chunks = await chunkDocument(extractedBatchTexts, file_id);
    console.log(`[getDocumentProcessingStatus] Chunked file ID ${file_id} into ${chunks.length} chunks.`);
    if (chunks.length === 0) {
      console.warn(`[getDocumentProcessingStatus] Chunking resulted in 0 chunks for file ID ${file_id}.`);
    }

    if (chunks.length === 0) {
      await DocumentModel.updateFileStatus(file_id, "processed", 100.0);
      await ProcessingJobModel.updateJobStatus(job.id, "completed");
      const updatedFile = await DocumentModel.getFileById(file_id);
      return res.json({
        document_id: updatedFile.id,
        chunks: [],
        summary: updatedFile.summary,
      });
    }

    const chunkContents = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkContents);

    if (chunks.length !== embeddings.length) {
      throw new Error(
        "Mismatch between number of chunks and embeddings generated for batch document."
      );
    }

    const chunksToSaveBatch = chunks.map((chunk, i) => ({
      file_id: file_id,
      chunk_index: i,
      content: chunk.content,
      token_count: chunk.token_count,
      page_start: chunk.metadata.page_start,
      page_end: chunk.metadata.page_end,
      heading: chunk.metadata.heading,
    }));

    console.log(`[getDocumentProcessingStatus] Attempting to save ${chunksToSaveBatch.length} chunks for file ID ${file_id}.`);
    const savedChunksBatch = await FileChunkModel.saveMultipleChunks(
      chunksToSaveBatch
    );
    console.log(`[getDocumentProcessingStatus] Saved ${savedChunksBatch.length} chunks for file ID ${file_id}.`);
    if (savedChunksBatch.length === 0) {
      console.error(`[getDocumentProcessingStatus] Failed to save any chunks for file ID ${file_id}.`);
    }

    const vectorsToSaveBatch = savedChunksBatch.map((savedChunk) => {
      const originalChunkIndex = savedChunk.chunk_index;
      const originalChunk = chunks[originalChunkIndex];
      const embedding = embeddings[originalChunkIndex];
      return {
        chunk_id: savedChunk.id,
        embedding: embedding,
        file_id: file_id,
      };
    });

    console.log(`[getDocumentProcessingStatus] Attempting to save ${vectorsToSaveBatch.length} chunk vectors for file ID ${file_id}.`);
    await ChunkVectorModel.saveMultipleChunkVectors(vectorsToSaveBatch);
    console.log(`[getDocumentProcessingStatus] Saved ${vectorsToSaveBatch.length} chunk vectors for file ID ${file_id}.`);

    await DocumentModel.updateFileStatus(file_id, "processed", 100.0);
    await ProcessingJobModel.updateJobStatus(job.id, "completed");
    console.log(`[getDocumentProcessingStatus] Document ID ${file_id} processing completed.`);

    let summary = null;
    try {
      const fullTextForSummary = chunks.map((c) => c.content).join("\n\n");
      if (fullTextForSummary.length > 0) {
        console.log(`[getDocumentProcessingStatus] Generating summary for document ID ${file_id}.`);
        summary = await getSummaryFromChunks(fullTextForSummary);
        await DocumentModel.updateFileSummary(file_id, summary);
        console.log(`[getDocumentProcessingStatus] Generated summary for document ID ${file_id}.`);
      }
    } catch (summaryError) {
      console.warn(
        `⚠️ Could not generate summary for batch document ID ${file_id}:`,
        summaryError.message
      );
    }

    const updatedFile = await DocumentModel.getFileById(file_id);
    const fileChunks = await FileChunkModel.getChunksByFileId(file_id);

    const formattedChunks = fileChunks.map((chunk) => ({
      text: chunk.content,
      metadata: {
        page_start: chunk.page_start,
        page_end: chunk.page_end,
        heading: chunk.heading,
      },
    }));

    return res.json({
      document_id: updatedFile.id,
      status: updatedFile.status,
      processing_progress: updatedFile.processing_progress,
      job_status: "completed",
      job_error: null,
      last_updated: updatedFile.updated_at,
      chunks: formattedChunks,
      summary: updatedFile.summary,
    });
  } catch (error) {
    console.error("❌ getDocumentProcessingStatus error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to fetch processing status.",
        details: error.message,
      });
  }
};

/**
 * @description Initiates a batch upload and processing of a large document using Document AI.
 * @route POST /api/doc/batch-upload
 */
exports.batchUploadDocument = async (req, res) => {
  try {
    console.log(`[batchUploadDocument] Received batch upload request.`);
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const authorizationHeader = req.headers.authorization;

    // 🚨 TEMPORARY BYPASS: Payment Service subscription/token status check removed for debugging.
    // This block was originally responsible for verifying active subscriptions and token balances.
    console.warn(`⚠️ Payment Service subscription/token check bypassed for user ${userId}.`);
    /*
    try {
      const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:5003";
      const paymentResponse = await axios.get(`${paymentServiceUrl}/api/payments/history`, {
        headers: {
          Authorization: authorizationHeader,
        },
      });

      const paymentData = paymentResponse.data.data;
      let isSubscribed = false;
      let currentTokenBalance = 0;
      let planTokenLimit = 0;

      if (paymentData && paymentData.length > 0) {
        const activeSubscription = paymentData.find(sub => sub.subscription_status === 'active');
        if (activeSubscription) {
          isSubscribed = true;
          currentTokenBalance = activeSubscription.current_token_balance;
          planTokenLimit = activeSubscription.plan_token_limit;
        }
      }

      if (!isSubscribed || currentTokenBalance <= 0) {
        return res.status(403).json({
          error: "Subscription required or insufficient tokens to process document.",
          details: { isSubscribed, currentTokenBalance, planTokenLimit }
        });
      }
      console.log(`✅ User ${userId} has active subscription with ${currentTokenBalance} tokens.`);

    } catch (paymentError) {
      console.error("❌ Document Service: Error checking payment status:", paymentError.message);
      if (paymentError.response) {
        console.error("Payment Service Response:", paymentError.response.status, paymentError.response.data);
        return res.status(paymentError.response.status).json({
          error: "Failed to verify subscription with payment service.",
          details: paymentError.response.data,
        });
      }
      return res.status(500).json({
        error: "Failed to communicate with payment service.",
        details: paymentError.message,
      });
    }
    */

    const file = req.file;
    if (!file || !file.buffer) {
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file data." });
    }

    const originalFilename = file.originalname;
    const mimeType = file.mimetype;

    const batchUploadFolder = `batch-uploads/${userId}/${uuidv4()}`;
    const { gsUri: gcsInputUri, gcsPath: folderPath } = await uploadToGCS(
      originalFilename,
      file.buffer,
      batchUploadFolder,
      true,
      mimeType
    );

    const outputPrefix = `document-ai-results/${userId}/${uuidv4()}/`;
    const gcsOutputUriPrefix = `gs://${fileOutputBucket.name}/${outputPrefix}`;

    const operationName = await batchProcessDocument(
      [gcsInputUri],
      gcsOutputUriPrefix,
      mimeType
    );
    console.log(`📄 Started Document AI batch operation: ${operationName}`);

    const fileId = await DocumentModel.saveFileMetadata(
      userId,
      originalFilename,
      gcsInputUri,
      folderPath,
      mimeType,
      file.size,
      "batch_queued"
    );
    console.log(`[batchUploadDocument] Saved file metadata with ID: ${fileId}`);

    const jobId = uuidv4();
    await ProcessingJobModel.createJob({
      job_id: jobId,
      file_id: fileId,
      type: "batch",
      gcs_input_uri: gcsInputUri,
      gcs_output_uri_prefix: gcsOutputUriPrefix,
      document_ai_operation_name: operationName,
      status: "queued",
    });

    await DocumentModel.updateFileStatus(fileId, "batch_processing", 0.0);

    return res.status(202).json({
      file_id: fileId,
      job_id: jobId,
      message: "Batch document upload successful; processing initiated.",
      operation_name: operationName,
      gcs_input_uri: gcsInputUri,
      gcs_output_uri_prefix: gcsOutputUriPrefix,
    });
  } catch (error) {
    console.error("❌ Batch Upload Error:", error);
    return res.status(500).json({
      error: "Failed to initiate batch processing",
      details: error.message,
    });
  }
};

/**
 * @description Retrieves the total storage utilization for the authenticated user.
 * @route GET /api/doc/user-storage-utilization
 */
exports.getUserStorageUtilization = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const totalStorageUsedBytes = await File.getTotalStorageUsed(userId);
    const totalStorageUsedGB = (totalStorageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);

    res.status(200).json({
      storage: {
        used_bytes: totalStorageUsedBytes,
        used_gb: totalStorageUsedGB,
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user storage utilization:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};