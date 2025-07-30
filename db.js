const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data.sqlite'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    discordId TEXT PRIMARY KEY,
    albionPseudo TEXT,
    joinedAt INTEGER,
    reviewCount INTEGER DEFAULT 0
  )`);
});

function registerUser(discordId, albionPseudo) {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    db.run(
      `INSERT OR REPLACE INTO users (discordId, albionPseudo, joinedAt, reviewCount) VALUES (?, ?, ?, COALESCE((SELECT reviewCount FROM users WHERE discordId = ?), 0))`,
      [discordId, albionPseudo, now, discordId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getUser(discordId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE discordId = ?`, [discordId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Ajoute d’autres fonctions utiles au besoin...

module.exports = {
  registerUser,
  getUser,
};