// Routes d'authentification JWT

const express = require('express');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeToken
} = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Route d'inscription (FOURNIE)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et password requis' });
    }

    const user = await User.create(email, password);
    res.status(201).json({ message: 'Utilisateur créé', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// TODO 10 : Route de connexion (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et password requis' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credentials invalides' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credentials invalides' });
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    await RefreshToken.store(user.id, refreshToken);

    res.json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken,
      expiresIn: '15 minutes'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO 11 : Route de rafraîchissement (Refresh)
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

    const newAccessToken = generateAccessToken(user.id, user.email);

    res.json({
      message: 'Access Token rafraîchi',
      accessToken: newAccessToken,
      expiresIn: '15 minutes'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO 12 : Route de déconnexion (Logout)
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

// TODO 13 : Route protégée par JWT
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Profil utilisateur',
      user: {
        id: req.user.userId,
        email: req.user.email
      },
      tokenInfo: {
        issuedAt: new Date(req.user.iat * 1000),
        expiresAt: new Date(req.user.exp * 1000)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes de debug (FOURNIES)
router.get('/debug/tokens', (req, res) => {
  res.json({
    message: 'Refresh Tokens actifs',
    count: RefreshToken.getAll().length,
    tokens: RefreshToken.getAll()
  });
});

router.get('/debug/users', (req, res) => {
  res.json({
    message: 'Utilisateurs',
    users: User.getAll()
  });
});

router.post('/debug/decode', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    const decoded = decodeToken(token);
    res.json({
      message: 'Token décodé (SANS VÉRIFICATION)',
      warning: 'Ceci ne vérifie PAS la signature !',
      decoded
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
