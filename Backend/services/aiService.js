

// // const axios = require('axios');

// // // Configuration for different LLM providers
// // const LLM_CONFIGS = {
// //   openai: {
// //     apiUrl: 'https://api.openai.com/v1/chat/completions',
// //     model: 'gpt-4o-mini',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
// //     }
// //   },
// //   anthropic: {
// //     apiUrl: 'https://api.anthropic.com/v1/messages',
// //     model: 'claude-3-5-haiku-20241022',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       'x-api-key': process.env.ANTHROPIC_API_KEY,
// //       'anthropic-version': '2023-06-01'
// //     }
// //   },
// //   gemini: {
// //     apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
// //     model: 'gemini-1.5-flash-latest',
// //     headers: {
// //       'Content-Type': 'application/json'
// //     }
// //   },
// //   deepseek: {
// //     apiUrl: 'https://api.deepseek.com/chat/completions',
// //     model: 'deepseek-chat',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
// //     }
// //   }
// // };

// // /**
// //  * Unified LLM service that can handle multiple providers
// //  * @param {string} provider - The LLM provider ('openai', 'anthropic', 'gemini', 'deepseek')
// //  * @param {string} userMessage - The user's question or prompt
// //  * @param {string} context - The context/document content
// //  * @returns {Promise<string>} - The LLM response
// //  */
// // async function askLLM(provider, userMessage, context = '') {
// //   console.log(`[askLLM] provider: ${provider}, userMessage: ${userMessage}, context: ${context}`);
// //   const config = LLM_CONFIGS[provider];
// //   if (!config) {
// //     throw new Error(`Unsupported LLM provider: ${provider}`);
// //   }

// //   try {
// //     let requestBody;
// //     let apiUrl = config.apiUrl;

// //     switch (provider) {
// //       case 'openai':
// //         requestBody = {
// //           model: config.model,
// //           messages: [
// //             {
// //               role: 'system',
// //               content: 'You are a helpful AI assistant that answers questions based on the provided context. If context is provided, use it to answer questions accurately. If no context is provided or the context doesn\'t contain relevant information, provide a helpful response based on your knowledge.'
// //             },
// //             {
// //               role: 'user',
// //               content: context ? `Context: ${context}\n\nQuestion: ${userMessage}` : userMessage
// //             }
// //           ],
// //           max_tokens: 2000,
// //           temperature: 0.7
// //         };
// //         break;

// //       case 'anthropic':
// //         requestBody = {
// //           model: config.model,
// //           max_tokens: 2000,
// //           messages: [
// //             {
// //               role: 'user',
// //               content: context 
// //                 ? `Context: ${context}\n\nQuestion: ${userMessage}` 
// //                 : userMessage
// //             }
// //           ],
// //           system: 'You are a helpful AI assistant that answers questions based on the provided context. If context is provided, use it to answer questions accurately. If no context is provided or the context doesn\'t contain relevant information, provide a helpful response based on your knowledge.'
// //         };
// //         break;

// //       case 'gemini':
// //         // For Gemini, we need to add the API key to the URL
// //         apiUrl = `${config.apiUrl}?key=${process.env.GEMINI_API_KEY}`;
// //         requestBody = {
// //           contents: [
// //             {
// //               parts: [
// //                 {
// //                   text: context 
// //                     ? `Context: ${context}\n\nQuestion: ${userMessage}\n\nPlease answer the question based on the provided context. If the context doesn't contain relevant information, provide a helpful response based on your knowledge.`
// //                     : `${userMessage}\n\nPlease provide a helpful and accurate response.`
// //                 }
// //               ]
// //             }
// //           ],
// //           generationConfig: {
// //             temperature: 0.7,
// //             maxOutputTokens: 2000
// //           }
// //         };
// //         break;

// //       case 'deepseek':
// //         requestBody = {
// //           model: config.model,
// //           messages: [
// //             {
// //               role: 'system',
// //               content: 'You are a helpful AI assistant that answers questions based on the provided context. If context is provided, use it to answer questions accurately. If no context is provided or the context doesn\'t contain relevant information, provide a helpful response based on your knowledge.'
// //             },
// //             {
// //               role: 'user',
// //               content: context ? `Context: ${context}\n\nQuestion: ${userMessage}` : userMessage
// //             }
// //           ],
// //           max_tokens: 2000,
// //           temperature: 0.7
// //         };
// //         break;

