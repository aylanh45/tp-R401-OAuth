// TP1 : Authentification avec Passport Local Strategy
// À COMPLÉTER PAR L'ÉTUDIANT

const express = require('express');
const passport = require('./config/passport'); // Configuration Passport à compléter
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'TP1 - Passport Local',
    routes: {
      'POST /auth/register': 'Inscription',
      'POST /auth/login': 'Connexion',
      'GET /auth/profile': 'Profil (protégé)'
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  TP1 : Passport Local Strategy                ║
║  Serveur démarré sur le port ${PORT}           ║
╚════════════════════════════════════════════════╝

📝 TODO:
  [ ] Compléter config/passport.js
  [ ] Compléter routes/auth.js
  [ ] Compléter models/User.js

🧪 Tester:
  curl -X POST http://localhost:${PORT}/auth/register \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test@example.com","password":"test123"}'
  `);
});
