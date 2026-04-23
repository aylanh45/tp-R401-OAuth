// Modèle User avec hachage de mot de passe
// À COMPLÉTER PAR L'ÉTUDIANT

const bcrypt = require('bcryptjs');

// Base de données simulée (en mémoire)
const users = [];

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password; // Stocke le hash, jamais le mot de passe en clair
  }

  // ============================================
  // Créer un nouvel utilisateur (FOURNI)
  // ============================================
  static async create(email, password) {
    if (users.find(u => u.email === email)) {
      throw new Error('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(users.length + 1, email, hashedPassword);
    users.push(newUser);

    return { id: newUser.id, email: newUser.email };
  }

  // ============================================
  // Trouver un utilisateur par email (FOURNI)
  // ============================================
  static async findByEmail(email) {
    return users.find(u => u.email === email) || null;
  }

  // ============================================
  // Comparer le mot de passe (FOURNI)
  // ============================================
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // ============================================
  // Méthode utilitaire (FOURNIE)
  // ============================================
  // Retourne l'utilisateur sans le password (pour les réponses JSON)
  toJSON() {
    return {
      id: this.id,
      email: this.email
    };
  }

  // ============================================
  // Méthode de debug (FOURNIE)
  // ============================================
  static getAll() {
    return users.map(u => ({ id: u.id, email: u.email }));
  }
}

module.exports = User;