// //       default:
// //         throw new Error(`Unsupported provider: ${provider}`);
// //     }

// //     console.log(`[askLLM] Making request to ${provider.toUpperCase()} API`);
    
// //     const response = await axios.post(apiUrl, requestBody, {
// //       headers: config.headers,
// //       timeout: 30000 // 30 second timeout
// //     });

// //     let answer;
    
// //     switch (provider) {
// //       case 'openai':
// //       case 'deepseek':
// //         answer = response.data.choices[0]?.message?.content;
// //         break;
        
// //       case 'anthropic':
// //         answer = response.data.content[0]?.text;
// //         break;
        
// //       case 'gemini':
// //         answer = response.data.candidates[0]?.content?.parts[0]?.text;
// //         break;
        
// //       default:
// //         throw new Error(`Response parsing not implemented for ${provider}`);
// //     }

// //     if (!answer) {
// //       throw new Error(`No response content received from ${provider}`);
// //     }

// //     console.log(`[askLLM] Successfully received response from ${provider.toUpperCase()}`);
// //     return answer;

// //   } catch (error) {
// //     console.error(`[askLLM] Error with ${provider.toUpperCase()} API:`, error.message);
    
// //     if (error.response) {
// //       console.error(`[askLLM] ${provider.toUpperCase()} API Error Status:`, error.response.status);
// //       console.error(`[askLLM] ${provider.toUpperCase()} API Error Data:`, error.response.data);
      
// //       // Handle specific error cases
// //       if (error.response.status === 401) {
// //         throw new Error(`${provider.toUpperCase()} API key is invalid or missing`);
// //       } else if (error.response.status === 429) {
// //         throw new Error(`${provider.toUpperCase()} API rate limit exceeded`);
// //       } else if (error.response.status === 400) {
// //         throw new Error(`${provider.toUpperCase()} API request was invalid: ${error.response.data?.error?.message || 'Unknown error'}`);
// //       }
// //     }
    
// //     throw new Error(`Failed to get response from ${provider.toUpperCase()}: ${error.message}`);
// //   }
// // }

// // /**
// //  * Legacy Gemini-specific function for backward compatibility
// //  * @param {string} context - The document context
// //  * @param {string} question - The user's question
// //  * @returns {Promise<string>} - The AI response
// //  */
// // async function askGemini(context, question) {
// //   return askLLM('gemini', question, context);
// // }

// // /**
// //  * Analyzes a document using the specified LLM provider
// //  * @param {string} documentText - The full document text
// //  * @param {string} provider - The LLM provider to use (defaults to 'gemini')
// //  * @returns {Promise<object>} - Analysis insights
// //  */
// // async function analyzeWithLLM(documentText, provider = 'gemini') {
// //   const analysisPrompt = `Please provide a comprehensive analysis of the following document. Include:

// // 1. Key themes and main topics
// // 2. Important insights and findings  
// // 3. Executive summary
// // 4. Critical points and takeaways
// // 5. Actionable recommendations (if applicable)
// // 6. Potential areas of concern or opportunity

// // Format your response as a structured analysis with clear sections.

// // Document to analyze:
// // ${documentText}`;

// //   const response = await askLLM(provider, analysisPrompt);
  
// //   // Try to structure the response into sections
// //   const sections = response.split('\n').filter(line => line.trim());
  
// //   return {
// //     raw_analysis: response,
// //     structured_analysis: {
// //       summary: sections.slice(0, 3).join(' '),
// //       key_points: sections.slice(3, 8),
// //       recommendations: sections.slice(-3),
// //       full_text: response
// //     }
// //   };
// // }

// // /**
// //  * Legacy Gemini analysis function for backward compatibility
// //  * @param {string} documentText - The document text
// //  * @returns {Promise<object>} - Analysis insights
// //  */
// // async function analyzeWithGemini(documentText) {
// //   return analyzeWithLLM(documentText, 'gemini');
// // }

// // /**
// //  * Generates a summary using the specified LLM provider
// //  * @param {string} text - The text to summarize
// //  * @param {string} provider - The LLM provider to use (defaults to 'gemini')
// //  * @returns {Promise<string>} - The generated summary
// //  */
// // async function getSummaryFromLLM(text, provider = 'gemini') {
// //   const summaryPrompt = `Please provide a comprehensive but concise summary of the following text. Focus on the main points, key findings, and important details. The summary should be informative and capture the essence of the content:

