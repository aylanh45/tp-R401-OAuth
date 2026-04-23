# Référence des TODOs - Websockets Demo Template

Cette page récapitule rapidement où se trouvent tous les TODOs et ce qui doit être fait.

## Vue d'ensemble

- **5 TODOs backend** (server.js) - Gestion des événements Socket.IO
- **7 TODOs frontend** (Chat.vue) - Émission et écoute des événements
- **2 BONUS** - Tâches avancées optionnelles

## Backend TODOs

### Fichier: `/backend/server.js`

#### TODO 1 - Ligne ~126 (Facile ⭐)
**Gestionnaire de connexion Socket.IO**

```javascript
io.on('connection', (socket) => {
  // TODO 1: Afficher un message de connexion
  // console.log(`✅ Utilisateur connecté: ${socket.id}`);
```

**À faire**: Ajouter le log pour afficher l'ID du socket connecté.

---

#### TODO 2 - Ligne ~145 (Moyen ⭐⭐)
**Gérer l'événement 'join room'**

```javascript
socket.on('join room', async ({ username, room }) => {
  try {
    // TODO 2: Implémenter la logique de join room ici
```

**À faire**:
1. Si l'utilisateur était dans un autre salon:
   - Quitter le salon: `socket.leave(currentRoom)`
   - Retirer la liste: `removeUserFromRoom(socket.id, currentRoom)`
   - Notifier: `socket.to(currentRoom).emit('user left', { username: currentUsername })`
   - Envoyer la liste: `io.to(currentRoom).emit('online users', getUsersInRoom(currentRoom))`
   - Sauvegarder dans DB: `db.collection('messages').insertOne({ username: 'Système', message: `${currentUsername} a quitté le salon`, room: currentRoom, type: 'system', timestamp: new Date() })`

2. Rejoindre le nouveau salon:
   - `currentRoom = room; currentUsername = username;`
   - `socket.join(room);`
   - `addUserToRoom(socket.id, username, room);`
   - `socket.to(room).emit('user joined', { username, room });`
   - `io.to(room).emit('online users', getUsersInRoom(room));`
   - Sauvegarder système message

---

#### TODO 3 - Ligne ~180 (Moyen ⭐⭐)
**Gérer l'événement 'chat message'**

```javascript
socket.on('chat message', async ({ username, message, room }) => {
  try {
    // TODO 3: Implémenter la logique de chat message ici
```

**À faire**:
1. Vérifier message non-vide: `if (!message.trim()) return;`
2. Créer doc: `messageDoc = { username, message: message.trim(), room, type: 'user', timestamp: new Date() }`
3. Sauvegarder: `await db.collection('messages').insertOne(messageDoc);`
4. Diffuser: `io.to(room).emit('chat message', messageDoc);`
5. Logger: `console.log(\`💬 [${room}] ${username}: ${message}\`);`

---

#### TODO 4a - Ligne ~215 (Facile ⭐)
**Gérer l'événement 'typing'**

```javascript
socket.on('typing', ({ username, room }) => {
  // TODO 4a: Gérer l'événement 'typing'
```

**À faire**: `socket.to(room).emit('typing', { username });`

---

#### TODO 4b - Ligne ~223 (Facile ⭐)
**Gérer l'événement 'stop typing'**

```javascript
socket.on('stop typing', ({ room }) => {
  // TODO 4b: Gérer l'événement 'stop typing'
```

**À faire**: `socket.to(room).emit('stop typing');`

---

#### TODO 5 - Ligne ~230 (Moyen ⭐⭐)
**Gérer la déconnexion**

```javascript
socket.on('disconnect', async () => {
  // TODO 5: Implémenter la logique de disconnect ici
```

**À faire**:
1. Log: `console.log(\`❌ Utilisateur déconnecté: ${socket.id}\`);`
2. Si l'utilisateur était connecté à un salon:
   - `removeUserFromRoom(socket.id, currentRoom);`
   - `io.to(currentRoom).emit('user left', { username: currentUsername });`
   - `io.to(currentRoom).emit('online users', getUsersInRoom(currentRoom));`
   - Sauvegarder système message

---

## Frontend TODOs

### Fichier: `/frontend/src/views/Chat.vue`

#### TODO 7 - Ligne ~265 (Moyen ⭐⭐)
**Écouter les événements Socket.IO**

Ajouter après le commentaire `// TODO 7: Écouter les événements Socket.IO`:

