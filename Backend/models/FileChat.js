
// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// const FileChat = {
//   /**
//    * Save a new chat entry for a document.
//    * - Stores the prompt label instead of actual prompt if usedSecretPrompt is true.
//    * 
//    * @param {uuid} fileId 
//    * @param {uuid} userId 
//    * @param {string} question - actual question or prompt label
//    * @param {string} answer 
//    * @param {uuid|null} sessionId 
//    * @param {int[]} usedChunkIds 
//    * @param {boolean} usedSecretPrompt 
//    * @param {string|null} promptLabel 
//    * @returns {object} - { id, session_id }
//    */
//   async saveChat(
//     fileId,
//     userId,
//     question,
//     answer,
//     sessionId,
//     usedChunkIds = [],
//     usedSecretPrompt = false,
//     promptLabel = null
//   ) {
//     const currentSessionId = sessionId || uuidv4(); // If no session ID, generate one

//     const res = await pool.query(
//       `
//       INSERT INTO file_chats
//         (file_id, user_id, question, answer, session_id, used_chunk_ids, used_secret_prompt, prompt_label, created_at)
//       VALUES
//         ($1::uuid, $2, $3, $4, $5, $6::int[], $7, $8, NOW())
//       RETURNING id, session_id
//       `,
//       [
//         fileId,
//         userId,
//         question,
//         answer,
//         currentSessionId,
//         usedChunkIds,
//         usedSecretPrompt,
//         promptLabel
//       ]
//     );

//     return res.rows[0];
//   },

//   /**
//    * Fetch chat history for a given file (optionally filtered by session)
//    * @param {uuid} fileId 
//    * @param {uuid|null} sessionId 
//    * @returns {array} rows
//    */
//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, created_at
//       FROM file_chats
//       WHERE file_id = $1::uuid
//     `;
//     const params = [fileId];

//     if (sessionId) {
//       query += ` AND session_id = $2`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;

//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   /**
//    * Fetch chat history for a specific user
//    * @param {uuid} userId 
//    * @returns {array} rows
//    */
//   async getChatHistoryByUserId(userId) {
//     const query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at ASC
//     `;

//     const res = await pool.query(query, [userId]);
//     return res.rows;
//   }
// };

// module.exports = FileChat;


// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// function isValidUUID(str) {
//   const uuidRegex =
//     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//   return uuidRegex.test(str);
// }

// const FileChat = {
//   /**
//    * Save a new chat entry for a document.
//    * - Stores the prompt label instead of actual prompt if usedSecretPrompt is true.
//    *
//    * @param {uuid} fileId
//    * @param {uuid} userId
//    * @param {string} question - actual question or prompt label
//    * @param {string} answer
//    * @param {uuid|null} sessionId
//    * @param {int[]} usedChunkIds
//    * @param {boolean} usedSecretPrompt
//    * @param {string|null} promptLabel
//    * @returns {object} - { id, session_id }
//    */
//   async saveChat(
//     fileId,
//     userId,
//     question,
//     answer,
//     sessionId,
//     usedChunkIds = [],
//     usedSecretPrompt = false,
//     promptLabel = null,
//     llmModelName = null
//   ) {
//     // ✅ Ensure we always store a valid UUID
//     const currentSessionId = isValidUUID(sessionId) ? sessionId : uuidv4();

//     const res = await pool.query(
//       `
//       INSERT INTO file_chats
//         (file_id, user_id, question, answer, session_id, used_chunk_ids, used_secret_prompt, prompt_label, llm_model_name, created_at)
//       VALUES
//         ($1::uuid, $2, $3, $4, $5::uuid, $6::int[], $7, $8, $9, NOW())
//       RETURNING id, session_id
//       `,
//       [
//         fileId,
//         userId,
//         question,
//         answer,
//         currentSessionId,
//         usedChunkIds,
//         usedSecretPrompt,
//         promptLabel,
//         llmModelName,
//       ]
//     );

//     return res.rows[0];
//   },

//   /**
//    * Fetch chat history for a given file (optionally filtered by session)
//    * @param {uuid} fileId
//    * @param {uuid|null} sessionId
//    * @returns {array} rows
//    */
//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, llm_model_name, created_at
//       FROM file_chats
//       WHERE file_id = $1::uuid
//     `;
//     const params = [fileId];

//     if (sessionId && isValidUUID(sessionId)) {
//       query += ` AND session_id = $2::uuid`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;

//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   /**
//    * Fetch chat history for a specific user
//    * @param {uuid} userId
//    * @returns {array} rows
//    */
//   async getChatHistoryByUserId(userId) {
//     const query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, llm_model_name, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at ASC
//     `;

//     const res = await pool.query(query, [userId]);
//     return res.rows;
//   },
// };

// module.exports = FileChat;




// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// function isValidUUID(str) {
//   const uuidRegex =
//     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//   return uuidRegex.test(str);
// }

// const FileChat = {
//   // async saveChat(
//   //   fileId,
//   //   userId,
//   //   question,
//   //   answer,
//   //   sessionId,
//   //   usedChunkIds = [],
//   //   usedSecretPrompt = false,
//   //   promptLabel = null,
//   //   llmModelName = null,
//   //   tokenUsage = null
//   // ) {
//   //   const currentSessionId = isValidUUID(sessionId) ? sessionId : uuidv4();

//   //   const promptTokens = tokenUsage?.promptTokens || 0;
//   //   const completionTokens = tokenUsage?.completionTokens || 0;
//   //   const totalTokens = tokenUsage?.totalTokens || 0;

//   //   const res = await pool.query(
//   //     `INSERT INTO file_chats
//   //       (file_id, user_id, question, answer, session_id, used_chunk_ids, 
//   //        used_secret_prompt, prompt_label, llm_model_name, 
//   //        prompt_tokens, completion_tokens, total_tokens, created_at)
//   //     VALUES
//   //       ($1::uuid, $2, $3, $4, $5::uuid, $6::int[], $7, $8, $9, $10, $11, $12, NOW())
//   //     RETURNING id, session_id`,
//   //     [
//   //       fileId, userId, question, answer, currentSessionId, usedChunkIds,
//   //       usedSecretPrompt, promptLabel, llmModelName,
//   //       promptTokens, completionTokens, totalTokens
//   //     ]
//   //   );

//   //   if (tokenUsage && totalTokens > 0) {
//   //     await this.updateDailyTokenUsage(userId, tokenUsage);
//   //   }

//   //   return res.rows[0];
//   // },

//   async saveChat(fileId, userId, question, answer, sessionId, usedChunkIds = [], usedSecretPrompt = false, promptLabel = null, llmModelName = null, tokenUsage = null) {
//   const currentSessionId = isValidUUID(sessionId) ? sessionId : uuidv4();

//   const res = await pool.query(
//     `INSERT INTO file_chats
//       (file_id, user_id, question, answer, session_id, used_chunk_ids, 
//        used_secret_prompt, prompt_label, llm_model_name, 
//        prompt_tokens, completion_tokens, total_tokens, word_count, char_count,
//        input_cost_inr, output_cost_inr, total_cost_inr, created_at)
//      VALUES
//       ($1::uuid, $2, $3, $4, $5::uuid, $6::int[], $7, $8, $9,
//        $10, $11, $12, $13, $14, $15, $16, $17, NOW())
//      RETURNING id, session_id`,
//     [
//       fileId, userId, question, answer, currentSessionId, usedChunkIds,
//       usedSecretPrompt, promptLabel, llmModelName,
//       tokenUsage?.promptTokens || 0, tokenUsage?.completionTokens || 0, tokenUsage?.totalTokens || 0,
//       tokenUsage?.wordCount || 0, tokenUsage?.charCount || 0,
//       tokenUsage?.inputCostINR || 0, tokenUsage?.outputCostINR || 0, tokenUsage?.totalCostINR || 0
//     ]
//   );

//   return res.rows[0];
// },


//   async updateDailyTokenUsage(userId, tokenUsage) {
//     try {
//       await pool.query(
//         `INSERT INTO user_token_usage 
//           (user_id, date, total_prompt_tokens, total_completion_tokens, total_tokens, total_queries)
//         VALUES ($1, CURRENT_DATE, $2, $3, $4, 1)
//         ON CONFLICT (user_id, date)
//         DO UPDATE SET
//           total_prompt_tokens = user_token_usage.total_prompt_tokens + $2,
//           total_completion_tokens = user_token_usage.total_completion_tokens + $3,
//           total_tokens = user_token_usage.total_tokens + $4,
//           total_queries = user_token_usage.total_queries + 1,
//           updated_at = CURRENT_TIMESTAMP`,
//         [userId, tokenUsage.promptTokens || 0, tokenUsage.completionTokens || 0, tokenUsage.totalTokens || 0]
//       );
//     } catch (error) {
//       console.error('Error updating daily token usage:', error);
//     }
//   },

//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, llm_model_name,
//              prompt_tokens, completion_tokens, total_tokens, created_at
//       FROM file_chats
//       WHERE file_id = $1::uuid`;
//     const params = [fileId];

//     if (sessionId && isValidUUID(sessionId)) {
//       query += ` AND session_id = $2::uuid`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;
//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   async getChatHistoryByUserId(userId) {
//     const res = await pool.query(
//       `SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
//              used_secret_prompt, prompt_label, llm_model_name,
//              prompt_tokens, completion_tokens, total_tokens, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at DESC`,
//       [userId]
//     );
//     return res.rows;
//   },

