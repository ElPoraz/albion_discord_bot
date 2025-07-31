const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      discord_id TEXT PRIMARY KEY,
      albion_name TEXT NOT NULL,
      attendances INTEGER DEFAULT 0,
      reviews INTEGER DEFAULT 0
    )
  `);

  console.log("✅ Base de données initialisée.");
  process.exit();
}

init().catch(console.error);
