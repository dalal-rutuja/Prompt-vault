

// // backend/routes/documentRoutes.js
// const express = require('express');
// const multer = require('multer');
// const router = express.Router();

// const controller = require('../controllers/documentController');
// const { protect } = require('../middleware/auth');

// const upload = multer({ storage: multer.memoryStorage() });


// // Batch Upload & processing for large documents
// router.post('/batch-upload', protect, upload.single('document'), controller.batchUploadDocument);

// // Post-processing analytics
// router.post('/analyze', protect, controller.analyzeDocument);

// // Summarize selected chunks (RAG-efficient)
// router.post('/summary', protect, controller.getSummary);

// // Chat with the document (RAG)
// router.post('/chat', protect, controller.chatWithDocument);

// // Save edited (docx + pdf variants)
// router.post('/save', protect, controller.saveEditedDocument);

// // Download edited variants via signed URL
// router.get('/download/:file_id/:format', protect, controller.downloadDocument);

// // Chat history for a document
// router.get('/chat-history/:file_id', protect, controller.getChatHistory);

// // Processing status
// router.get('/status/:file_id', protect, controller.getDocumentProcessingStatus);

// // Add this route
// router.get('/token-stats', protect, controller.getTokenStats);
// // Cost + Token stats report
// router.get('/cost-stats', protect, controller.getCostStats);


// // Add to documentRoutes.js
// router.post('/test-token-save', protect, async (req, res) => {
//   try {
//     const testTokenUsage = {
//       promptTokens: 3853,
//       completionTokens: 471,
//       totalTokens: 4324
//     };

//     console.log('🧪 Testing token save...');
//     console.log('User ID:', req.user.id);
//     console.log('Token data:', testTokenUsage);

//     // Get a file_id from your database for testing
//     const fileResult = await pool.query(
//       'SELECT id FROM files WHERE user_id = $1 LIMIT 1',
//       [req.user.id]
//     );

//     if (fileResult.rows.length === 0) {
//       return res.status(404).json({ error: 'No files found for user' });
//     }

//     const fileId = fileResult.rows[0].id;

//     const savedChat = await FileChat.saveChat(
//       fileId,
//       req.user.id,
//       'Test question',
//       'Test answer',
//       null, // session_id
//       [], // usedChunkIds
//       false, // usedSecretPrompt
//       null, // promptLabel
//       'gemini', // llmModelName
//       testTokenUsage // ✅ tokenUsage
//     );

//     // Verify it was saved
//     const verifyResult = await pool.query(
//       'SELECT * FROM file_chats WHERE id = $1',
//       [savedChat.id]
//     );

//     const tokenStats = await FileChat.getUserTokenStats(req.user.id, 1);

//     res.json({
//       success: true,
//       savedChat: verifyResult.rows[0],
//       tokenStats
//     });
//   } catch (error) {
//     console.error('❌ Test failed:', error);
//     res.status(500).json({ 
//       error: error.message, 
//       stack: error.stack 
//     });
//   }
// });
// module.exports = router;



// routes/documentRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

const controller = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Batch Upload & processing for large documents
router.post('/batch-upload', protect, upload.single('document'), controller.batchUploadDocument);

// Post-processing analytics
router.post('/analyze', protect, controller.analyzeDocument);

// Summarize selected chunks (RAG-efficient)
router.post('/summary', protect, controller.getSummary);

// Chat with the document (RAG)
router.post('/chat', protect, controller.chatWithDocument);

// Save edited (docx + pdf variants)
router.post('/save', protect, controller.saveEditedDocument);

// Download edited variants via signed URL
router.get('/download/:file_id/:format', protect, controller.downloadDocument);

// Chat history for a document
router.get('/chat-history/:file_id', protect, controller.getChatHistory);

// Processing status
router.get('/status/:file_id', protect, controller.getDocumentProcessingStatus);

// Token statistics (legacy endpoint - kept for backward compatibility)
router.get('/token-stats', protect, controller.getTokenStats);

// Cost + Token stats report (NEW - primary endpoint)
router.get('/cost-stats', protect, controller.getCostStats);

// Add this line with your other routes
router.get('/chat-sessions', protect, controller.getChatSessions);

module.exports = router;