// // ${text}`;

// //   return askLLM(provider, summaryPrompt);
// // }

// // /**
// //  * Legacy Gemini summary function for backward compatibility
// //  * @param {string} text - The text to summarize
// //  * @returns {Promise<string>} - The generated summary
// //  */
// // async function getSummaryFromChunks(text) {
// //   return getSummaryFromLLM(text, 'gemini');
// // }

// // /**
// //  * Get available LLM providers and their status
// //  * @returns {object} - Provider availability status
// //  */
// // function getAvailableProviders() {
// //   const providers = {};
  
// //   Object.keys(LLM_CONFIGS).forEach(provider => {
// //     let available = false;
// //     let reason = '';
    
// //     switch (provider) {
// //       case 'openai':
// //         available = !!process.env.OPENAI_API_KEY;
// //         reason = available ? 'Available' : 'Missing OPENAI_API_KEY environment variable';
// //         break;
// //       case 'anthropic':
// //         available = !!process.env.ANTHROPIC_API_KEY;
// //         reason = available ? 'Available' : 'Missing ANTHROPIC_API_KEY environment variable';
// //         break;
// //       case 'gemini':
// //         available = !!process.env.GEMINI_API_KEY;
// //         reason = available ? 'Available' : 'Missing GEMINI_API_KEY environment variable';
// //         break;
// //       case 'deepseek':
// //         available = !!process.env.DEEPSEEK_API_KEY;
// //         reason = available ? 'Available' : 'Missing DEEPSEEK_API_KEY environment variable';
// //         break;
// //       default:
// //         available = false;
// //         reason = 'Unknown provider';
// //     }
    
// //     providers[provider] = {
// //       available,
// //       reason,
// //       model: LLM_CONFIGS[provider].model
// //     };
// //   });
  
// //   return providers;
// // }

// // /**
// //  * Health check for LLM providers
// //  * @param {string} provider - The provider to test
// //  * @returns {Promise<object>} - Health check result
// //  */
// // async function healthCheck(provider) {
// //   try {
// //     const testMessage = "Hello, this is a test message.";
// //     const response = await askLLM(provider, testMessage);
    
// //     return {
// //       provider,
// //       status: 'healthy',
// //       response_received: !!response,
// //       response_length: response ? response.length : 0
// //     };
// //   } catch (error) {
// //     return {
// //       provider,
// //       status: 'unhealthy',
// //       error: error.message
// //     };
// //   }
// // }

// // module.exports = {
// //   // New unified functions
// //   askLLM,
// //   analyzeWithLLM,
// //   getSummaryFromLLM,
// //   getAvailableProviders,
// //   healthCheck,
  
// //   // Legacy functions for backward compatibility
// //   askGemini,
// //   analyzeWithGemini,
// //   getSummaryFromChunks,
  
// //   // Configuration
// //   LLM_CONFIGS
// // };


// const axios = require("axios");

// // Configuration for different LLM providers
// const LLM_CONFIGS = {
//   openai: {
//     apiUrl: "https://api.openai.com/v1/chat/completions",
//     model: "gpt-4o-mini",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//   },
//   anthropic: {
//     apiUrl: "https://api.anthropic.com/v1/messages",
//     model: "claude-3-5-haiku-20241022",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.ANTHROPIC_API_KEY,
//       "anthropic-version": "2023-06-01",
//     },
//   },
//   gemini: {
//     apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
//     model: "gemini-1.5-flash-latest",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   },
//   deepseek: {
//     apiUrl: "https://api.deepseek.com/chat/completions",
//     model: "deepseek-chat",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//     },
//   },
// };

// /**
//  * Unified LLM service
//  * @param {string} provider - "openai" | "anthropic" | "gemini" | "deepseek"
//  * @param {string} userMessage - user’s question/prompt
//  * @param {string} context - optional context/document content
//  */
// async function askLLM(provider, userMessage, context = "") {
//   console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

//   const config = LLM_CONFIGS[provider];
//   if (!config) {
//     throw new Error(`Unsupported LLM provider: ${provider}`);
//   }

//   try {
//     let requestBody;
//     let apiUrl = config.apiUrl;

