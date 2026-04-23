<template>
  <div class="page chat-page">
    <!-- Partie principale du chat -->
    <div class="chat-main">
      <!-- En-tête du chat -->
      <div class="chat-header">
        <div>
          <h2>#{{ room }}</h2>
        </div>
        <div class="chat-header-actions">
          <button @click="goBackToRooms">Changer de salon</button>
          <button @click="logout" class="btn-danger">Se déconnecter</button>
        </div>
      </div>

      <!-- Conteneur des messages -->
      <div ref="messagesContainer" class="messages-container">
        <div v-for="(msg, index) in messages" :key="index">
          <!-- Messages système -->
          <div v-if="msg.type === 'system'" class="message-system">
            {{ msg.message }}
          </div>

          <!-- Messages utilisateur -->
          <div v-else class="message-user" :class="{ own: msg.username === username }">
            <div class="message-content">
              <div v-if="msg.username !== username" class="message-username">
                {{ msg.username }}
              </div>
              <div class="message-text">{{ msg.message }}</div>
              <div class="message-time">
                {{ formatTime(msg.timestamp) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateur de frappe -->
        <div v-if="typingUser" class="typing-indicator">
          <span>{{ typingUser }} est en train d'écrire</span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>

      <!-- Zone de saisie -->
      <div class="input-container">
        <div class="input-wrapper">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Écrivez un message..."
            @keyup.enter="sendMessage"
            @input="handleTyping"
          />
          <button @click="sendMessage" :disabled="!inputMessage.trim()">
            Envoyer
          </button>
        </div>
      </div>
    </div>

    <!-- Barre latérale - Utilisateurs en ligne -->
    <div class="sidebar">
      <div class="sidebar-header">
        👥 En ligne ({{ onlineUsers.length }})
      </div>
      <div class="online-users">
        <div v-if="onlineUsers.length > 0">
          <div v-for="user in onlineUsers" :key="user" class="user-item">
            <div class="user-item-dot"></div>
            <span>{{ user }}</span>
            <span v-if="user === username" style="font-size: 0.8rem; color: #7f8c8d;">
              (vous)
            </span>
          </div>
        </div>
        <div v-else class="no-users">
          Aucun utilisateur en ligne
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import socketioService, { apiUrl } from '../services/socketio';

const router = useRouter();
const route = useRoute();

const room = computed(() => route.params.room);

const username = ref('');
const messages = ref([]);
const inputMessage = ref('');
const onlineUsers = ref([]);
const typingUser = ref(null);
const typingTimeout = ref(null);
const messagesContainer = ref(null);

const wsService = socketioService;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const loadMessageHistory = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/messages/${room.value}`);
    if (response.ok) {
      messages.value = await response.json();
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
  }
};

// TODO 9: Rejoindre le salon via WebSocket
const joinRoom = () => {
  wsService.emit('join room', {
    username: username.value,
    room: room.value
  });
  loadMessageHistory();
};

// TODO 8: Envoyer un message via Socket.IO
const sendMessage = () => {
  const message = inputMessage.value.trim();

  if (message.length === 0) return;

  wsService.emit('chat message', {
    username: username.value,
    message: message,
    room: room.value
  });

  inputMessage.value = '';

  wsService.emit('stop typing', { room: room.value });
  typingUser.value = null;
};

// TODO 10: Gérer l'indicateur de frappe
const handleTyping = () => {
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
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const goBackToRooms = () => {
  router.push({ name: 'RoomSelector' });
};

const logout = () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    wsService.disconnect();
    localStorage.removeItem('username');
    router.push({ name: 'Login' });
  }
};

onMounted(async () => {
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    username.value = storedUsername;
  } else {
    router.push({ name: 'Login' });
    return;
  }

  try {
    if (typeof wsService.connect === 'function') {
      await wsService.connect();
    }
  } catch (error) {
    console.error('Erreur de connexion WebSocket:', error);
  }

  await loadMessageHistory();

  joinRoom();

  // TODO 7: ÉCOUTER LES ÉVÉNEMENTS WEBSOCKET

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
  wsService.on('online users', (users) => {
    onlineUsers.value = users;
  });

  // TODO 7e: Écouter 'typing'
  wsService.on('typing', (data) => {
    typingUser.value = data.username;
  });

  // TODO 7f: Écouter 'stop typing'
  wsService.on('stop typing', () => {
    typingUser.value = null;
  });

  // TODO 7g: Écouter 'error'
  wsService.on('error', (data) => {
    alert(data.message || 'Une erreur est survenue');
  });
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
});
</script>

<style scoped>
/* Les styles sont définis dans style.css */
</style>
