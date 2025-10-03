const pool = require('../config/db');

class Session {
  static async create({ userId, token }) {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, token, created_at, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, token]
    );
    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);
    return result.rows[0];
  }

  static async deleteByToken(token) {
    const result = await pool.query('DELETE FROM sessions WHERE token = $1 RETURNING *', [token]);
    return result.rows[0];
  }

  static async deleteByUserId(userId) {
    const result = await pool.query('DELETE FROM sessions WHERE user_id = $1 RETURNING *', [userId]);
    return result.rows[0];
  }
}

module.exports = Session;