//     switch (provider) {
//       case "openai":
//       case "deepseek":
//         requestBody = {
//           model: config.model,
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a helpful AI assistant. Use provided context if available, otherwise answer from general knowledge.",
//             },
//             {
//               role: "user",
//               content: context
//                 ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                 : userMessage,
//             },
//           ],
//           max_tokens: 2000,
//           temperature: 0.7,
//         };
//         break;

//       case "anthropic":
//         requestBody = {
//           model: config.model,
//           max_tokens: 2000,
//           system:
//             "You are a helpful AI assistant. Use provided context if available, otherwise answer from general knowledge.",
//           messages: [
//             {
//               role: "user",
//               content: context
//                 ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                 : userMessage,
//             },
//           ],
//         };
//         break;

//       case "gemini":
//         apiUrl = `${config.apiUrl}?key=${process.env.GEMINI_API_KEY}`;
//         requestBody = {
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 {
//                   text: context
//                     ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                     : userMessage,
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2000,
//           },
//         };
//         break;
//     }

//     const response = await axios.post(apiUrl, requestBody, {
//       headers: config.headers,
//       timeout: 30000,
//     });

//     let answer;
//     switch (provider) {
//       case "openai":
//       case "deepseek":
//         answer = response.data.choices?.[0]?.message?.content;
//         break;
//       case "anthropic":
//         answer = response.data.content?.[0]?.text;
//         break;
//       case "gemini":
//         answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
//         break;
//     }

//     if (!answer) {
//       throw new Error(`Empty response from ${provider.toUpperCase()}`);
//     }

//     console.log(`[askLLM] ✅ Got response from ${provider.toUpperCase()} (${answer.length} chars)`);
//     return answer;
//   } catch (err) {
//     console.error(`[askLLM] ❌ ${provider.toUpperCase()} error:`, err.message);
//     if (err.response) {
//       console.error("Status:", err.response.status);
//       console.error("Data:", err.response.data);
//     }
//     throw new Error(`Failed to get response from ${provider}: ${err.message}`);
//   }
// }

// // --- Legacy wrappers (for backward compatibility) ---
// async function askGemini(context, question) {
//   return askLLM("gemini", question, context);
// }

// async function analyzeWithLLM(documentText, provider = "gemini") {
//   const prompt = `Analyze this document thoroughly:

// ${documentText}

// Return key themes, summary, critical points, and recommendations.`;

//   return askLLM(provider, prompt);
// }

// async function getSummaryFromLLM(text, provider = "gemini") {
//   const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
//   return askLLM(provider, prompt);
// }

// function getAvailableProviders() {
//   return Object.fromEntries(
//     Object.entries(LLM_CONFIGS).map(([provider, cfg]) => {
//       let keyAvailable = false;
//       let reason = "";
//       switch (provider) {
//         case "openai":
//           keyAvailable = !!process.env.OPENAI_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing OPENAI_API_KEY";
//           break;
//         case "anthropic":
//           keyAvailable = !!process.env.ANTHROPIC_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing ANTHROPIC_API_KEY";
//           break;
//         case "gemini":
//           keyAvailable = !!process.env.GEMINI_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing GEMINI_API_KEY";
//           break;
//         case "deepseek":
//           keyAvailable = !!process.env.DEEPSEEK_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing DEEPSEEK_API_KEY";
//           break;
//       }
//       return [provider, { available: keyAvailable, reason, model: cfg.model }];
//     })
//   );
// }

// module.exports = {
//   askLLM,
//   askGemini,
//   analyzeWithLLM,
//   getSummaryFromLLM,
//   getAvailableProviders,
// };
// const axios = require("axios");

// // Configuration for different LLM providers
// const LLM_CONFIGS = {
//   openai: {
//     apiUrl: "https://api.openai.com/v1/chat/completions",
//     model: "gpt-4o-mini",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//   },
//   anthropic: {
//     apiUrl: "https://api.anthropic.com/v1/messages",
//     model: "claude-3-5-haiku-20241022",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.ANTHROPIC_API_KEY,
//       "anthropic-version": "2023-06-01",
//     },
//   },
//   gemini: {
//     apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`,
//     model: "gemini-1.5-flash-latest",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   },
//   deepseek: {
//     apiUrl: "https://api.deepseek.com/chat/completions",
//     model: "deepseek-chat",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//     },
//   },
// };

// /**
//  * Unified LLM service
//  * @param {string} provider - "openai" | "anthropic" | "gemini" | "deepseek"
//  * @param {string} userMessage - user’s question/prompt
//  * @param {string} context - optional context/document content
//  */
// async function askLLM(provider, userMessage, context = "") {
//   console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

//   const config = LLM_CONFIGS[provider];
//   if (!config) {
//     throw new Error(`Unsupported LLM provider: ${provider}`);
//   }

//   try {
//     let requestBody;
//     let apiUrl = config.apiUrl;

//     switch (provider) {
//       case "openai":
//       case "deepseek":
//         requestBody = {
//           model: config.model,
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a helpful AI assistant. Use provided context if available, otherwise answer from general knowledge.",
//             },
//             {
//               role: "user",
//               content: context
//                 ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                 : userMessage,
//             },
//           ],
//           max_tokens: 2000,
//           temperature: 0.7,
//         };
//         break;

//       case "anthropic":
//         requestBody = {
//           model: config.model,
//           max_tokens: 2000,
//           system:
//             "You are a helpful AI assistant. Use provided context if available, otherwise answer from general knowledge.",
//           messages: [
//             {
//               role: "user",
//               content: context
//                 ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                 : userMessage,
//             },
//           ],
//         };
//         break;

//       case "gemini":
//         apiUrl = `${config.apiUrl}?key=${process.env.GEMINI_API_KEY}`;
//         requestBody = {
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 {
//                   text: context
//                     ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//                     : userMessage,
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2000,
//           },
//         };
//         break;
//     }

//     const response = await axios.post(apiUrl, requestBody, {
//       headers: config.headers,
//       timeout: 30000,
//     });

//     let answer;
//     switch (provider) {
//       case "openai":
//       case "deepseek":
//         answer = response.data.choices?.[0]?.message?.content;
//         break;
//       case "anthropic":
//         answer = response.data.content?.[0]?.text;
//         break;
//       case "gemini":
//         answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
//         break;
//     }

//     if (!answer) {
//       throw new Error(`Empty response from ${provider.toUpperCase()}`);
//     }

//     console.log(`[askLLM] ✅ Got response from ${provider.toUpperCase()} (${answer.length} chars)`);
//     return answer;
//   } catch (err) {
//     console.error(`[askLLM] ❌ ${provider.toUpperCase()} error:`, err.message);
//     if (err.response) {
//       console.error("Status:", err.response.status);
//       console.error("Data:", err.response.data);
//     }
//     throw new Error(`Failed to get response from ${provider}: ${err.message}`);
//   }
// }

// // --- Wrappers (renamed for backward compatibility with controller) ---
// async function askGemini(context, question) {
//   return askLLM("gemini", question, context);
// }

// // ✅ RENAMED to match what controller is calling
// async function analyzeWithGemini(documentText) {
//   const prompt = `Analyze this document thoroughly:

// ${documentText}

// Return key themes, summary, critical points, and recommendations.`;
//   // Defaults to Gemini as the original function name implies
//   return askLLM("gemini", prompt);
// }

// // ✅ RENAMED to match what controller is calling
// async function getSummaryFromChunks(text) {
//   const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
//   // Defaults to Gemini as the original function name implies
//   return askLLM("gemini", prompt);
// }

// function getAvailableProviders() {
//   return Object.fromEntries(
//     Object.entries(LLM_CONFIGS).map(([provider, cfg]) => {
//       let keyAvailable = false;
//       let reason = "";
//       switch (provider) {
//         case "openai":
//           keyAvailable = !!process.env.OPENAI_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing OPENAI_API_KEY";
//           break;
//         case "anthropic":
//           keyAvailable = !!process.env.ANTHROPIC_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing ANTHROPIC_API_KEY";
//           break;
//         case "gemini":
//           keyAvailable = !!process.env.GEMINI_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing GEMINI_API_KEY";
//           break;
//         case "deepseek":
//           keyAvailable = !!process.env.DEEPSEEK_API_KEY;
//           reason = keyAvailable ? "Available" : "Missing DEEPSEEK_API_KEY";
//           break;
//       }
//       return [provider, { available: keyAvailable, reason, model: cfg.model }];
//     })
//   );
// }

// // ✅ CORRECTED: Exporting all necessary functions with the correct names
// module.exports = {
//   askLLM,
//   askGemini,
//   analyzeWithGemini,
//   getSummaryFromChunks,
//   getAvailableProviders,
// };
// require('dotenv').config();
// const axios = require('axios');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

// // ---------------------------
// // Helper: Retry with exponential backoff
// // ---------------------------
// async function retryWithBackoff(fn, retries = 3, delay = 2000) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await fn();
//     } catch (err) {
//       console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
//       if (
//         err.message.includes('overloaded') ||
//         err.message.includes('503') ||
//         err.message.includes('temporarily unavailable')
//       ) {
//         if (attempt < retries) await new Promise(res => setTimeout(res, delay));
//         else throw new Error('LLM provider is temporarily unavailable. Please try again later.');
//       } else throw err;
//     }
//   }
// }

// // ---------------------------
// // LLM Configurations for HTTP-based providers
// // ---------------------------
// const LLM_CONFIGS = {
//   openai: {
//     apiUrl: 'https://api.openai.com/v1/chat/completions',
//     model: 'gpt-4o-mini',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//   },
//   anthropic: {
//     apiUrl: 'https://api.anthropic.com/v1/messages',
//     model: 'claude-3-5-haiku-20241022',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': process.env.ANTHROPIC_API_KEY,
//       'anthropic-version': '2023-06-01',
//     },
//   },
//   deepseek: {
//     apiUrl: 'https://api.deepseek.com/chat/completions',
//     model: 'deepseek-chat',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//     },
//   },
// };

// // ---------------------------
// // Unified askLLM function
// // ---------------------------
// async function askLLM(provider, userMessage, context = '') {
//   console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

//   if (provider === 'gemini') {
//     // Gemini via official SDK
//     const runGemini = async () => {
//       const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
//       const prompt = context
//         ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//         : userMessage;

//       const result = await model.generateContent({
//         prompt,
//         temperature: 0.7,
//         maxOutputTokens: 2000
//       });

//       return result.response.text().trim();
//     };
//     return retryWithBackoff(runGemini);
//   }

//   const config = LLM_CONFIGS[provider];
//   if (!config) throw new Error(`Unsupported LLM provider: ${provider}`);

//   const runHttpProvider = async () => {
//     let requestBody;
//     switch (provider) {
//       case 'openai':
//       case 'deepseek':
//         requestBody = {
//           model: config.model,
//           messages: [
//             { role: 'system', content: 'You are a helpful AI assistant. Use context if available.' },
//             { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
//           ],
//           max_tokens: 2000,
//           temperature: 0.7,
//         };
//         break;

//       case 'anthropic':
//         requestBody = {
//           model: config.model,
//           max_tokens: 2000,
//           system: 'You are a helpful AI assistant. Use context if available.',
//           messages: [
//             { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
//           ],
//         };
//         break;
//     }

//     const response = await axios.post(config.apiUrl, requestBody, { headers: config.headers, timeout: 30000 });

//     let answer;
//     switch (provider) {
//       case 'openai':
//       case 'deepseek':
//         answer = response.data?.choices?.[0]?.message?.content;
//         break;
//       case 'anthropic':
//         answer = response.data?.content?.[0]?.text || response.data?.completion;
//         break;
//     }

//     if (!answer) throw new Error(`Empty response from ${provider.toUpperCase()}`);
//     return answer;
//   };

//   return retryWithBackoff(runHttpProvider);
// }

// // ---------------------------
// // Gemini Wrappers
// // ---------------------------
// async function askGemini(context, question) {
//   return askLLM('gemini', question, context);
// }

// async function analyzeWithGemini(documentText) {
//   const prompt = `Analyze this document thoroughly:\n\n${documentText}\n\nReturn key themes, summary, critical points, and recommendations.`;
//   return askLLM('gemini', prompt);
// }

// async function getSummaryFromChunks(text) {
//   const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
//   return askLLM('gemini', prompt);
// }

// // ---------------------------
// // List available providers
// // ---------------------------
// function getAvailableProviders() {
//   return Object.fromEntries(
//     Object.entries({ ...LLM_CONFIGS, gemini: { model: 'gemini-2.5-flash', headers: {} } }).map(([provider, cfg]) => {
//       const key = process.env[`${provider.toUpperCase()}_API_KEY`];
//       return [
//         provider,
//         {
//           available: !!key || provider === 'gemini',
//           reason: key || provider === 'gemini' ? 'Available' : `Missing ${provider.toUpperCase()}_API_KEY`,
//           model: cfg.model
//         }
//       ];
//     })
//   );
// }

// module.exports = {
//   askLLM,
//   askGemini,
//   analyzeWithGemini,
//   getSummaryFromChunks,
//   getAvailableProviders,
// };


// require('dotenv').config();
// const axios = require('axios');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // ---------------------------
// // Helper: Retry with exponential backoff
// // ---------------------------
// async function retryWithBackoff(fn, retries = 3, delay = 2000) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await fn();
//     } catch (err) {
//       console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
//       if (
//         err.message.includes('overloaded') ||
//         err.message.includes('503') ||
//         err.message.includes('temporarily unavailable')
//       ) {
//         if (attempt < retries) await new Promise(res => setTimeout(res, delay));
//         else throw new Error('LLM provider is temporarily unavailable. Please try again later.');
//       } else throw err;
//     }
//   }
// }

// // ---------------------------
// // LLM Configurations for HTTP-based providers
// // ---------------------------
// const LLM_CONFIGS = {
//   openai: {
//     apiUrl: 'https://api.openai.com/v1/chat/completions',
//     model: 'gpt-4o-mini',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//   },
//   anthropic: {
//     apiUrl: 'https://api.anthropic.com/v1/messages',
//     model: 'claude-3-5-haiku-20241022',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': process.env.ANTHROPIC_API_KEY,
//       'anthropic-version': '2023-06-01',
//     },
//   },
//   deepseek: {
//     apiUrl: 'https://api.deepseek.com/chat/completions',
//     model: 'deepseek-chat',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//     },
//   },
// };

// // ---------------------------
// // Unified askLLM function
// // ---------------------------
// async function askLLM(provider, userMessage, context = '') {
//   console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

//   if (provider === 'gemini') {
//     // Gemini via official SDK - FIXED
//     const runGemini = async () => {
//       // Try different model names in order of preference
//       const modelNames = [
//         'gemini-pro',
//         'gemini-1.5-pro-latest',
//         'gemini-1.5-flash-latest',
//         'gemini-1.0-pro'
//       ];
      
//       let lastError;
      
//       for (const modelName of modelNames) {
//         try {
//           const model = genAI.getGenerativeModel({ model: modelName });
//           const prompt = context
//             ? `Context:\n${context}\n\nQuestion: ${userMessage}`
//             : userMessage;

//           const result = await model.generateContent(prompt);
//           const response = await result.response;
//           return response.text().trim();
//         } catch (error) {
//           console.warn(`Model ${modelName} failed:`, error.message);
//           lastError = error;
//           continue;
//         }
//       }
      
//       throw lastError || new Error('All Gemini models failed');
//     };
//     return retryWithBackoff(runGemini);
//   }

//   const config = LLM_CONFIGS[provider];
//   if (!config) throw new Error(`Unsupported LLM provider: ${provider}`);

//   const runHttpProvider = async () => {
//     let requestBody;
//     switch (provider) {
//       case 'openai':
//       case 'deepseek':
//         requestBody = {
//           model: config.model,
//           messages: [
//             { role: 'system', content: 'You are a helpful AI assistant. Use context if available.' },
//             { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
//           ],
//           max_tokens: 2000,
//           temperature: 0.7,
//         };
//         break;

//       case 'anthropic':
//         requestBody = {
//           model: config.model,
//           max_tokens: 2000,
//           system: 'You are a helpful AI assistant. Use context if available.',
//           messages: [
//             { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
//           ],
//         };
//         break;
//     }

//     const response = await axios.post(config.apiUrl, requestBody, { headers: config.headers, timeout: 30000 });

//     let answer;
//     switch (provider) {
//       case 'openai':
//       case 'deepseek':
//         answer = response.data?.choices?.[0]?.message?.content;
//         break;
//       case 'anthropic':
//         answer = response.data?.content?.[0]?.text || response.data?.completion;
//         break;
//     }

//     if (!answer) throw new Error(`Empty response from ${provider.toUpperCase()}`);
//     return answer;
//   };

//   return retryWithBackoff(runHttpProvider);
// }

// // ---------------------------
// // Gemini Wrappers
// // ---------------------------
// async function askGemini(context, question) {
//   return askLLM('gemini', question, context);
// }

// async function analyzeWithGemini(documentText) {
//   const prompt = `Analyze this document thoroughly:\n\n${documentText}\n\nReturn key themes, summary, critical points, and recommendations.`;
//   return askLLM('gemini', prompt);
// }

// async function getSummaryFromChunks(text) {
//   const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
//   return askLLM('gemini', prompt);
// }

// // ---------------------------
// // List available providers
// // ---------------------------
// function getAvailableProviders() {
//   return Object.fromEntries(
//     Object.entries({ ...LLM_CONFIGS, gemini: { model: 'gemini-pro', headers: {} } }).map(([provider, cfg]) => {
//       const key = process.env[`${provider.toUpperCase()}_API_KEY`];
//       return [
//         provider,
//         {
//           available: !!key || provider === 'gemini',
//           reason: key || provider === 'gemini' ? 'Available' : `Missing ${provider.toUpperCase()}_API_KEY`,
//           model: cfg.model
//         }
//       ];
//     })
//   );
// }

// module.exports = {
//   askLLM,
//   askGemini,
//   analyzeWithGemini,
//   getSummaryFromChunks,
//   getAvailableProviders,
// };


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
// Unified askLLM function
// ---------------------------
async function askLLM(provider, userMessage, context = '') {
  console.log(`[askLLM] provider=${provider}, messageLen=${userMessage.length}, contextLen=${context.length}`);

  if (provider === 'gemini') {
    // Gemini via official SDK - Using GCP Gemini 2.0 Flash
    const runGemini = async () => {
      // Use GCP Gemini 2.0 Flash model names
      const modelNames = [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
      ];
      
      let lastError;
      
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = context
            ? `Context:\n${context}\n\nQuestion: ${userMessage}`
            : userMessage;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text().trim();
        } catch (error) {
          console.warn(`Model ${modelName} failed:`, error.message);
          lastError = error;
          
          // If it's a 404 for model not found, try the next model
          if (error.message.includes('404') || error.message.includes('not found')) {
            continue;
          }
          
          // For other errors, still try the next model but log more details
          console.error(`Detailed error for ${modelName}:`, error);
          continue;
        }
      }
      
      // If all models failed, throw a more informative error
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    };
    return retryWithBackoff(runGemini);
  }

  const config = LLM_CONFIGS[provider];
  if (!config) throw new Error(`Unsupported LLM provider: ${provider}`);

  const runHttpProvider = async () => {
    let requestBody;
    switch (provider) {
      case 'openai':
      case 'deepseek':
        requestBody = {
          model: config.model,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant. Use context if available.' },
            { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        };
        break;

      case 'anthropic':
        requestBody = {
          model: config.model,
          max_tokens: 2000,
          system: 'You are a helpful AI assistant. Use context if available.',
          messages: [
            { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${userMessage}` : userMessage },
          ],
        };
        break;
    }

    const response = await axios.post(config.apiUrl, requestBody, { headers: config.headers, timeout: 30000 });

    let answer;
    switch (provider) {
      case 'openai':
      case 'deepseek':
        answer = response.data?.choices?.[0]?.message?.content;
        break;
      case 'anthropic':
        answer = response.data?.content?.[0]?.text || response.data?.completion;
        break;
    }

    if (!answer) throw new Error(`Empty response from ${provider.toUpperCase()}`);
    return answer;
  };

  return retryWithBackoff(runHttpProvider);
}

// ---------------------------
// Gemini Wrappers
// ---------------------------
async function askGemini(context, question) {
  return askLLM('gemini', question, context);
}

async function analyzeWithGemini(documentText) {
  const prompt = `Analyze this document thoroughly:\n\n${documentText}\n\nReturn key themes, summary, critical points, and recommendations.`;
  return askLLM('gemini', prompt);
}

async function getSummaryFromChunks(text) {
  const prompt = `Summarize this text clearly and concisely:\n\n${text}`;
  return askLLM('gemini', prompt);
}

// ---------------------------
// List available providers
// ---------------------------
function getAvailableProviders() {
  return Object.fromEntries(
    Object.entries({ ...LLM_CONFIGS, gemini: { model: 'gemini-2.0-flash-exp', headers: {} } }).map(([provider, cfg]) => {
      const key = process.env[`${provider.toUpperCase()}_API_KEY`];
      return [
        provider,
        {
          available: !!key || provider === 'gemini',
          reason: key || provider === 'gemini' ? 'Available' : `Missing ${provider.toUpperCase()}_API_KEY`,
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