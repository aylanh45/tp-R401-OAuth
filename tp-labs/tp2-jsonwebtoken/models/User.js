// Modèle User (FOURNI pour ce TP)
// Focus du TP2 : JWT, pas le modèle User

const bcrypt = require('bcryptjs');

const users = [];

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

  static async create(email, password) {
    if (users.find(u => u.email === email)) {
      throw new Error('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(users.length + 1, email, hashedPassword);
    users.push(newUser);

    return { id: newUser.id, email: newUser.email };
  }

  static async findByEmail(email) {
    return users.find(u => u.email === email) || null;
  }

  static async findById(id) {
    return users.find(u => u.id === id) || null;
  }

  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email
    };
  }

  static getAll() {
    return users.map(u => ({ id: u.id, email: u.email }));
  }
}

module.exports = User;
