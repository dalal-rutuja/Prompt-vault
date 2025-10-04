// const { encoding_for_model } = require('tiktoken');

// /**
//  * Count tokens for different LLM models
//  */
// function countTokens(text, modelName = 'gemini') {
//   if (!text || typeof text !== 'string') return 0;

//   try {
//     // Map your model names to tiktoken models
//     const modelMap = {
//       'gemini': 'gpt-4', // Gemini uses similar tokenization to GPT-4
//       'anthropic': 'cl100k_base', // Claude uses cl100k_base encoding
//       'openai': 'gpt-4',
//       'deepseek': 'gpt-4'
//     };

//     const encodingModel = modelMap[modelName] || 'gpt-4';
//     const encoding = encoding_for_model(encodingModel);
//     const tokens = encoding.encode(text);
//     encoding.free(); // Important: free memory
    
//     return tokens.length;
//   } catch (error) {
//     console.error('Token counting error:', error);
//     // Fallback: rough estimate (1 token ≈ 4 characters)
//     return Math.ceil(text.length / 4);
//   }
// }

// /**
//  * Count tokens for a conversation context
//  */
// function countConversationTokens(question, context, modelName = 'gemini') {
//   const questionTokens = countTokens(question, modelName);
//   const contextTokens = countTokens(context, modelName);
  
//   // Add system message overhead (approximate)
//   const systemOverhead = 50;
  
//   return {
//     questionTokens,
//     contextTokens,
//     totalInputTokens: questionTokens + contextTokens + systemOverhead
//   };
// }

// module.exports = {
//   countTokens,
//   countConversationTokens
// };


// const { encoding_for_model } = require('tiktoken');

// /**
//  * Count tokens for different LLM models
//  */
// function countTokens(text, modelName = 'gemini') {
//   if (!text || typeof text !== 'string') return 0;

//   try {
//     const modelMap = {
//       'gemini': 'gpt-4',
//       'anthropic': 'cl100k_base',
//       'openai': 'gpt-4',
//       'deepseek': 'gpt-4'
//     };

//     const encodingModel = modelMap[modelName] || 'gpt-4';
//     const encoding = encoding_for_model(encodingModel);
//     const tokens = encoding.encode(text);
//     encoding.free();

//     return tokens.length;
//   } catch (error) {
//     console.error('Token counting error:', error);
//     return Math.ceil(text.length / 4);
//   }
// }

// /**
//  * Count tokens for a conversation context
//  */
// function countConversationTokens(question, context, modelName = 'gemini') {
//   const questionTokens = countTokens(question, modelName);
//   const contextTokens = countTokens(context, modelName);
//   const systemOverhead = 50;

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
//  * Calculate pricing in INR
//  */
// function calculatePricing(inputTokens, outputTokens) {
//   const rateInput = 0.30 / 1000;   // ₹0.30 per 1K input tokens
//   const rateOutput = 0.60 / 1000;  // ₹0.60 per 1K output tokens

//   const inputCost = inputTokens * rateInput;
//   const outputCost = outputTokens * rateOutput;
//   const totalCost = inputCost + outputCost;

//   return {
//     inputCostINR: inputCost.toFixed(4),
//     outputCostINR: outputCost.toFixed(4),
//     totalCostINR: totalCost.toFixed(4)
//   };
// }

// module.exports = {
//   countTokens,
//   countConversationTokens,
//   countWords,
//   calculatePricing
// };


// // utils/tokenCounter.js
// const { encoding_for_model } = require('tiktoken');

// /**
//  * Count tokens for different LLM models
//  */
// function countTokens(text, modelName = 'gemini') {
//   if (!text || typeof text !== 'string') return 0;

//   try {
//     const modelMap = {
//       'gemini': 'gpt-4',
//       'anthropic': 'cl100k_base',
//       'openai': 'gpt-4',
//       'deepseek': 'gpt-4'
//     };

//     const encodingModel = modelMap[modelName] || 'gpt-4';
//     const encoding = encoding_for_model(encodingModel);
//     const tokens = encoding.encode(text);
//     encoding.free();

//     return tokens.length;
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
//  * Calculate pricing in INR based on Gemini 2.0 Flash pricing
//  * Input: $0.30 per 1M tokens = ₹0.30 per 1K tokens (simplified)
//  * Output: $0.60 per 1M tokens = ₹0.60 per 1K tokens (simplified)
//  */
// function calculatePricing(inputTokens, outputTokens) {
//   const rateInput = 0.30 / 1000;   // ₹0.30 per 1K input tokens
//   const rateOutput = 0.60 / 1000;  // ₹0.60 per 1K output tokens

//   const inputCost = inputTokens * rateInput;
//   const outputCost = outputTokens * rateOutput;
//   const totalCost = inputCost + outputCost;

//   return {
//     inputCostINR: inputCost.toFixed(4),
//     outputCostINR: outputCost.toFixed(4),
//     totalCostINR: totalCost.toFixed(4)
//   };
// }

// module.exports = {
//   countTokens,
//   countConversationTokens,
//   countWords,
//   calculatePricing
// };


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
//       'anthropic': 'gpt-4', // Claude uses similar tokenization to GPT-4
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
//  * Pricing varies by provider:
//  * - Gemini 2.0 Flash: $0.30/$1.20 per 1M tokens (input/output)
//  * - Claude 3.5 Haiku: $0.80/$4.00 per 1M tokens
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
//     'anthropic': { input: 0.80, output: 4.00 },
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
//     totalCostINR: parseFloat(totalCost.toFixed(6))
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
 * - Claude 3.5 Haiku: $0.80/$4.00 per 1M tokens
 * - Claude 4.0 Sonnet: $3.00/$15.00 per 1M tokens
 * - GPT-4o Mini: $0.15/$0.60 per 1M tokens
 * - DeepSeek: $0.14/$0.28 per 1M tokens
 * 
 * Using average USD to INR rate: 1 USD = 83 INR
 */
function calculatePricing(inputTokens, outputTokens, modelName = 'gemini') {
  const USD_TO_INR = 83;
  
  // Pricing per 1M tokens in USD
  const pricingMap = {
    'gemini': { input: 0.30, output: 1.20 },
    'gemini-pro-2.5': { input: 1.25, output: 5.00 },
    'anthropic': { input: 0.80, output: 4.00 },
    'claude-sonnet-4': { input: 3.00, output: 15.00 },
    'openai': { input: 0.15, output: 0.60 },
    'deepseek': { input: 0.14, output: 0.28 }
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
    modelUsed: modelName,
    pricing: pricing
  };
}

module.exports = {
  countTokens,
  countConversationTokens,
  countWords,
  calculatePricing
};