//   async getUserTokenStats(userId, days = 30) {
//     const res = await pool.query(
//       `SELECT 
//         COALESCE(SUM(total_prompt_tokens), 0)::int as total_prompt_tokens,
//         COALESCE(SUM(total_completion_tokens), 0)::int as total_completion_tokens,
//         COALESCE(SUM(total_tokens), 0)::int as total_tokens,
//         COALESCE(SUM(total_queries), 0)::int as total_queries,
//         COUNT(DISTINCT date)::int as active_days
//       FROM user_token_usage
//       WHERE user_id = $1 
//         AND date >= CURRENT_DATE - $2::int * INTERVAL '1 day'`,
//       [userId, days]
//     );
//     return res.rows[0];
//   },

//   async getDailyTokenUsage(userId, days = 7) {
//     const res = await pool.query(
//       `SELECT date, total_prompt_tokens, total_completion_tokens, total_tokens, total_queries
//       FROM user_token_usage
//       WHERE user_id = $1 
//         AND date >= CURRENT_DATE - $2::int * INTERVAL '1 day'
//       ORDER BY date DESC`,
//       [userId, days]
//     );
//     return res.rows;
//   },
//   async updateDailyTokenUsage(userId, tokenUsage) {
//   try {
//     await pool.query(
//       `INSERT INTO user_token_usage 
//         (user_id, date, total_prompt_tokens, total_completion_tokens, total_tokens, total_queries,
//          total_input_cost_inr, total_output_cost_inr, total_cost_inr)
//       VALUES ($1, CURRENT_DATE, $2, $3, $4, 1, $5, $6, $7)
//       ON CONFLICT (user_id, date)
//       DO UPDATE SET
//         total_prompt_tokens = user_token_usage.total_prompt_tokens + $2,
//         total_completion_tokens = user_token_usage.total_completion_tokens + $3,
//         total_tokens = user_token_usage.total_tokens + $4,
//         total_queries = user_token_usage.total_queries + 1,
//         total_input_cost_inr = user_token_usage.total_input_cost_inr + $5,
//         total_output_cost_inr = user_token_usage.total_output_cost_inr + $6,
//         total_cost_inr = user_token_usage.total_cost_inr + $7,
//         updated_at = CURRENT_TIMESTAMP`,
//       [
//         userId,
//         tokenUsage.promptTokens || 0,
//         tokenUsage.completionTokens || 0,
//         tokenUsage.totalTokens || 0,
//         tokenUsage.inputCostINR || 0,
//         tokenUsage.outputCostINR || 0,
//         tokenUsage.totalCostINR || 0
//       ]
//     );
//   } catch (error) {
//     console.error('Error updating daily token + cost usage:', error);
//   }
// },

//   async getSessionTokenUsage(sessionId) {
//     if (!isValidUUID(sessionId)) {
//       return { total_prompt_tokens: 0, total_completion_tokens: 0, total_tokens: 0, total_messages: 0 };
//     }

//     const res = await pool.query(
//       `SELECT 
//         COALESCE(SUM(prompt_tokens), 0)::int as total_prompt_tokens,
//         COALESCE(SUM(completion_tokens), 0)::int as total_completion_tokens,
//         COALESCE(SUM(total_tokens), 0)::int as total_tokens,
//         COUNT(*)::int as total_messages
//       FROM file_chats
//       WHERE session_id = $1::uuid`,
//       [sessionId]
//     );
//     return res.rows[0];
//   }
// };

// module.exports = FileChat;

