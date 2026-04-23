// Connexion à MySQL
const mysql = require('mysql2/promise');

let pool;

async function connectDB() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'websockets_demo',
      waitForConnections: true,
      connectionLimit: 10
    });

    // Créer la table messages si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        room VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'user',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_room_timestamp (room, timestamp)
      )
    `);

    // Créer la table private_messages pour le BONUS 2
    await pool.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fromUsername VARCHAR(255) NOT NULL,
        toUsername VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'private',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_timestamp (fromUsername, toUsername, timestamp)
      )
    `);

    console.log('✅ MySQL connecté avec succès');
    console.log('📑 Table messages prête');

    return pool;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error.message);
    process.exit(1);
  }
}

function getDB() {
  if (!pool) {
    throw new Error('Base de données non connectée. Appelez connectDB() d\'abord.');
  }
  return pool;
}

module.exports = { connectDB, getDB };
