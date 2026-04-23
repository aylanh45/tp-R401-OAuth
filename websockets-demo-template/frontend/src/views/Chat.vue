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
            <div class="user-item-dot" style="background-color: #2ecc71;"></div>
            <span>{{ user }}</span>
            <span v-if="user === username" style="font-size: 0.8rem; color: #7f8c8d;">
              (vous)
            </span>
            <button v-else @click="openPrivateChat(user)" class="btn-mp" style="margin-left: auto; font-size: 0.7rem; padding: 2px 5px; cursor: pointer;">
              MP
            </button>
          </div>
        </div>
        <div v-else class="no-users">
          Aucun utilisateur en ligne
        </div>
      </div>
    </div>

    <!-- Modal Messages Privés (BONUS 2) -->
    <div v-if="showPrivateModal" class="private-modal">
      <div class="private-modal-content">
        <div class="private-modal-header">
          <h3>MP avec {{ privateChatUser }}</h3>
          <button @click="closePrivateChat">Fermer</button>
        </div>
        <div class="private-messages-container" ref="privateMessagesContainer">
          <div v-for="(msg, idx) in privateMessages" :key="idx" class="message-user" :class="{ own: msg.fromUsername === username }">
            <div class="message-content">
              <div v-if="msg.fromUsername !== username" class="message-username">{{ msg.fromUsername }}</div>
              <div class="message-text">{{ msg.message }}</div>
              <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
        </div>
        <div class="input-wrapper">
          <input
            v-model="privateInputMessage"
            type="text"
            placeholder="Message privé..."
            @keyup.enter="sendPrivateMessage"
          />
          <button @click="sendPrivateMessage" :disabled="!privateInputMessage.trim()">Envoyer</button>
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

// BONUS 2: Private messages state
const showPrivateModal = ref(false);
const privateChatUser = ref('');
const privateMessages = ref([]);
const privateInputMessage = ref('');
const privateMessagesContainer = ref(null);

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

// BONUS 2: Private Chat Functions
const openPrivateChat = async (user) => {
  privateChatUser.value = user;
  showPrivateModal.value = true;
  try {
    const response = await fetch(`${apiUrl}/api/private-messages/${username.value}/${user}`);
    if (response.ok) {
      privateMessages.value = await response.json();
      nextTick(() => {
        if (privateMessagesContainer.value) {
          privateMessagesContainer.value.scrollTop = privateMessagesContainer.value.scrollHeight;
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des MP:', error);
  }
};

const closePrivateChat = () => {
  showPrivateModal.value = false;
  privateChatUser.value = '';
};

const sendPrivateMessage = () => {
  if (!privateInputMessage.value.trim()) return;
  wsService.emit('private message', {
    fromUsername: username.value,
    toUsername: privateChatUser.value,
    message: privateInputMessage.value
  });
  privateInputMessage.value = '';
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

  // BONUS 1: Pong
  wsService.on('ping', () => {
    wsService.emit('pong');
  });

  // BONUS 2: Private message event
  wsService.on('private message', (msg) => {
    if (
      showPrivateModal.value &&
      (privateChatUser.value === msg.fromUsername || privateChatUser.value === msg.toUsername)
    ) {
      privateMessages.value.push(msg);
      nextTick(() => {
        if (privateMessagesContainer.value) {
          privateMessagesContainer.value.scrollTop = privateMessagesContainer.value.scrollHeight;
        }
      });
    } else if (msg.fromUsername !== username.value) {
      alert(`Nouveau message privé de ${msg.fromUsername}: ${msg.message}`);
    }
  });
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
});
</script>

<style scoped>
/* Les styles sont définis dans style.css, on ajoute juste ceux du modal MP ici */
.private-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.private-modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  height: 500px;
}
.private-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.private-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>
