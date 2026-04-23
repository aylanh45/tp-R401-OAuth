require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour Vue.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialiser Passport (SANS session car on utilise JWT)
app.use(passport.initialize());

// Connexion MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'oauth_jwt_demo',
  waitForConnections: true,
  connectionLimit: 10
});

async function initDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        googleId VARCHAR(255) UNIQUE,
        githubId VARCHAR(255) UNIQUE,
        discordId VARCHAR(255) UNIQUE,
        picture VARCHAR(500),
        provider VARCHAR(50) DEFAULT 'local',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    // Tentative d'ajout des colonnes si elles n'existent pas
    try {
      await connection.query('ALTER TABLE users ADD COLUMN githubId VARCHAR(255) UNIQUE');
    } catch(e) {}
    try {
      await connection.query('ALTER TABLE users ADD COLUMN discordId VARCHAR(255) UNIQUE');
    } catch(e) {}
    
    console.log('✅ MySQL connecté et table users prête');
  } catch (err) {
    console.error('❌ Erreur MySQL:', err);
    process.exit(1);
  }
}

initDB();

// Stocker le pool pour les routes
app.locals.db = pool;

// Routes
app.use('/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🎓 OAuth + JWT Demo - Backend Express + MySQL',
    endpoints: {
      'POST /auth/register': 'Créer un compte (email/password)',
      'POST /auth/login': 'Se connecter (email/password)',
      'GET /auth/google': 'Se connecter avec Google',
      'GET /auth/google/callback': 'Callback Google OAuth',
      'GET /auth/profile': 'Profil (protégé par JWT)',
      'GET /auth/users': 'Liste utilisateurs (debug)'
    },
    database: 'MySQL',
    authentication: 'JWT stateless + Google OAuth 2.0',
    cors: 'Configuré pour Vue.js'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🌐 Frontend autorisé: ${process.env.FRONTEND_URL}`);
});

// Fermer MySQL à l'arrêt
process.on('SIGINT', async () => {
  await pool.end();
  console.log('MySQL déconnecté');
  process.exit(0);
});
