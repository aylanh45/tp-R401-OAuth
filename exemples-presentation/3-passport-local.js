// Exemple 3 : Passport Local Strategy
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(passport.initialize());

// Base de données simulée
const users = [];

// Pré-créer un utilisateur de test
(async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  users.push({
    id: 1,
    email: 'alice@example.com',
    password: hashedPassword
  });
  console.log('User database ready');
})();

// Configuration de la stratégie locale
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false // Important : pas de session avec JWT
  },
  async (email, password, done) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) {
        return done(null, false, { message: 'Email incorrect' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Mot de passe incorrect' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Route de login avec Passport Local
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!user) {
      return res.status(401).json({ error: info ? info.message : 'Login failed' });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Connexion réussie',
      token
    });
  })(req, res, next);
});

// Route d'inscription
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword
  };
  users.push(newUser);

  res.status(201).json({ message: 'Utilisateur créé', userId: newUser.id });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n=== Exemple 3 : Passport Local ===`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('\nRoutes disponibles:');
  console.log('POST   /register   - Créer un compte');
  console.log('POST   /login      - Se connecter (avec Passport Local)');
  console.log('\nCompte de test:');
  console.log('Email: alice@example.com');
  console.log('Password: password123');
});
