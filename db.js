const Database = require('better-sqlite3');
const path = require('path');

// Crée ou ouvre la base dans le dossier courant
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Création de la table si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    discordId TEXT PRIMARY KEY,
    albionPseudo TEXT,
    joinedAt INTEGER,
    reviewCount INTEGER DEFAULT 0
  )
`).run();

/**
 * Enregistre ou met à jour un utilisateur.
 */
function registerUser(discordId, albionPseudo) {
  const now = Date.now();

  // Récupère le compteur actuel s'il existe
  const existing = db.prepare('SELECT reviewCount FROM users WHERE discordId = ?').get(discordId);
  const reviewCount = existing ? existing.reviewCount : 0;

  db.prepare(`
    INSERT OR REPLACE INTO users (discordId, albionPseudo, joinedAt, reviewCount)
    VALUES (?, ?, ?, ?)
  `).run(discordId, albionPseudo, now, reviewCount);
}

/**
 * Récupère un utilisateur par son ID Discord.
 */
function getUser(discordId) {
  return db.prepare('SELECT * FROM users WHERE discordId = ?').get(discordId);
}

/**
 * Incrémente le compteur de reviews pour un utilisateur.
 */
function incrementReview(discordId) {
  db.prepare(`
    UPDATE users
    SET reviewCount = reviewCount + 1
    WHERE discordId = ?
  `).run(discordId);
}

module.exports = {
  registerUser,
  getUser,
  incrementReview,
};
