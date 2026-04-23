// Modèle pour gérer les Refresh Tokens
// FOURNI - Identique au TP2

// Base de données en mémoire pour les refresh tokens
const refreshTokens = [];

class RefreshToken {
  // Stocker un refresh token
  static async store(userId, token) {
    const tokenData = {
      userId,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    };

    refreshTokens.push(tokenData);
    return tokenData;
  }

  // Trouver un refresh token
  static async findByToken(token) {
    return refreshTokens.find(rt => rt.token === token);
  }

  // Révoquer (supprimer) un refresh token
  static async revoke(token) {
    const index = refreshTokens.findIndex(rt => rt.token === token);
    if (index === -1) return false;

    refreshTokens.splice(index, 1);
    return true;
  }

  // Révoquer tous les tokens d'un utilisateur
  static async revokeAllForUser(userId) {
    const initialLength = refreshTokens.length;
    const filtered = refreshTokens.filter(rt => rt.userId !== userId);
    refreshTokens.length = 0;
    refreshTokens.push(...filtered);

    return initialLength - refreshTokens.length;
  }

  // Récupérer tous les refresh tokens (debug)
  static getAll() {
    return refreshTokens.map(rt => ({
      userId: rt.userId,
      token: rt.token.substring(0, 20) + '...',
      createdAt: rt.createdAt,
      expiresAt: rt.expiresAt
    }));
  }

  // Nettoyer les tokens expirés
  static cleanExpired() {
    const now = new Date();
    const validTokens = refreshTokens.filter(rt => rt.expiresAt > now);
    const removedCount = refreshTokens.length - validTokens.length;

    refreshTokens.length = 0;
    refreshTokens.push(...validTokens);

    return removedCount;
  }
}

module.exports = RefreshToken;
