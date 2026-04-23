// Middleware d'authentification JWT

const { verifyAccessToken } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Utilisez /auth/refresh pour obtenir un nouveau token'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    return res.status(500).json({ error: 'Erreur de vérification' });
  }
}

module.exports = { authenticateToken };
