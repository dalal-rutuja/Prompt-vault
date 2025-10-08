


// // utils/tokenCounter.js
// const { encoding_for_model, get_encoding } = require('tiktoken');

// /**
//  * Count tokens for different LLM models
//  */
// function countTokens(text, modelName = 'gemini') {
//   if (!text || typeof text !== 'string') return 0;

//   try {
//     // Map provider names to actual tiktoken model names
//     const modelMap = {
//       'gemini': 'gpt-4',
//       'gemini-pro-2.5': 'gpt-4',
//       'anthropic': 'gpt-4',
//       'claude-sonnet-4': 'gpt-4',
//       'openai': 'gpt-4o-mini',
//       'deepseek': 'gpt-4'
//     };

//     const encodingModel = modelMap[modelName] || 'gpt-4';
//     const encoding = encoding_for_model(encodingModel);
//     const tokens = encoding.encode(text);
//     const tokenCount = tokens.length;
//     encoding.free();

//     return tokenCount;
//   } catch (error) {
//     console.error('Token counting error:', error);
//     // Fallback: rough estimate (4 chars per token)
//     return Math.ceil(text.length / 4);
//   }
// }

// /**
//  * Count tokens for a conversation context
//  */
// function countConversationTokens(question, context, modelName = 'gemini') {
//   const questionTokens = countTokens(question, modelName);
//   const contextTokens = countTokens(context, modelName);
//   const systemOverhead = 50; // System message overhead

//   return {
//     questionTokens,
//     contextTokens,
//     totalInputTokens: questionTokens + contextTokens + systemOverhead
//   };
// }

// /**
//  * Count words in text
//  */
// function countWords(text) {
//   if (!text || typeof text !== 'string') return 0;
//   return text.trim().split(/\s+/).length;
// }

// /**
//  * Calculate pricing in INR based on model pricing
//  * Updated pricing (as of 2025):
//  * - Gemini 2.0 Flash: $0.30/$1.20 per 1M tokens (input/output)
//  * - Gemini 2.5 Pro: $1.25/$5.00 per 1M tokens (input/output)
//  * - Claude 3.5 Haiku: $0.80/$4.00 per 1M tokens
//  * - Claude 4.0 Sonnet: $3.00/$15.00 per 1M tokens
//  * - GPT-4o Mini: $0.15/$0.60 per 1M tokens
//  * - DeepSeek: $0.14/$0.28 per 1M tokens
//  * 
//  * Using average USD to INR rate: 1 USD = 83 INR
//  */
// function calculatePricing(inputTokens, outputTokens, modelName = 'gemini') {
//   const USD_TO_INR = 83;
  
//   // Pricing per 1M tokens in USD
//   const pricingMap = {
//     'gemini': { input: 0.30, output: 1.20 },
//     'gemini-pro-2.5': { input: 1.25, output: 5.00 },
//     'anthropic': { input: 0.80, output: 4.00 },
//     'claude-sonnet-4': { input: 3.00, output: 15.00 },
//     'openai': { input: 0.15, output: 0.60 },
//     'deepseek': { input: 0.14, output: 0.28 }
//   };

//   const pricing = pricingMap[modelName] || pricingMap['gemini'];
  
//   // Convert to per-token pricing in INR
//   const rateInput = (pricing.input / 1_000_000) * USD_TO_INR;
//   const rateOutput = (pricing.output / 1_000_000) * USD_TO_INR;

//   const inputCost = inputTokens * rateInput;
//   const outputCost = outputTokens * rateOutput;
//   const totalCost = inputCost + outputCost;

//   return {
//     inputCostINR: parseFloat(inputCost.toFixed(6)),
//     outputCostINR: parseFloat(outputCost.toFixed(6)),
//     totalCostINR: parseFloat(totalCost.toFixed(6)),
//     modelUsed: modelName,
//     pricing: pricing
//   };
// }

// module.exports = {
//   countTokens,
//   countConversationTokens,
//   countWords,
//   calculatePricing
// };



// utils/tokenCounter.js
const { encoding_for_model, get_encoding } = require('tiktoken');

/**
 * Count tokens for different LLM models
 * @param {string} text - The text to count tokens for
 * @param {string} modelName - The model name (gemini, gpt-4o, anthropic, etc.)
 * @returns {number} - Number of tokens
 */
function countTokens(text, modelName = 'gemini') {
  if (!text || typeof text !== 'string') return 0;

  try {
    // Map provider names to actual tiktoken model names
    const modelMap = {
      'gemini': 'gpt-4',
      'gemini-pro-2.5': 'gpt-4',
      'anthropic': 'gpt-4',
      'claude-sonnet-4': 'gpt-4',
      'openai': 'gpt-4o-mini',
      'gpt-4o': 'gpt-4o',
      'deepseek': 'gpt-4'
    };

    const encodingModel = modelMap[modelName] || 'gpt-4';
    const encoding = encoding_for_model(encodingModel);
    const tokens = encoding.encode(text);
    const tokenCount = tokens.length;
    encoding.free();

    return tokenCount;
  } catch (error) {
    console.error('Token counting error:', error);
    // Fallback: rough estimate (4 chars per token)
    return Math.ceil(text.length / 4);
  }
}

/**
 * Count tokens for a conversation context
 * @param {string} question - The user question
 * @param {string} context - The context/document text
 * @param {string} modelName - The model name
 * @returns {Object} - Object with questionTokens, contextTokens, and totalInputTokens
 */
function countConversationTokens(question, context, modelName = 'gemini') {
  const questionTokens = countTokens(question, modelName);
  const contextTokens = countTokens(context, modelName);
  const systemOverhead = 50; // System message overhead

  return {
    questionTokens,
    contextTokens,
    totalInputTokens: questionTokens + contextTokens + systemOverhead
  };
}

