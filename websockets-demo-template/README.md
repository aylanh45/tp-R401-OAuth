# WebSockets Chat Demo - Version Template (60% Complète)

Bienvenue! Ceci est la **version éducative** du projet WebSockets Chat. Le projet est **60% complété** et il est de votre responsabilité de compléter les TODOs restants.

## À propos

Une application de chat en temps réel construite avec:
- **Frontend**: Vue.js 3 + Vue Router + Socket.IO Client
- **Backend**: Express.js + Socket.IO
- **Base de données**: MongoDB
- **Communication**: WebSockets (Socket.IO)

## Architecture

```
websockets-demo-template/
├── backend/               # Serveur Express + Socket.IO (5 TODOs)
│   ├── server.js         # Logique Socket.IO (TODOs 1-5)
│   ├── db/connection.js  # Connexion MongoDB (COMPLÈTE)
│   ├── package.json      # Dépendances (COMPLÈTE)
│   └── .env              # Configuration (COMPLÈTE)
│
└── frontend/             # Application Vue.js 3 (7 TODOs)
    ├── src/
    │   ├── views/
    │   │   ├── Login.vue       # Page login (COMPLÈTE)
    │   │   ├── RoomSelector.vue # Sélection salons (COMPLÈTE)
    │   │   └── Chat.vue        # Page chat (7 TODOs)
    │   ├── services/
    │   │   └── socketio.js     # Service Socket.IO (COMPLÈTE)
    │   ├── router/
    │   │   └── index.js        # Vue Router (COMPLÈTE)
    │   ├── App.vue             # Composant principal (COMPLÈTE)
    │   ├── main.js             # Point d'entrée (COMPLÈTE)
    │   └── style.css           # Styles CSS (COMPLÈTE)
    ├── index.html              # HTML (COMPLÈTE)
    ├── vite.config.js          # Config Vite (COMPLÈTE)
    └── package.json            # Dépendances (COMPLÈTE)
```

## Prérequis