// models/FileChat.js
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const FileChat = {
  /**
   * Save a chat message with complete token and cost tracking
   */
  async saveChat(
    fileId,
    userId,
    question,
    answer,
    sessionId,
    usedChunkIds = [],
    usedSecretPrompt = false,
    promptLabel = null,
    llmModelName = null,
    tokenUsage = null
  ) {
    const currentSessionId = isValidUUID(sessionId) ? sessionId : uuidv4();

    console.log('💾 Saving chat with token data:', {
      userId,
      sessionId: currentSessionId,
      tokenUsage
    });

    const res = await pool.query(
      `INSERT INTO file_chats
        (file_id, user_id, question, answer, session_id, used_chunk_ids, 
         used_secret_prompt, prompt_label, llm_model_name, 
         prompt_tokens, completion_tokens, total_tokens, word_count, char_count,
         input_cost_inr, output_cost_inr, total_cost_inr, created_at)
       VALUES
        ($1::uuid, $2, $3, $4, $5::uuid, $6::int[], $7, $8, $9,
         $10, $11, $12, $13, $14, $15, $16, $17, NOW())
       RETURNING id, session_id`,
      [
        fileId,
        userId,
        question,
        answer,
        currentSessionId,
        usedChunkIds,
        usedSecretPrompt,
        promptLabel,
        llmModelName,
        tokenUsage?.promptTokens || 0,
        tokenUsage?.completionTokens || 0,
        tokenUsage?.totalTokens || 0,
        tokenUsage?.wordCount || 0,
        tokenUsage?.charCount || 0,
        tokenUsage?.inputCostINR || 0,
        tokenUsage?.outputCostINR || 0,
        tokenUsage?.totalCostINR || 0
      ]
    );

    // Update daily aggregates
    if (tokenUsage && tokenUsage.totalTokens > 0) {
      await this.updateDailyTokenUsage(userId, tokenUsage);
    }

    console.log('✅ Chat saved with ID:', res.rows[0].id);
    return res.rows[0];
  },

  /**
   * Update daily token and cost aggregates
   */
  async updateDailyTokenUsage(userId, tokenUsage) {
    try {
      console.log('📊 Updating daily token usage:', { userId, tokenUsage });

      await pool.query(
        `INSERT INTO user_token_usage 
          (user_id, date, total_prompt_tokens, total_completion_tokens, total_tokens, total_queries,
           total_input_cost_inr, total_output_cost_inr, total_cost_inr)
        VALUES ($1, CURRENT_DATE, $2, $3, $4, 1, $5, $6, $7)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          total_prompt_tokens = user_token_usage.total_prompt_tokens + $2,
          total_completion_tokens = user_token_usage.total_completion_tokens + $3,
          total_tokens = user_token_usage.total_tokens + $4,
          total_queries = user_token_usage.total_queries + 1,
          total_input_cost_inr = user_token_usage.total_input_cost_inr + $5,
          total_output_cost_inr = user_token_usage.total_output_cost_inr + $6,
          total_cost_inr = user_token_usage.total_cost_inr + $7,
          updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          tokenUsage.promptTokens || 0,
          tokenUsage.completionTokens || 0,
          tokenUsage.totalTokens || 0,
          parseFloat(tokenUsage.inputCostINR) || 0,
          parseFloat(tokenUsage.outputCostINR) || 0,
          parseFloat(tokenUsage.totalCostINR) || 0
        ]
      );

      console.log('✅ Daily token usage updated');
    } catch (error) {
      console.error('❌ Error updating daily token usage:', error);
      throw error;
    }
  },

  /**
   * Get chat history for a file/session
   */
  async getChatHistory(fileId, sessionId = null) {
    let query = `
      SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
             used_secret_prompt, prompt_label, llm_model_name,
             prompt_tokens, completion_tokens, total_tokens,
             word_count, char_count,
             input_cost_inr, output_cost_inr, total_cost_inr,
             created_at
      FROM file_chats
      WHERE file_id = $1::uuid`;
    const params = [fileId];

    if (sessionId && isValidUUID(sessionId)) {
      query += ` AND session_id = $2::uuid`;
      params.push(sessionId);
    }

    query += ` ORDER BY created_at ASC`;
    const res = await pool.query(query, params);
    return res.rows;
  },

  /**
   * Get all chat history for a user
   */
  async getChatHistoryByUserId(userId) {
    const res = await pool.query(
      `SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids,
             used_secret_prompt, prompt_label, llm_model_name,
             prompt_tokens, completion_tokens, total_tokens,
             word_count, char_count,
             input_cost_inr, output_cost_inr, total_cost_inr,
             created_at
      FROM file_chats
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  /**
   * Get session-level token and cost statistics
   */
  async getSessionStats(sessionId) {
    if (!isValidUUID(sessionId)) {
      return {
        total_prompt_tokens: 0,
        total_completion_tokens: 0,
        total_tokens: 0,
        total_input_cost_inr: '0.0000',
        total_output_cost_inr: '0.0000',
        total_cost_inr: '0.0000',
        total_messages: 0
      };
    }

    const res = await pool.query(
      `SELECT 
        COALESCE(SUM(prompt_tokens), 0)::int as total_prompt_tokens,
        COALESCE(SUM(completion_tokens), 0)::int as total_completion_tokens,
        COALESCE(SUM(total_tokens), 0)::int as total_tokens,
        COALESCE(SUM(input_cost_inr), 0)::numeric(12,4) as total_input_cost_inr,
        COALESCE(SUM(output_cost_inr), 0)::numeric(12,4) as total_output_cost_inr,
        COALESCE(SUM(total_cost_inr), 0)::numeric(12,4) as total_cost_inr,
        COUNT(*)::int as total_messages
      FROM file_chats
      WHERE session_id = $1::uuid`,
      [sessionId]
    );
    return res.rows[0];
  },

  /**
   * Get user token statistics for a period
   */
  async getUserTokenStats(userId, days = 30) {
    const res = await pool.query(
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
    return res.rows[0];
  },

  /**
   * Get daily token usage breakdown
   */
  async getDailyTokenUsage(userId, days = 7) {
    const res = await pool.query(
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
    return res.rows;
  }
};

module.exports = FileChat;