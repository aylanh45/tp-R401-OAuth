// Routes d'authentification avec intégration Passport Local + JWT

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const router = express.Router();

// Fonctions utilitaires JWT (FOURNIES)
function generateAccessToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

// Route d'inscription (FOURNIE)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et password requis' });
    }

    const user = await User.create(email, password, role || 'user');
    res.status(201).json({
      message: 'Utilisateur créé',
      user: user.toJSON()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// TODO 4 : Route de connexion avec Passport Local
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Credentials invalides',
        message: info?.message || 'Email ou mot de passe incorrect'
      });
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await RefreshToken.store(user.id, refreshToken);

    return res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      accessToken,
      refreshToken,
      expiresIn: '15 minutes'
    });
  })(req, res, next);
});

// Route de rafraîchissement (FOURNIE)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Refresh token expiré' });
      }
      return res.status(403).json({ error: 'Refresh token invalide' });
    }

    const storedToken = await RefreshToken.findByToken(refreshToken);
    if (!storedToken) {
      return res.status(403).json({ error: 'Refresh token révoqué ou invalide' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    res.json({
      message: 'Access Token rafraîchi',
      accessToken: newAccessToken,
      expiresIn: '15 minutes'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route de déconnexion (FOURNIE)
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    const revoked = await RefreshToken.revoke(refreshToken);

    if (revoked) {
      res.json({ message: 'Déconnexion réussie' });
    } else {
      res.status(404).json({ error: 'Token non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO 5 : Route protégée avec Passport JWT
router.get('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      res.json({
        message: 'Profil utilisateur',
        user: req.user.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Routes de debug (FOURNIES)
router.get('/users', (req, res) => {
  res.json({
    message: 'Liste des utilisateurs',
    users: User.getAll()
  });
});

router.get('/tokens', (req, res) => {
  res.json({
    message: 'Refresh Tokens actifs',
    count: RefreshToken.getAll().length,
    tokens: RefreshToken.getAll()
  });
});

module.exports = router;
