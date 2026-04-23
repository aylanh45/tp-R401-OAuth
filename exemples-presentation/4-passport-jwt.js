// Exemple 4 : Passport JWT Strategy
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
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
    password: hashedPassword,
    role: 'admin'
  });
  console.log('User database ready');
})();

// Stratégie Local (pour le login)
passport.use('local', new LocalStrategy(
  { usernameField: 'email', session: false },
  async (email, password, done) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) return done(null, false, { message: 'Email incorrect' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Mot de passe incorrect' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Stratégie JWT (pour les routes protégées)
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwt_payload, done) => {
    try {
      console.log('JWT Payload reçu:', jwt_payload);
      const user = users.find(u => u.id === jwt_payload.userId);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }
));

// Route de login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ error: info ? info.message : 'Login failed' });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  })(req, res, next);
});

// Route d'inscription
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

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
    password: hashedPassword,
    role: role || 'user'
  };
  users.push(newUser);

  res.status(201).json({ message: 'Utilisateur créé', userId: newUser.id });
});

// Routes protégées avec Passport JWT
app.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      message: 'Profil utilisateur',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  }
);

app.get('/dashboard',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      message: 'Dashboard sécurisé',
      userId: req.user.id,
      timestamp: new Date()
    });
  }
);

// Middleware de vérification des rôles
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

// Route admin uniquement
app.delete('/users/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  (req, res) => {
    res.json({
      message: 'Utilisateur supprimé',
      deletedId: req.params.id
    });
  }
);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n=== Exemple 4 : Passport JWT ===`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('\nRoutes disponibles:');
  console.log('POST   /register       - Créer un compte');
  console.log('POST   /login          - Se connecter (Passport Local)');
  console.log('GET    /profile        - Profil (Passport JWT)');
  console.log('GET    /dashboard      - Dashboard (Passport JWT)');
  console.log('DELETE /users/:id      - Supprimer user (Admin uniquement)');
  console.log('\nCompte de test:');
  console.log('Email: alice@example.com');
  console.log('Password: password123');
  console.log('Role: admin');
});
