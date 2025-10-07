


require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------------------
// Helper: Retry with exponential backoff
// ---------------------------
async function retryWithBackoff(fn, retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
      if (
        err.message.includes('overloaded') ||
        err.message.includes('503') ||
        err.message.includes('temporarily unavailable') ||
        err.message.includes('quota') ||
        err.message.includes('rate limit')
      ) {
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, delay * attempt));
        } else {
          throw new Error('LLM provider is temporarily unavailable. Please try again later.');
        }
      } else {
        throw err;
      }
    }
  }
}

// ---------------------------
// LLM Configurations for HTTP-based providers
// ---------------------------
const LLM_CONFIGS = {
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  },
  anthropic: {
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-20241022',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
  },
  'claude-sonnet-4': {
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
  },
  deepseek: {
    apiUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
  },
};

// ---------------------------
// CORRECTED Model name mappings for Gemini
// ---------------------------
const GEMINI_MODELS = {
  // Use GA models for the general 'gemini' category
  'gemini': [
    'gemini-2.5-flash',       // Latest, most efficient flash model
    'gemini-1.5-flash',       // Older version, good fallback
  ],
  // Use GA models for 'pro' (higher performance/context) category
  'gemini-pro-2.5': [
    'gemini-2.5-pro',         // Latest Pro model (assuming access)
    'gemini-1.5-pro',         // Older Pro version, good fallback
    'gemini-2.5-flash'        // Fallback to latest flash if Pro fails
  ]
};

// ---------------------------
// Unified askLLM function
// ---------------------------
async function askLLM(provider, userMessage, context = '') {
  console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

  // Handle Gemini variants
  if (provider === 'gemini' || provider === 'gemini-pro-2.5') {
    const runGemini = async () => {
      const modelNames = GEMINI_MODELS[provider] || GEMINI_MODELS['gemini'];
      let lastError;
      
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = context
            ? `Context:\n${context}\n\nQuestion: ${userMessage}`
            : userMessage;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          console.log(`✅ Successfully used Gemini model: ${modelName}`);
          return response.text().trim();
        } catch (error) {
          console.warn(`Model ${modelName} failed:`, error.message);
          lastError = error;
          
          // Skip quota errors and try next model
          if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`Quota exceeded for ${modelName}, trying next model...`);
            continue;
          }
          
          // Skip 404 not found errors and try next model
          if (error.message.includes('404') || error.message.includes('not found')) {
            console.log(`Model ${modelName} not found, trying next model...`);
            continue;
          }
          
          console.error(`Detailed error for ${modelName}:`, error);
          continue;
        }
      }
      
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    };
    return retryWithBackoff(runGemini);
  }

  const config = LLM_CONFIGS[provider];
  if (!config) throw new Error(`Unsupported LLM provider: ${provider}`);

  const runHttpProvider = async () => {
    let requestBody;
    
    // Handle Anthropic variants
    if (provider === 'anthropic' || provider === 'claude-sonnet-4') {
      requestBody = {
        model: config.model,
        max_tokens: 2000,
        system: 'You are a helpful AI assistant. Use context if available.',
        messages: [
          { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
        ],
      };
    } else {
      // OpenAI and DeepSeek
      requestBody = {
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Use context if available.' },
          { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      };
    }

    const response = await axios.post(config.apiUrl, requestBody, { headers: config.headers, timeout: 30000 });

    let answer;
    if (provider === 'anthropic' || provider === 'claude-sonnet-4') {
      answer = response.data?.content?.[0]?.text || response.data?.completion;
    } else {
      answer = response.data?.choices?.[0]?.message?.content;
    }

    if (!answer) throw new Error(`Empty response from ${provider.toUpperCase()}`);
    return answer;
  };

  return retryWithBackoff(runHttpProvider);
}

// ---------------------------
// Gemini Wrappers
// ---------------------------
async function askGemini(context, question, modelType = 'gemini') {
  return askLLM(modelType, question, context);
}

async function analyzeWithGemini(documentText, modelType = 'gemini-pro-2.5') {
  const prompt = `Analyze this document thoroughly:\n\n${documentText}\n\nReturn key themes, summary, critical points, and recommendations.`;
  return askLLM(modelType, prompt);
}

async function getSummaryFromChunks(text, modelType = 'gemini-pro-2.5') {
  const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
  return askLLM(modelType, prompt);
}

// ---------------------------
// List available providers
// ---------------------------
function getAvailableProviders() {
  return Object.fromEntries(
    Object.entries({
      ...LLM_CONFIGS,
      gemini: { model: 'gemini-2.0-flash-exp', headers: {} },
      'gemini-pro-2.5': { model: 'gemini-1.5-pro-latest', headers: {} }
    }).map(([provider, cfg]) => {
      let key;
      if (provider.startsWith('gemini')) {
        key = process.env.GEMINI_API_KEY;
      } else if (provider.startsWith('claude') || provider === 'anthropic') {
        key = process.env.ANTHROPIC_API_KEY;
      } else {
        key = process.env[`${provider.toUpperCase()}_API_KEY`];
      }
      
      return [
        provider,
        {
          available: !!key,
          reason: key ? 'Available' : `Missing API key`,
          model: cfg.model
        }
      ];
    })
  );
}

module.exports = {
  askLLM,
  askGemini,
  analyzeWithGemini,
  getSummaryFromChunks,
  getAvailableProviders,
};