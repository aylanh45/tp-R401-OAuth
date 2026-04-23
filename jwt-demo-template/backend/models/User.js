const bcrypt = require('bcryptjs');

// Fonctions MySQL pour gérer les utilisateurs

async function createUser(db, { email, password, name }) {
  if (!email || !password || !name) {
    throw new Error('Email, password et name sont requis');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await db.query(
    'INSERT INTO users (email, password, name, createdAt) VALUES (?, ?, ?, NOW())',
    [email.toLowerCase().trim(), hashedPassword, name.trim()]
  );

  return {
    _id: result.insertId,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    createdAt: new Date()
  };
}

async function findUserByEmail(db, email) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, createdAt FROM users WHERE email = ?',
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
}

async function findUserById(db, userId) {
  const [rows] = await db.query(
    'SELECT id AS _id, email, password, name, createdAt FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function userWithoutPassword(user) {
  if (!user) return null;
  const { password, ...userWithoutPass } = user;
  return userWithoutPass;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  comparePassword,
  userWithoutPassword
};
