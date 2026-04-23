const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, comparePassword, userWithoutPassword } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Fonction pour générer un JWT (FOURNIE)
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// TODO 4: Route POST /register
router.post('/register', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password et name requis' });
    }

    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    const user = await createUser(db, { email, password, name });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: userWithoutPassword(user),
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

// TODO 5: Route POST /login
router.post('/login', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et password requis' });
    }

    const user = await findUserByEmail(db, email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou password incorrect' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      user: userWithoutPassword(user),
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

// TODO 6: Route GET /profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Profil utilisateur', user: req.user });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /users - Liste des utilisateurs (debug) - FOURNIE
router.get('/users', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [users] = await db.query('SELECT id AS _id, email, name, createdAt FROM users');
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

module.exports = router;
