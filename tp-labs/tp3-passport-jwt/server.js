// TP3 : Intégration Passport Local + Passport JWT avec RBAC
// FOURNI - Serveur Express de base

require('dotenv').config();
const express = require('express');
const passport = require('passport');

// Configuration de Passport (à compléter par l'étudiant)
require('./config/passport');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: 'TP3 : API avec Passport Local + Passport JWT + RBAC',
    endpoints: {
      auth: {
        'POST /auth/register': 'Créer un compte (body: email, password, role?)',
        'POST /auth/login': 'Se connecter (Passport Local)',
        'POST /auth/refresh': 'Rafraîchir l\'Access Token',
        'POST /auth/logout': 'Se déconnecter',
        'GET /auth/profile': 'Voir son profil (Passport JWT)',
        'GET /auth/users': 'Liste utilisateurs (debug)'
      },
      admin: {
        'GET /admin/dashboard': 'Tableau de bord admin (role: admin)',
        'GET /admin/users': 'Gérer utilisateurs (role: admin)',
        'DELETE /admin/users/:id': 'Supprimer utilisateur (role: admin)'
      }
    },
    tips: {
      login: 'POST /auth/login retourne accessToken + refreshToken',
      protected: 'Utilisez "Authorization: Bearer <accessToken>" pour routes protégées',
      roles: 'L\'inscription accepte un champ "role" (user ou admin)',
      defaultUsers: [
        { email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { email: 'user@example.com', password: 'user123', role: 'user' }
      ]
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ TP3 Server running on http://localhost:${PORT}`);
  console.log('📚 Endpoints:');
  console.log('   POST /auth/register - Créer un compte');
  console.log('   POST /auth/login    - Se connecter (Passport Local)');
  console.log('   GET  /auth/profile  - Profil (Passport JWT)');
  console.log('   GET  /admin/dashboard - Admin seulement');
  console.log('\n🧪 Test rapide:');
  console.log(`   curl -X POST http://localhost:${PORT}/auth/login \\`);
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"admin@example.com","password":"admin123"}\'');
});
