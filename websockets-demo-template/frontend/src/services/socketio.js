// Service Socket.IO pour la communication en temps réel
import { io } from 'socket.io-client';

// URL du serveur Backend Socket.IO
const BACKEND_URL = 'http://localhost:3000';

// Créer une instance Socket.IO
export const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// URL de base pour les requêtes API
export const apiUrl = BACKEND_URL;

/**
 * Prépare les fonctions Socket.IO pour correspondre à l'interface WebSocket
 * Cela permet de basculer entre Socket.IO et WebSocket natif sans changer le code client
 */
export const socketioService = {
  // Connecter au serveur
  connect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },

  // Émettre un événement
  emit: (event, data) => {
    socket.emit(event, data);
  },

  // Écouter un événement
  on: (event, callback) => {
    socket.on(event, callback);
  },

  // Arrêter d'écouter un événement
  off: (event, callback) => {
    socket.off(event, callback);
  },

  // Déconnecter
  disconnect: () => {
    socket.disconnect();
  },

  // Vérifier si connecté
  isConnected: () => {
    return socket.connected;
  }
};

// Événements Socket.IO
socket.on('connect', () => {
  console.log('✅ Connecté au serveur Socket.IO');
});

socket.on('disconnect', () => {
  console.log('❌ Déconnecté du serveur Socket.IO');
});

socket.on('error', (error) => {
  console.error('⚠️ Erreur Socket.IO:', error);
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Erreur de connexion Socket.IO:', error);
});

export default socketioService;
