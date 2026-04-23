// Exemple 5 : Refresh Token Pattern
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

// Base de données simulée
const users = [];
const refreshTokens = []; // En production : base de données

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

// Route de login avec Access + Refresh Token
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credentials invalides' });
  }

  // Access Token (courte durée - 15 minutes)
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh Token (longue durée - 7 jours)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Stocker le Refresh Token en DB
  refreshTokens.push({
    userId: user.id,
    token: refreshToken,
    createdAt: new Date()
  });

  res.json({
    accessToken,
    refreshToken,
    message: 'Access Token expire dans 15 minutes'
  });
});

// Route pour rafraîchir l'Access Token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token manquant' });
  }

  // Vérifier que le token existe en DB (pas révoqué)
  const storedToken = refreshTokens.find(t => t.token === refreshToken);
  if (!storedToken) {
    return res.status(403).json({ error: 'Refresh token révoqué ou invalide' });
  }

  // Vérifier la signature et l'expiration
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Refresh token invalide ou expiré' });
    }

    // Générer un nouveau Access Token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      accessToken: newAccessToken,
      message: 'Nouveau Access Token généré'
    });
  });
});

// Route de logout (révocation du Refresh Token)
app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  const index = refreshTokens.findIndex(t => t.token === refreshToken);
  if (index !== -1) {
    refreshTokens.splice(index, 1);
    return res.json({ message: 'Déconnexion réussie' });
  }

  res.status(400).json({ error: 'Token non trouvé' });
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Access Token expiré',
          message: 'Utilisez /refresh avec votre Refresh Token'
        });
      }
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// Route protégée
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Ressource protégée',
    user: req.user,
    timestamp: new Date()
  });
});

// Route pour lister les refresh tokens actifs (debug)
app.get('/tokens', (req, res) => {
  res.json({
    activeRefreshTokens: refreshTokens.length,
    tokens: refreshTokens.map(t => ({
      userId: t.userId,
      createdAt: t.createdAt,
      tokenPreview: t.token.substring(0, 20) + '...'
    }))
  });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`\n=== Exemple 5 : Refresh Token Pattern ===`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('\nRoutes disponibles:');
  console.log('POST   /login      - Se connecter (reçoit Access + Refresh Token)');
  console.log('POST   /refresh    - Rafraîchir l\'Access Token');
  console.log('POST   /logout     - Se déconnecter (révoque le Refresh Token)');
  console.log('GET    /protected  - Ressource protégée');
  console.log('GET    /tokens     - Liste des Refresh Tokens actifs (debug)');
  console.log('\nCompte de test:');
  console.log('Email: alice@example.com');
  console.log('Password: password123');
  console.log('\n💡 Access Token expire dans 15 minutes');
  console.log('💡 Refresh Token expire dans 7 jours');
});
