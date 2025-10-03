// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function generateEmbedding(text) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "embedding-001"});
//     const result = await model.embedContent(text);
//     return result.embedding.values;
//   } catch (error) {
//     console.error("❌ Error generating embedding:", error.message);
//     throw new Error("Failed to generate embedding.");
//   }
// }

// async function generateEmbeddings(texts) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "embedding-001"});
//     const result = await model.batchEmbedContents({
//       requests: texts.map(text => ({ content: { parts: [{ text }] } })),
//     });
//     return result.embeddings.map(e => e.values);
//   } catch (error) {
//     console.error("❌ Error generating batch embeddings:", error.message);
//     throw new Error("Failed to generate batch embeddings.");
//   }
// }

// module.exports = {
//   generateEmbedding,
//   generateEmbeddings
// };




// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Retry helper for embeddings
// async function retryWithBackoff(fn, retries = 3, delay = 1000) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await fn();
//     } catch (err) {
//       console.warn(`⚠️ Embedding attempt ${attempt} failed:`, err.message);
//       if (attempt < retries) {
//         await new Promise(res => setTimeout(res, delay * attempt));
//       } else {
//         throw err;
//       }
//     }
//   }
// }

// async function generateEmbedding(text) {
//   try {
//     const runEmbedding = async () => {
//       // Try different embedding model names
//       const modelNames = ['text-embedding-004', 'embedding-001', 'models/embedding-001'];
      
//       for (const modelName of modelNames) {
//         try {
//           const model = genAI.getGenerativeModel({ model: modelName });
          
//           // For Gemini embeddings, use embedContent with proper format
//           const result = await model.embedContent({
//             content: {
//               parts: [{ text: text }]
//             }
//           });
          
//           return result.embedding.values;
//         } catch (modelError) {
//           console.warn(`Model ${modelName} failed:`, modelError.message);
//           if (modelName === modelNames[modelNames.length - 1]) {
//             throw modelError;
//           }
//           continue;
//         }
//       }
//     };
    
//     return await retryWithBackoff(runEmbedding);
//   } catch (error) {
//     console.error("❌ Error generating embedding:", error.message);
//     throw new Error("Failed to generate embedding.");
//   }
// }

// async function generateEmbeddings(texts) {
//   try {
//     const runBatchEmbedding = async () => {
//       // Try different embedding model names
//       const modelNames = ['text-embedding-004', 'embedding-001', 'models/embedding-001'];
      
//       for (const modelName of modelNames) {
//         try {
//           const model = genAI.getGenerativeModel({ model: modelName });
          
//           // For batch embeddings
//           const requests = texts.map(text => ({
//             content: {
//               parts: [{ text: text }]
//             }
//           }));
          
//           const result = await model.batchEmbedContents({
//             requests: requests
//           });
          
//           return result.embeddings.map(e => e.values);
//         } catch (modelError) {
//           console.warn(`Batch model ${modelName} failed:`, modelError.message);
//           if (modelName === modelNames[modelNames.length - 1]) {
//             throw modelError;
//           }
//           continue;
//         }
//       }
//     };
    
//     return await retryWithBackoff(runBatchEmbedding);
//   } catch (error) {
//     console.error("❌ Error generating batch embeddings:", error.message);
    
//     // Fallback: Generate embeddings one by one
//     console.log("🔄 Falling back to individual embedding generation...");
//     try {
//       const embeddings = [];
//       for (const text of texts) {
//         const embedding = await generateEmbedding(text);
//         embeddings.push(embedding);
//         // Small delay between requests
//         await new Promise(res => setTimeout(res, 100));
//       }
//       return embeddings;
//     } catch (fallbackError) {
//       console.error("❌ Fallback embedding generation failed:", fallbackError.message);
//       throw new Error("Failed to generate batch embeddings.");
//     }
//   }
// }

// module.exports = {
//   generateEmbedding,
//   generateEmbeddings
// };


const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Retry helper for embeddings
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`⚠️ Embedding attempt ${attempt} failed:`, err.message);
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delay * attempt));
      } else {
        throw err;
      }
    }
  }
}

async function generateEmbedding(text) {
  try {
    const runEmbedding = async () => {
      // Use correct embedding model names for current API
      const modelNames = ['text-embedding-004', 'models/text-embedding-004', 'embedding-001'];
      
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          
          // For Gemini embeddings, use embedContent with proper format
          const result = await model.embedContent(text);
          
          return result.embedding.values;
        } catch (modelError) {
          console.warn(`Embedding model ${modelName} failed:`, modelError.message);
          if (modelName === modelNames[modelNames.length - 1]) {
            throw modelError;
          }
          continue;
        }
      }
    };
    
    return await retryWithBackoff(runEmbedding);
  } catch (error) {
    console.error("❌ Error generating embedding:", error.message);
    throw new Error("Failed to generate embedding.");
  }
}

async function generateEmbeddings(texts) {
  try {
    const runBatchEmbedding = async () => {
      // Try different embedding model names
      const modelNames = ['text-embedding-004', 'embedding-001', 'models/embedding-001'];
      
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          
          // For batch embeddings
          const requests = texts.map(text => ({
            content: {
              parts: [{ text: text }]
            }
          }));
          
          const result = await model.batchEmbedContents({
            requests: requests
          });
          
          return result.embeddings.map(e => e.values);
        } catch (modelError) {
          console.warn(`Batch model ${modelName} failed:`, modelError.message);
          if (modelName === modelNames[modelNames.length - 1]) {
            throw modelError;
          }
          continue;
        }
      }
    };
    
    return await retryWithBackoff(runBatchEmbedding);
  } catch (error) {
    console.error("❌ Error generating batch embeddings:", error.message);
    
    // Fallback: Generate embeddings one by one
    console.log("🔄 Falling back to individual embedding generation...");
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await generateEmbedding(text);
        embeddings.push(embedding);
        // Small delay between requests
        await new Promise(res => setTimeout(res, 100));
      }
      return embeddings;
    } catch (fallbackError) {
      console.error("❌ Fallback embedding generation failed:", fallbackError.message);
      throw new Error("Failed to generate batch embeddings.");
    }
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddings
};