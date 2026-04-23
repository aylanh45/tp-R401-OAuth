// Utilitaires JWT
// À COMPLÉTER PAR L'ÉTUDIANT

const jwt = require('jsonwebtoken');

// ============================================
// Générer un Access Token (FOURNI)
// ============================================
function generateAccessToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// ============================================
// Générer un Refresh Token (FOURNI)
// ============================================
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// ============================================
// Vérifier un Access Token (FOURNI)
// ============================================
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw err;
  }
}

// ============================================
// Vérifier un Refresh Token (FOURNI)
// ============================================
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw err;
  }
}

// ============================================
// Décoder un token sans vérification (FOURNI)
// ============================================
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