- **Node.js** v16+ (https://nodejs.org)
- **MongoDB** en local ou distant
  - Local: MongoDB doit être en écoute sur `mongodb://localhost:27017`
  - Distant: Modifier `MONGODB_URI` dans le fichier `.env`

## Installation

### 1. Cloner et naviguer

```bash
cd websockets-demo-template
```

### 2. Installation Backend

```bash
cd backend
npm install
```

### 3. Installation Frontend

```bash
cd ../frontend
npm install
```

## Configuration

### Backend (.env)

Le fichier `backend/.env` contient:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=websockets-demo
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

À modifier si vous utilisez une MongoDB distante ou un port différent.

### Frontend (URL Socket.IO)

Le fichier `frontend/src/services/socketio.js` contient:
```javascript
const BACKEND_URL = 'http://localhost:3000';
```

À modifier si le backend tourne sur un autre port/hôte.

## Démarrage

### 1. Démarrer MongoDB

```bash
# Si MongoDB est installé localement
mongod

# Ou via Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 2. Démarrer le Backend

```bash
cd backend
npm run dev  # Démarre avec nodemon (auto-reload)
# Ou
npm start    # Démarre sans auto-reload
```

Le serveur démarre sur `http://localhost:3000`

### 3. Démarrer le Frontend (dans un autre terminal)

```bash
cd frontend
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`

### 4. Ouvrir dans le navigateur

Allez à `http://localhost:5173` et entrez votre nom d'utilisateur!

## Structure de Socket.IO

### Émission (Client → Serveur)

```javascript
wsService.emit('event-name', { data });
```

### Écoute (Serveur → Client)

```javascript
wsService.on('event-name', (data) => {
  // Traiter les données
});
```

## Liste des TODOs

### Backend (server.js) - 5 TODOs

#### TODO 1: Gestionnaire de connexion Socket.IO ⭐ *Facile*
- **Fichier**: `backend/server.js`
- **Ligne**: ~125
- **À faire**:
  - Ajouter le code pour afficher un message quand un client se connecte
  - Indice: `io.on('connection', (socket) => { console.log(...) })`

#### TODO 2: Gérer l'événement 'join room' ⭐⭐ *Moyen*
- **Fichier**: `backend/server.js`
- **Ligne**: ~145
- **À faire**:
  1. Si l'utilisateur était dans un autre salon, le quitter d'abord
     - `socket.leave(currentRoom)`
     - `removeUserFromRoom(socket.id, currentRoom)`
     - `socket.to(currentRoom).emit('user left', ...)`
     - `io.to(currentRoom).emit('online users', ...)`
     - Sauvegarder message système dans MongoDB
  2. Rejoindre le nouveau salon
     - Mettre à jour `currentRoom` et `currentUsername`
     - `socket.join(room)`
     - `addUserToRoom(socket.id, username, room)`
     - `socket.to(room).emit('user joined', ...)`
     - `io.to(room).emit('online users', ...)`
     - Sauvegarder message système dans MongoDB

#### TODO 3: Gérer l'événement 'chat message' ⭐⭐ *Moyen*
- **Fichier**: `backend/server.js`
- **Ligne**: ~180
- **À faire**:
  1. Vérifier que le message n'est pas vide
  2. Sauvegarder dans MongoDB: `db.collection('messages').insertOne({...})`
  3. Diffuser à tous: `io.to(room).emit('chat message', ...)`
  4. Afficher un log dans la console

#### TODO 4: Gérer 'typing' et 'stop typing' ⭐ *Facile*
- **Fichier**: `backend/server.js`
- **Ligne**: ~215 et ~223
- **À faire**:
  - `socket.on('typing', ...)` → `socket.to(room).emit('typing', ...)`
  - `socket.on('stop typing', ...)` → `socket.to(room).emit('stop typing')`

#### TODO 5: Gérer la déconnexion ⭐⭐ *Moyen*
- **Fichier**: `backend/server.js`
- **Ligne**: ~230
- **À faire**:
  1. Retirer l'utilisateur: `removeUserFromRoom(socket.id, currentRoom)`
  2. Notifier les autres: `io.to(currentRoom).emit('user left', ...)`
  3. Envoyer la liste mise à jour: `io.to(currentRoom).emit('online users', ...)`
  4. Sauvegarder message système dans MongoDB

### Frontend (Chat.vue) - 7 TODOs

#### TODO 7: Écouter les événements Socket.IO ⭐⭐ *Moyen*
- **Fichier**: `frontend/src/views/Chat.vue`
- **Ligne**: ~265
- **À faire**: Ajouter 7 listeners Socket.IO:
  - `wsService.on('chat message', (data) => { messages.value.push(data); scrollToBottom(); })`
  - `wsService.on('user joined', (data) => { messages.value.push({type: 'system', ...}); })`
  - `wsService.on('user left', (data) => { messages.value.push({type: 'system', ...}); })`
  - `wsService.on('online users', (data) => { onlineUsers.value = data.users || data; })`
  - `wsService.on('typing', (data) => { typingUser.value = data.username; })`
  - `wsService.on('stop typing', () => { typingUser.value = null; })`
  - `wsService.on('error', (error) => { alert('Erreur: ' + error.message); })`

#### TODO 8: Envoyer un message ⭐ *Facile*
- **Fichier**: `frontend/src/views/Chat.vue`
- **Ligne**: ~243
- **À faire**:
  - `wsService.emit('chat message', { username: username.value, message, room: room.value })`
  - `inputMessage.value = ''`
  - `wsService.emit('stop typing', { room: room.value })`
  - `typingUser.value = null`

#### TODO 9: Rejoindre un salon ⭐ *Facile*
- **Fichier**: `frontend/src/views/Chat.vue`
- **Ligne**: ~223
- **À faire**:
  - `wsService.emit('join room', { username: username.value, room: room.value })`

#### TODO 10: Gérer l'indicateur de frappe ⭐⭐ *Moyen*
- **Fichier**: `frontend/src/views/Chat.vue`
- **Ligne**: ~256
- **À faire**:
  1. `wsService.emit('typing', { username: username.value, room: room.value })`
  2. Réinitialiser le timeout
  3. `setTimeout(() => { wsService.emit('stop typing', { room: room.value }); }, 2000)`

## Flux de l'application

### Login
1. Utilisateur entre son nom
2. Le nom est sauvegardé dans `localStorage`
3. Redirection vers `RoomSelector`

### RoomSelector
1. Récupère la liste des salons via `/api/rooms`
2. Affiche les salons disponibles
3. Permet de créer un nouveau salon
4. Quand on clique sur un salon → va à `/chat/:room`

### Chat
1. **Montage du composant**:
   - Récupère le nom d'utilisateur du `localStorage`
   - Connecte au serveur WebSocket
   - Charge l'historique des messages via `/api/messages/:room` (REST API)
   - **TODO 9**: Émet 'join room' → serveur ajoute l'utilisateur au salon
   - **TODO 7**: Écoute les événements Socket.IO

2. **Envoi de message**:
   - Utilisateur tape → **TODO 10**: émet 'typing'
   - Utilisateur envoie → **TODO 8**: émet 'chat message'

3. **Réception de message**:
   - Serveur reçoit → **TODO 3**: sauvegarde dans MongoDB et diffuse à tous
   - **TODO 7**: Client reçoit via 'chat message'

4. **Déconnexion**:
   - Utilisateur se déconnecte → **TODO 5**: serveur notifie les autres

## Messages MongoDB

Les messages sont stockés dans la collection `messages` avec la structure:

```javascript
{
  _id: ObjectId,
  username: String,
  message: String,
  room: String,
  type: 'user' | 'system',  // 'system' pour messages du serveur
  timestamp: Date
}
```

## Routes REST API

Ces routes sont déjà implémentées:

- `GET /api/health` → Vérifier que le serveur fonctionne
- `GET /api/rooms` → Récupérer la liste des salons
- `GET /api/messages/:room` → Récupérer l'historique des messages d'un salon (max 50 derniers)

## Événements Socket.IO

### Client → Serveur

- `join room`: `{ username, room }`
- `chat message`: `{ username, message, room }`
- `typing`: `{ username, room }`
- `stop typing`: `{ room }`

### Serveur → Client

- `chat message`: `{ username, message, room, type, timestamp }`
- `user joined`: `{ username, room }`
- `user left`: `{ username }`
- `online users`: `Array<string>` de noms d'utilisateurs
- `typing`: `{ username }`
- `stop typing`: (pas de données)
- `error`: `{ message }`

## Fonctions Helper fournies

Dans `server.js`, trois fonctions sont déjà implémentées:

```javascript
// Ajouter un utilisateur à un salon
addUserToRoom(socketId, username, room);

// Retirer un utilisateur d'un salon
removeUserFromRoom(socketId, room);

// Récupérer la liste unique des utilisateurs dans un salon
getUsersInRoom(room);  // Retourne: Array<string>
```

## Conseils de développement

1. **Lisez les commentaires TODO** - Ils contiennent des indices
2. **Testez côté serveur d'abord** - Utilisez la console pour déboguer
3. **Utilisez les outils de développement du navigateur** - Network tab pour voir les événements Socket.IO
4. **Commencez par TODO 1 et 2** - Ça vous permettra de rejoindre un salon
5. **Puis TODO 8 et 3** - Pour envoyer et recevoir des messages
6. **Puis TODO 7** - Pour afficher les messages
7. **Les TODOs 4, 5, 10 sont optionnels** pour une version basique

## Débogage

### Backend
- Les logs montrent les connexions et les messages
- Utilisez `console.log()` pour déboguer
- Vérifiez MongoDB avec `mongosh` ou Compass

### Frontend
- Ouvrez la console (F12)
- Onglet Network pour voir les WebSocket events
- Utiliser Vue DevTools pour inspecter l'état

## BONUS: Tâches avancées

Ces tâches sont complètement ouvertes - à vous de décider comment les implémenter!

### BONUS 1: Indicateur "En ligne / Hors ligne" ⭐⭐⭐
Ajouter un indicateur visuel (pastille verte/rouge) à côté de chaque utilisateur dans la barre latérale.

**Indices**:
- Modifier le rendu des `.user-item` dans `Chat.vue`
- Ajouter un système de "heartbeat" pour détecter les déconnexions inattendues
- Le serveur peut envoyer un événement `ping` tous les 30 secondes
- Le client répond avec `pong`

### BONUS 2: Messages privés (Direct Messages) ⭐⭐⭐
Permettre aux utilisateurs d'envoyer des messages privés directement.

**Indices**:
- Chaque socket a un ID unique: `socket.id`
- Pour envoyer à un socket spécifique: `io.to(socketId).emit(...)`
- Il faut un système pour mapper les usernames aux socket IDs
- Ajouter un bouton "Message privé" à côté de chaque utilisateur
- Créer une interface pour les messages privés (modale, pop-up, etc)
- Sauvegarder les messages privés dans une collection MongoDB séparée: `private_messages`

## Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| Connection refused localhost:3000 | Backend pas en écoute | Démarrer le backend avec `npm run dev` |
| Cannot GET /api/rooms | Les routes ne sont pas trouvées | Vérifier que le backend répond |
| Messages n'apparaissent pas | TODO 7 ou 3 non complet | Implémenter les listeners Socket.IO |
| MongoDB connection failed | MongoDB pas en écoute | Démarrer MongoDB ou changer `MONGODB_URI` |
| Erreur de CORS | Frontend et backend sur des domaines différents | Vérifier `FRONTEND_URL` dans `.env` |

## Résumé du travail attendu

- **Backend**: Implémenter 5 TODOs (gestion des événements Socket.IO et MongoDB)
- **Frontend**: Implémenter 7 TODOs (émission et écoute des événements Socket.IO)
- **Total**: ~50-100 lignes de code à ajouter
- **Temps estimé**: 2-4 heures selon votre expérience

## Fonctionnalité finale attendue

Une fois tous les TODOs implémentés, l'application doit:

1. ✅ Permettre aux utilisateurs de se connecter avec un nom d'utilisateur
2. ✅ Voir la liste des salons disponibles
3. ✅ Rejoindre un salon et voir les autres utilisateurs en ligne
4. ✅ Envoyer des messages en temps réel
5. ✅ Recevoir les messages des autres utilisateurs
6. ✅ Voir un indicateur quand quelqu'un tape
7. ✅ Voir les messages système (utilisateur rejoint/quitté)
8. ✅ Voir l'historique des messages précédents
9. ✅ Créer un nouveau salon
10. ✅ Se déconnecter

## Ressources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## Aide et Support

Si vous êtes bloqué:
1. Relisez les indices dans les commentaires TODO
2. Consultez les logs du serveur (console backend)
3. Utilisez la console du navigateur (F12)
4. Comparez avec la version complète dans `websockets-demo/`

Bonne chance! 🚀
