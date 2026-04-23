require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// TODO 1: Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Connexion MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'jwt_demo',
  waitForConnections: true,
  connectionLimit: 10
});

// Initialiser la base de données
async function initDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('✅ MySQL connecté et table users prête');
  } catch (err) {
    console.error('❌ Erreur MySQL:', err);
  }
}

initDB();

// Stocker le pool pour les routes
app.locals.db = pool;

// Routes
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🎓 JWT Demo - Backend Express + MySQL',
    endpoints: {
      'POST /api/auth/register': 'Créer un compte',
      'POST /api/auth/login': 'Se connecter',
      'GET /api/auth/profile': 'Profil (protégé par JWT)',
      'GET /api/auth/users': 'Liste utilisateurs (debug)'
    },
    database: 'MySQL',
    jwt: 'Access Token uniquement (pas de session)',
    cors: 'Configuré pour Vue.js'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🌐 Frontend autorisé: ${process.env.FRONTEND_URL}`);
});
