<template>
  <div class="page">
    <div class="room-selector-page">
      <!-- En-tête -->
      <div class="room-header">
        <h1>Choisir un salon 🏠</h1>
        <p>Connecté en tant que: <strong>{{ username }}</strong></p>
      </div>

      <!-- Contenu -->
      <div class="room-content">
        <div class="room-list">
          <!-- Liste des salons existants -->
          <h3 class="room-list-title">Salons disponibles</h3>

          <div v-if="rooms.length > 0" class="room-grid">
            <div
              v-for="room in rooms"
              :key="room"
              class="room-card"
              @click="selectRoom(room)"
            >
              <h3>#{{ room }}</h3>
              <p>Cliquez pour rejoindre</p>
            </div>
          </div>

          <p v-else style="color: #7f8c8d; text-align: center; padding: 2rem;">
            Chargement des salons...
          </p>

          <!-- Créer un nouveau salon -->
          <div class="create-room-section">
            <h2>Créer un nouveau salon</h2>
            <form @submit.prevent="createNewRoom" class="create-room-form">
              <input
                v-model="newRoomName"
                type="text"
                placeholder="Nom du nouveau salon (ex: nodejs, discuss, ...)"
                maxlength="30"
                required
              />
              <button type="submit" class="btn btn-primary" :disabled="!newRoomName.trim()">
                Créer
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Bouton de déconnexion -->
      <div style="padding: 1rem; text-align: center; border-top: 1px solid #ecf0f1;">
        <button @click="logout" class="btn btn-danger">
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiUrl } from '../services/socketio';

const router = useRouter();
const username = ref('');
const rooms = ref([]);
const newRoomName = ref('');

/**
 * Récupère la liste des salons disponibles
 */
const loadRooms = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/rooms`);
    if (response.ok) {
      rooms.value = await response.json();
    } else {
      console.error('Erreur lors de la récupération des salons');
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    // Utiliser les salons par défaut en cas d'erreur
    rooms.value = ['general', 'javascript', 'random'];
  }
};

/**
 * Rejoint un salon sélectionné
 */
const selectRoom = (room) => {
  router.push({ name: 'Chat', params: { room } });
};

/**
 * Crée un nouveau salon
 */
const createNewRoom = () => {
  const roomName = newRoomName.value.trim().toLowerCase();

  if (roomName.length === 0) {
    alert('Veuillez entrer un nom de salon');
    return;
  }

  // Ajouter le salon à la liste s'il n'y est pas déjà
  if (!rooms.value.includes(roomName)) {
    rooms.value.push(roomName);
  }

  // Vider l'input
  newRoomName.value = '';

  // Rejoindre immédiatement le salon
  selectRoom(roomName);
};

/**
 * Déconnecte l'utilisateur
 */
const logout = () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    localStorage.removeItem('username');
    router.push({ name: 'Login' });
  }
};

/**
 * Initialise le composant
 */
onMounted(() => {
  // Récupérer le nom d'utilisateur
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    username.value = storedUsername;
  }

  // Charger les salons
  loadRooms();

  // Rafraîchir la liste des salons toutes les 10 secondes
  const interval = setInterval(loadRooms, 10000);

  // Nettoyer l'intervalle quand le composant est détruit
  return () => clearInterval(interval);
});
</script>

<style scoped>
/* Les styles sont définis dans style.css */
</style>