/**
 * Count words in text
 * @param {string} text - The text to count words for
 * @returns {number} - Number of words
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Calculate pricing in INR based on model pricing
 * Updated pricing (as of 2025):
 * - Gemini 2.0 Flash: $0.30/$1.20 per 1M tokens (input/output)
 * - Gemini 2.5 Pro: $1.25/$5.00 per 1M tokens (input/output)
 * - Claude 3.5 Haiku: $0.80/$4.00 per 1M tokens (input/output)
 * - Claude 4.0 Sonnet: $3.00/$15.00 per 1M tokens (input/output)
 * - GPT-4o Mini: $0.15/$0.60 per 1M tokens (input/output)
 * - GPT-4o: $2.50/$10.00 per 1M tokens (input/output)
 * - DeepSeek: $0.14/$0.28 per 1M tokens (input/output)
 * 
 * Using average USD to INR rate: 1 USD = 83 INR
 * 
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {string} modelName - The model name
 * @returns {Object} - Object with cost breakdown in INR
 */
function calculatePricing(inputTokens, outputTokens, modelName = 'gemini') {
  const USD_TO_INR = 83;
  
  // Pricing per 1M tokens in USD
  const pricingMap = {
    'gemini': { 
      input: 0.30, 
      output: 1.20,
      description: 'Gemini 2.0 Flash'
    },
    'gemini-pro-2.5': { 
      input: 1.25, 
      output: 5.00,
      description: 'Gemini 2.5 Pro'
    },
    'anthropic': { 
      input: 0.80, 
      output: 4.00,
      description: 'Claude 3.5 Haiku'
    },
    'claude-sonnet-4': { 
      input: 3.00, 
      output: 15.00,
      description: 'Claude 4.0 Sonnet'
    },
    'openai': { 
      input: 0.15, 
      output: 0.60,
      description: 'GPT-4o Mini'
    },
    'gpt-4o': { 
      input: 2.50, 
      output: 10.00,
      description: 'GPT-4o'
    },
    'deepseek': { 
      input: 0.14, 
      output: 0.28,
      description: 'DeepSeek Chat'
    }
  };

  const pricing = pricingMap[modelName] || pricingMap['gemini'];
  
  // Convert to per-token pricing in INR
  const rateInput = (pricing.input / 1_000_000) * USD_TO_INR;
  const rateOutput = (pricing.output / 1_000_000) * USD_TO_INR;

  const inputCost = inputTokens * rateInput;
  const outputCost = outputTokens * rateOutput;
  const totalCost = inputCost + outputCost;

  return {
    inputCostINR: parseFloat(inputCost.toFixed(6)),
    outputCostINR: parseFloat(outputCost.toFixed(6)),
    totalCostINR: parseFloat(totalCost.toFixed(6)),
    inputCostUSD: parseFloat((inputTokens * pricing.input / 1_000_000).toFixed(6)),
    outputCostUSD: parseFloat((outputTokens * pricing.output / 1_000_000).toFixed(6)),
    totalCostUSD: parseFloat(((inputTokens * pricing.input / 1_000_000) + (outputTokens * pricing.output / 1_000_000)).toFixed(6)),
    modelUsed: modelName,
    modelDescription: pricing.description,
    pricing: {
      input: pricing.input,
      output: pricing.output,
      currency: 'USD per 1M tokens'
    },
    conversionRate: USD_TO_INR
  };
}

/**
 * Get detailed pricing information for a specific model
 * @param {string} modelName - The model name
 * @returns {Object} - Pricing details for the model
 */
function getModelPricing(modelName = 'gemini') {
  const USD_TO_INR = 83;
  
  const pricingMap = {
    'gemini': { 
      input: 0.30, 
      output: 1.20,
      description: 'Gemini 2.0 Flash'
    },
    'gemini-pro-2.5': { 
      input: 1.25, 
      output: 5.00,
      description: 'Gemini 2.5 Pro'
    },
    'anthropic': { 
      input: 0.80, 
      output: 4.00,
      description: 'Claude 3.5 Haiku'
    },
    'claude-sonnet-4': { 
      input: 3.00, 
      output: 15.00,
      description: 'Claude 4.0 Sonnet'
    },
    'openai': { 
      input: 0.15, 
      output: 0.60,
      description: 'GPT-4o Mini'
    },
    'gpt-4o': { 
      input: 2.50, 
      output: 10.00,
      description: 'GPT-4o'
    },
    'deepseek': { 
      input: 0.14, 
      output: 0.28,
      description: 'DeepSeek Chat'
    }
  };

  const pricing = pricingMap[modelName] || pricingMap['gemini'];

  return {
    model: modelName,
    description: pricing.description,
    pricing: {
      input: {
        usd: pricing.input,
        inr: pricing.input * USD_TO_INR,
        unit: 'per 1M tokens'
      },
      output: {
        usd: pricing.output,
        inr: pricing.output * USD_TO_INR,
        unit: 'per 1M tokens'
      }
    },
    conversionRate: USD_TO_INR
  };
}

/**
 * Get all available models with their pricing
 * @returns {Object} - All models with pricing information
 */
function getAllModelPricing() {
  const models = [
    'gemini',
    'gemini-pro-2.5',
    'anthropic',
    'claude-sonnet-4',
    'openai',
    'gpt-4o',
    'deepseek'
  ];

  return models.reduce((acc, model) => {
    acc[model] = getModelPricing(model);
    return acc;
  }, {});
}

module.exports = {
  countTokens,
  countConversationTokens,
  countWords,
  calculatePricing,
  getModelPricing,
  getAllModelPricing
};