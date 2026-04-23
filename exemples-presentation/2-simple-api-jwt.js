// Exemple 2 : API Simple avec JWT (sans Passport)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

// Base de données simulée
const users = [
  {
    id: 1,
    email: 'alice@example.com',
    password: '$2a$10$YQZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9' // "password123"
  }
];

// Pré-hasher le mot de passe pour les tests
(async () => {
  users[0].password = await bcrypt.hash('password123', 10);
  console.log('User database ready:', users[0].email);
})();

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

// Route de connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Credentials invalides' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Credentials invalides' });
  }

  // Générer le token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = user;
    next();
  });
}

// Routes protégées
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profil utilisateur',
    user: req.user
  });
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Données sensibles du dashboard',
    userId: req.user.userId,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n=== Exemple 2 : API Simple avec JWT ===`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('\nRoutes disponibles:');
  console.log('POST   /register   - Créer un compte');
  console.log('POST   /login      - Se connecter');
  console.log('GET    /profile    - Voir son profil (protégé)');
  console.log('GET    /dashboard  - Voir le dashboard (protégé)');
  console.log('\nCompte de test:');
  console.log('Email: alice@example.com');
  console.log('Password: password123');
});