```javascript
// TODO 7a: Écouter 'chat message'
wsService.on('chat message', (data) => {
  messages.value.push(data);
  nextTick(() => scrollToBottom());
});

// TODO 7b: Écouter 'user joined'
wsService.on('user joined', (data) => {
  messages.value.push({
    type: 'system',
    message: `${data.username} a rejoint le salon`,
    timestamp: new Date()
  });
  nextTick(() => scrollToBottom());
});

// TODO 7c: Écouter 'user left'
wsService.on('user left', (data) => {
  messages.value.push({
    type: 'system',
    message: `${data.username} a quitté le salon`,
    timestamp: new Date()
  });
  nextTick(() => scrollToBottom());
});

// TODO 7d: Écouter 'online users'
wsService.on('online users', (data) => {
  onlineUsers.value = data.users || data;
});

// TODO 7e: Écouter 'typing'
wsService.on('typing', (data) => {
  if (data.username !== username.value) {
    typingUser.value = data.username;
  }
});

// TODO 7f: Écouter 'stop typing'
wsService.on('stop typing', () => {
  typingUser.value = null;
});

// TODO 7g: Écouter 'error'
wsService.on('error', (error) => {
  console.error('Erreur WebSocket:', error);
  alert('Erreur: ' + (error.message || 'Erreur inconnue'));
});
```

---

#### TODO 8 - Ligne ~243 (Facile ⭐)
**Envoyer un message**

```javascript
const sendMessage = () => {
  const message = inputMessage.value.trim();
  if (message.length === 0) return;

  // TODO 8: Implémenter la logique d'envoi de message ici
};
```

**À faire**:
```javascript
wsService.emit('chat message', {
  username: username.value,
  message,
  room: room.value
});

inputMessage.value = '';
wsService.emit('stop typing', { room: room.value });
typingUser.value = null;
```

---

#### TODO 9 - Ligne ~223 (Facile ⭐)
**Rejoindre un salon**

```javascript
const joinRoom = () => {
  // TODO 9: Implémenter la logique de join room
};
```

**À faire**:
```javascript
wsService.emit('join room', {
  username: username.value,
  room: room.value
});
```

---

#### TODO 10 - Ligne ~256 (Moyen ⭐⭐)
**Gérer l'indicateur de frappe**

```javascript
const handleTyping = () => {
  // TODO 10: Implémenter la logique de frappe ici
};
```

**À faire**:
```javascript
wsService.emit('typing', {
  username: username.value,
  room: room.value
});

if (typingTimeout.value) {
  clearTimeout(typingTimeout.value);
}

typingTimeout.value = setTimeout(() => {
  wsService.emit('stop typing', { room: room.value });
}, 2000);
```

---

## Dépendances et fonctions disponibles

### Fonctions disponibles dans server.js

```javascript
// Ajouter un utilisateur à un salon
addUserToRoom(socketId, username, room);

// Retirer un utilisateur d'un salon
removeUserFromRoom(socketId, room);

// Récupérer la liste unique des utilisateurs
getUsersInRoom(room);  // Retourne: Array<string>
```

### Accès à MongoDB

```javascript
const db = getDB();
await db.collection('messages').insertOne({...});
await db.collection('messages').find({...}).toArray();
```

### Service Socket.IO côté client

```javascript
import socketioService, { apiUrl } from '../services/socketio';

wsService.emit(event, data);      // Envoyer
wsService.on(event, callback);    // Écouter
wsService.disconnect();           // Déconnecter
wsService.isConnected();          // Vérifier
```

---

## Ordre recommandé pour implémenter

1. **TODO 1** - Simple log pour vérifier la connexion
2. **TODO 2** - Rejoindre un salon
3. **TODO 3** - Envoyer et recevoir des messages
4. **TODO 7** - Écouter les messages (côté client)
5. **TODO 8** - Envoyer un message (côté client)
6. **TODO 9** - Rejoindre un salon (côté client)
7. **TODO 4 & 10** - Indicateur de frappe
8. **TODO 5** - Gestion de la déconnexion

---

## Checklist de test

Après chaque TODO, testez:

- [ ] Backend démarre sans erreur
- [ ] Frontend se connecte au backend
- [ ] Pas d'erreurs dans la console
- [ ] Fonctionnalité fonctionne comme attendu

---

## Points clés à retenir

1. **Socket.IO asymétrique**: `socket.to(room)` n'envoie pas à l'émetteur, `io.to(room)` envoie à tous
2. **Database**: Tous les messages et events système doivent être sauvegardés
3. **State Management**: Maintenir `currentRoom` et `currentUsername` à jour côté serveur
4. **Error Handling**: Vérifier les erreurs lors de la sauvegarde en base de données
5. **User List**: Envoyer la liste mise à jour à chaque changement d'utilisateurs

Bonne chance! 🚀
