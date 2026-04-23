// TP2 : Authentification JWT avec jsonwebtoken
// À COMPLÉTER PAR L'ÉTUDIANT

require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'TP2 - JWT avec jsonwebtoken',
    routes: {
      'POST /auth/register': 'Inscription',
      'POST /auth/login': 'Connexion (reçoit Access + Refresh Token)',
      'POST /auth/refresh': 'Rafraîchir l\'Access Token',
      'POST /auth/logout': 'Déconnexion (révoque Refresh Token)',
      'GET /auth/profile': 'Profil (protégé par JWT)',
      'GET /auth/debug/tokens': 'Liste des tokens actifs (debug)'
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  TP2 : JWT avec jsonwebtoken                  ║
║  Serveur démarré sur le port ${PORT}           ║
╚════════════════════════════════════════════════╝

📝 TODO:
  [ ] Compléter utils/jwt.js (génération & vérification)
  [ ] Compléter middleware/auth.js (protection des routes)
  [ ] Compléter routes/auth.js (login, refresh, logout)

🎯 Objectifs:
  ✓ Générer des Access Token (15 min)
  ✓ Générer des Refresh Token (7 jours)
  ✓ Vérifier les tokens et gérer les erreurs
  ✓ Implémenter le pattern Refresh Token
  ✓ Révoquer les Refresh Tokens

🔑 Variables d'environnement configurées dans .env
  `);
});
