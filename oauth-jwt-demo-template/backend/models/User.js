const bcrypt = require('bcryptjs');

// Fonctions Helper pour les utilisateurs (MySQL)

async function findUserByEmail(db, email) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, googleId, picture, provider, createdAt FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

async function findUserById(db, userId) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, googleId, picture, provider, createdAt FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

async function createUser(db, { email, password, name }) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await db.query(
    'INSERT INTO users (email, password, name, provider, createdAt) VALUES (?, ?, ?, ?, NOW())',
    [email.toLowerCase(), hashedPassword, name, 'local']
  );

  return {
    _id: result.insertId,
    email: email.toLowerCase(),
    name,
    provider: 'local',
    createdAt: new Date()
  };
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Fonctions Helper pour Google OAuth

async function findUserByGoogleId(db, googleId) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, googleId, picture, provider, createdAt FROM users WHERE googleId = ?',
    [googleId]
  );
  return rows[0] || null;
}

async function createUserFromGoogle(db, { googleId, email, name, picture }) {
  const [result] = await db.query(
    'INSERT INTO users (googleId, email, name, picture, provider, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
    [googleId, email ? email.toLowerCase() : null, name, picture, 'google']
  );

  return {
    _id: result.insertId,
    googleId,
    email: email ? email.toLowerCase() : null,
    name,
    picture,
    provider: 'google',
    createdAt: new Date()
  };
}

// Fonctions Helper pour GitHub OAuth
async function findUserByGithubId(db, githubId) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, googleId, githubId, microsoftId, picture, provider, createdAt FROM users WHERE githubId = ?',
    [githubId]
  );
  return rows[0] || null;
}

async function createUserFromGithub(db, { githubId, email, name, picture }) {
  const [result] = await db.query(
    'INSERT INTO users (githubId, email, name, picture, provider, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
    [githubId, email ? email.toLowerCase() : null, name, picture, 'github']
  );

  return {
    _id: result.insertId,
    githubId,
    email: email ? email.toLowerCase() : null,
    name,
    picture,
    provider: 'github',
    createdAt: new Date()
  };
}

// Fonctions Helper pour Discord OAuth
async function findUserByDiscordId(db, discordId) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, googleId, githubId, discordId, picture, provider, createdAt FROM users WHERE discordId = ?',
    [discordId]
  );
  return rows[0] || null;
}

async function createUserFromDiscord(db, { discordId, email, name, picture }) {
  const [result] = await db.query(
    'INSERT INTO users (discordId, email, name, picture, provider, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
    [discordId, email ? email.toLowerCase() : null, name, picture, 'discord']
  );

  return {
    _id: result.insertId,
    discordId,
    email: email ? email.toLowerCase() : null,
    name,
    picture,
    provider: 'discord',
    createdAt: new Date()
  };
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
  findUserByGoogleId,
  createUserFromGoogle,
  findUserByGithubId,
  createUserFromGithub,
  findUserByDiscordId,
  createUserFromDiscord
};
