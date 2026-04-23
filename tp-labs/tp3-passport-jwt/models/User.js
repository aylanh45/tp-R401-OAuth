// Modèle utilisateur avec support des rôles
// FOURNI - Basé sur TP1 et TP2

const bcrypt = require('bcryptjs');

// Base de données en mémoire (simulation)
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$10$XqZw3aZ0fU8YE.9.ySJEOeQqZ0fU8YE.9.ySJEOeQqZ0fU8YE.9.yS', // admin123
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2a$10$YrAwBbA1gV9ZF.0.zTKFPfRrAwBbA1gV9ZF.0.zTKFPfRrAwBbA1gV', // user123
    role: 'user',
    createdAt: new Date()
  }
];

let nextId = 3;

class User {
  constructor(id, email, hashedPassword, role = 'user') {
    this.id = id;
    this.email = email;
    this.password = hashedPassword;
    this.role = role; // 'user' ou 'admin'
    this.createdAt = new Date();
  }

  // Méthode pour retourner les infos publiques (sans le password)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt
    };
  }

  // Comparer le mot de passe fourni avec le hash
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Créer un utilisateur
  static async create(email, password, role = 'user') {
    // Vérifier si l'email existe déjà
    const existing = users.find(u => u.email === email);
    if (existing) {
      throw new Error('Email déjà utilisé');
    }

    // Valider le rôle
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Rôle invalide (user ou admin)');
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new User(nextId++, email, hashedPassword, role);
    users.push(user);

    return user;
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const userData = users.find(u => u.email === email);
    if (!userData) return null;

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role
    );
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const userData = users.find(u => u.id === id);
    if (!userData) return null;

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role
    );
  }

  // Récupérer tous les utilisateurs (debug)
  static getAll() {
    return users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
  }

  // Supprimer un utilisateur (admin uniquement)
  static async deleteById(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }
}

module.exports = User;
