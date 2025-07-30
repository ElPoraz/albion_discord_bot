const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      discordId TEXT PRIMARY KEY,
      albionPseudo TEXT,
      joinedAt INTEGER,
      reviewCount INTEGER DEFAULT 0
    )
  `);
}

async function registerUser(discordId, albionPseudo) {
  const now = Date.now();
  const existing = await db.get('SELECT reviewCount FROM users WHERE discordId = ?', discordId);
  const reviewCount = existing ? existing.reviewCount : 0;

  await db.run(`
    INSERT OR REPLACE INTO users (discordId, albionPseudo, joinedAt, reviewCount)
    VALUES (?, ?, ?, ?)
  `, discordId, albionPseudo, now, reviewCount);
}

async function getUser(discordId) {
  return await db.get('SELECT * FROM users WHERE discordId = ?', discordId);
}

module.exports = {
  initDb,
  registerUser,
  getUser,
};
