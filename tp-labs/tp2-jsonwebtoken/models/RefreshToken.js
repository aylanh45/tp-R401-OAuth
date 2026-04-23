// Modèle RefreshToken - Stockage des refresh tokens
// À COMPLÉTER PAR L'ÉTUDIANT

// Base de données simulée (en mémoire)
// En production : utiliser une vraie DB (MongoDB, PostgreSQL, Redis)
const refreshTokens = [];

class RefreshToken {
  constructor(userId, token) {
    this.userId = userId;
    this.token = token;
    this.createdAt = new Date();
  }

  // ============================================
  // Stocker un refresh token (FOURNI)
  // ============================================
  static async store(userId, token) {
    const refreshToken = new RefreshToken(userId, token);
    refreshTokens.push(refreshToken);
    return refreshToken;
  }

  // ============================================
  // Trouver un refresh token (FOURNI)
  // ============================================
  static async findByToken(token) {
    return refreshTokens.find(rt => rt.token === token) || null;
  }

  // ============================================
  // Révoquer un refresh token (FOURNI)
  // ============================================
  static async revoke(token) {
    const index = refreshTokens.findIndex(rt => rt.token === token);
    if (index !== -1) {
      refreshTokens.splice(index, 1);
      return true;
    }
    return false;
  }

  // ============================================
  // Méthode utilitaire (FOURNIE)
  // ============================================
  static async getAllForUser(userId) {
    return refreshTokens.filter(rt => rt.userId === userId);
  }

  // ============================================
  // Méthode de debug (FOURNIE)
  // ============================================
  static getAll() {
    return refreshTokens.map(rt => ({
      userId: rt.userId,
      tokenPreview: rt.token.substring(0, 20) + '...',
      createdAt: rt.createdAt
    }));
  }

  // ============================================
  // Méthode pour tout effacer (FOURNIE - pour les tests)
  // ============================================
  static clearAll() {
    refreshTokens.length = 0;
  }
}

module.exports = RefreshToken;
