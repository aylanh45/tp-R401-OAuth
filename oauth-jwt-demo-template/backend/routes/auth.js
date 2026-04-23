const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { findUserByEmail, findUserById, createUser, comparePassword } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Fonction pour générer un JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// POST /auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const db = req.app.locals.db;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email, mot de passe et nom sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe invalide',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email déjà utilisé',
        message: 'Un compte existe déjà avec cet email'
      });
    }

    const user = await createUser(db, { email, password, name });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// POST /auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email et mot de passe requis'
      });
    }

    const user = await findUserByEmail(db, email);
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        picture: user.picture
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /auth/profile - Profil utilisateur (protégé)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Profil utilisateur',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /auth/users - Liste des utilisateurs (debug)
router.get('/users', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [users] = await db.query(
      'SELECT id AS _id, email, name, googleId, picture, provider, createdAt FROM users'
    );
    res.json({
      message: 'Liste des utilisateurs',
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// TODO 2: Routes OAuth Google

// GET /auth/google - Initie l'authentification Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// GET /auth/google/callback - Callback Google OAuth
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=token_generation_failed`);
    }
  }
);

// --- Routes OAuth GitHub ---

// GET /auth/github - Initie l'authentification GitHub
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email' ], session: false })
);

// GET /auth/github/callback - Callback GitHub OAuth
router.get('/github/callback', 
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=token_generation_failed`);
    }
  }
);

// --- Routes OAuth Discord ---

// GET /auth/discord - Initie l'authentification Discord
router.get('/discord',
  passport.authenticate('discord', {
    session: false
  })
);

// GET /auth/discord/callback - Callback Discord OAuth
router.get('/discord/callback', 
  passport.authenticate('discord', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=token_generation_failed`);
    }
  }
);

module.exports = router;
