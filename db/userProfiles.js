// db/userProfiles.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  async get(discordId) {
    const res = await pool.query('SELECT * FROM user_profiles WHERE discord_id = $1', [discordId]);
    return res.rows[0]; // peut être undefined
  },

  async getByAlbionName(albionName) {
    const res = await pool.query('SELECT * FROM user_profiles WHERE LOWER(albion_name) = LOWER($1)', [albionName]);
    return res.rows[0];
  },

  async set(discordId, albionName, attendances = 0, reviews = 0) {
    await pool.query(`
      INSERT INTO user_profiles (discord_id, albion_name, attendances, reviews)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (discord_id) DO UPDATE
      SET albion_name = EXCLUDED.albion_name
    `, [discordId, albionName, attendances, reviews]);
  },

  async updateAttendance(discordId, attendances) {
    await pool.query('UPDATE user_profiles SET attendances = $1 WHERE discord_id = $2', [attendances, discordId]);
  },

  async updateReviews(discordId, reviews) {
    await pool.query('UPDATE user_profiles SET reviews = $1 WHERE discord_id = $2', [reviews, discordId]);
  },

  async delete(discordId) {
    await pool.query('DELETE FROM user_profiles WHERE discord_id = $1', [discordId]);
  }
};
