// Routes administrateur protégées par rôle

const express = require('express');
const passport = require('passport');
const { requireAdmin, requireRole } = require('../middleware/roles');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const router = express.Router();

// TODO 6a : Route dashboard admin
router.get('/dashboard',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  (req, res) => {
    res.json({
      message: 'Dashboard administrateur',
      admin: req.user.toJSON(),
      statistics: {
        totalUsers: User.getAll().length,
        activeTokens: RefreshToken.getAll().length,
        adminCount: User.getAll().filter(u => u.role === 'admin').length,
        userCount: User.getAll().filter(u => u.role === 'user').length
      }
    });
  }
);

// TODO 6b : Route de gestion des utilisateurs
router.get('/users',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  (req, res) => {
    res.json({
      message: 'Liste des utilisateurs (admin)',
      users: User.getAll(),
      total: User.getAll().length
    });
  }
);

// TODO 6c : Route de suppression d'utilisateur
router.delete('/users/:id',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID invalide' });
      }

      if (userId === req.user.id) {
        return res.status(400).json({
          error: 'Auto-suppression interdite',
          message: 'Vous ne pouvez pas supprimer votre propre compte'
        });
      }

      const deleted = await User.deleteById(userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const revokedCount = await RefreshToken.revokeAllForUser(userId);

      res.json({
        message: 'Utilisateur supprimé',
        userId,
        tokensRevoked: revokedCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Route bonus : Nettoyer les tokens expirés (FOURNIE)
router.post('/cleanup-tokens',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  async (req, res) => {
    try {
      const removed = RefreshToken.cleanExpired();
      res.json({
        message: 'Tokens expirés nettoyés',
        removed
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
