// Backend Socket.IO - Application chat en temps réel (MySQL)
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB, getDB } = require('./db/connection');

const app = express();
const server = http.createServer(app);

// Configuration de Socket.IO avec CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// GESTION DES UTILISATEURS EN LIGNE
const onlineUsers = new Map();

function addUserToRoom(socketId, username, room) {
  if (!onlineUsers.has(room)) {
    onlineUsers.set(room, new Map());
  }
  onlineUsers.get(room).set(socketId, username);
}

function removeUserFromRoom(socketId, room) {
  if (onlineUsers.has(room)) {
    onlineUsers.get(room).delete(socketId);
    if (onlineUsers.get(room).size === 0) {
      onlineUsers.delete(room);
    }
  }
}

function getUsersInRoom(room) {
  if (!onlineUsers.has(room)) return [];
  return [...new Set(onlineUsers.get(room).values())];
}

// ROUTES REST API (MySQL)

// GET /api/messages/:room
app.get('/api/messages/:room', async (req, res) => {
  try {
    const db = getDB();
    const [messages] = await db.query(
      'SELECT * FROM messages WHERE room = ? ORDER BY timestamp ASC LIMIT 50',
      [req.params.room]
    );
    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/private-messages/:user1/:user2
app.get('/api/private-messages/:user1/:user2', async (req, res) => {
  try {
    const db = getDB();
    const { user1, user2 } = req.params;
    const [messages] = await db.query(
      'SELECT * FROM private_messages WHERE (fromUsername = ? AND toUsername = ?) OR (fromUsername = ? AND toUsername = ?) ORDER BY timestamp ASC LIMIT 50',
      [user1, user2, user2, user1]
    );
    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages privés:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.query('SELECT DISTINCT room FROM messages');
    const roomsFromDB = rows.map(r => r.room);
    const defaultRooms = ['general', 'javascript', 'random'];
    const allRooms = [...new Set([...defaultRooms, ...roomsFromDB])];
    res.json(allRooms);
  } catch (error) {
    console.error('Erreur lors de la récupération des salons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', backend: 'socketio' });
});

// GESTION DES SOCKET.IO EVENTS

io.on('connection', (socket) => {
  // TODO 1: Afficher un message de connexion
  console.log(`✅ Utilisateur connecté: ${socket.id}`);

  // Heartbeat ping pour BONUS 1
  const pingInterval = setInterval(() => {
    socket.emit('ping');
  }, 30000);

  socket.on('pong', () => {
    // Le client est toujours là
  });

  let currentRoom = null;
  let currentUsername = null;

  // TODO 2: Gérer l'événement 'join room'
  socket.on('join room', async ({ username, room }) => {
    try {
      const db = getDB();

      // Si l'utilisateur était déjà dans un salon, le quitter
      if (currentRoom) {
        socket.leave(currentRoom);
        removeUserFromRoom(socket.id, currentRoom);
        socket.to(currentRoom).emit('user left', {
          username: currentUsername,
          room: currentRoom
        });
        io.to(currentRoom).emit('online users', getUsersInRoom(currentRoom));

        // Sauvegarder un message système de départ
        await db.query(
          'INSERT INTO messages (username, message, room, type, timestamp) VALUES (?, ?, ?, ?, NOW())',
          ['Système', `${currentUsername} a quitté le salon`, currentRoom, 'system']
        );
      }

      // Rejoindre le nouveau salon
      currentRoom = room;
      currentUsername = username;
      socket.join(room);
      addUserToRoom(socket.id, username, room);

      // Notifier les autres
      socket.to(room).emit('user joined', { username, room });
      io.to(room).emit('online users', getUsersInRoom(room));

      // Sauvegarder un message système d'arrivée
      await db.query(
        'INSERT INTO messages (username, message, room, type, timestamp) VALUES (?, ?, ?, ?, NOW())',
        ['Système', `${username} a rejoint le salon`, room, 'system']
      );

      console.log(`👤 ${username} a rejoint le salon "${room}"`);
    } catch (error) {
      console.error('Erreur lors de la connexion au salon:', error);
      socket.emit('error', { message: 'Erreur lors de la connexion au salon' });
    }
  });

  // TODO 3: Gérer l'événement 'chat message'
  socket.on('chat message', async ({ username, message, room }) => {
    try {
      if (!message.trim()) return;

      const db = getDB();

      // Sauvegarder le message dans MySQL
      const messageDoc = {
        username,
        message,
        room,
        type: 'user',
        timestamp: new Date()
      };

      await db.query(
        'INSERT INTO messages (username, message, room, type, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [username, message, room, 'user']
      );

      // Diffuser le message
      io.to(room).emit('chat message', messageDoc);

      console.log(`💬 [${room}] ${username}: ${message}`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du message:', error);
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
    }
  });

  // TODO 4: Gérer les événements 'typing' et 'stop typing'
  socket.on('typing', ({ username, room }) => {
    socket.to(room).emit('typing', { username });
  });

  socket.on('stop typing', ({ room }) => {
    socket.to(room).emit('stop typing');
  });

  // BONUS 2: Gérer les messages privés
  socket.on('private message', async ({ fromUsername, toUsername, message }) => {
    try {
      if (!message.trim()) return;

      const db = getDB();
      await db.query(
        'INSERT INTO private_messages (fromUsername, toUsername, message, type, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [fromUsername, toUsername, message, 'private']
      );

      const msgDoc = {
        fromUsername,
        toUsername,
        message,
        type: 'private',
        timestamp: new Date()
      };

      let toSocketId = null;
      for (const [r, usersMap] of onlineUsers.entries()) {
        for (const [sId, uName] of usersMap.entries()) {
          if (uName === toUsername) {
            toSocketId = sId;
            break;
          }
        }
        if (toSocketId) break;
      }

      if (toSocketId) {
        io.to(toSocketId).emit('private message', msgDoc);
      }
      
      socket.emit('private message', msgDoc);
      console.log(`🔒 MP [${fromUsername} -> ${toUsername}]: ${message}`);
    } catch (error) {
      console.error('Erreur MP:', error);
      socket.emit('error', { message: "Erreur lors de l'envoi du message privé" });
    }
  });

  // TODO 5: Gérer la déconnexion d'un utilisateur
  socket.on('disconnect', async () => {
    if (currentRoom && currentUsername) {
      removeUserFromRoom(socket.id, currentRoom);
      io.to(currentRoom).emit('user left', {
        username: currentUsername,
        room: currentRoom
      });
      io.to(currentRoom).emit('online users', getUsersInRoom(currentRoom));

      try {
        const db = getDB();
        await db.query(
          'INSERT INTO messages (username, message, room, type, timestamp) VALUES (?, ?, ?, ?, NOW())',
          ['Système', `${currentUsername} s'est déconnecté`, currentRoom, 'system']
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du message de déconnexion:', error);
      }
    }

    clearInterval(pingInterval);
    console.log(`❌ Utilisateur déconnecté: ${socket.id}`);
  });

  // Événement: error
  socket.on('error', (error) => {
    console.error(`⚠️ Erreur socket [${socket.id}]:`, error);
  });
});

// DÉMARRAGE DU SERVEUR

async function start() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur Socket.IO démarré sur http://localhost:${PORT}`);
      console.log(`📌 FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📊 Backend: Socket.IO + MySQL`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

start();
