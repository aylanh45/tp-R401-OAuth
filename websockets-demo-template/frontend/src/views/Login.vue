<template>
  <div class="login-page">
    <div class="login-card">
      <h1>💬 Chat R401</h1>
      <p>Entrez votre nom pour commencer</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Ex: Alice, Bob, ..."
            maxlength="20"
            autofocus
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="!username.trim()">
          Se connecter
        </button>
      </form>

      <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #7f8c8d;">
        Backend: {{ backendType }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');

// Déterminer quel backend est utilisé
const backendType = ref('Socket.IO (Template)');

/**
 * Gère la connexion de l'utilisateur
 */
const handleLogin = () => {
  const name = username.value.trim();

  if (name.length === 0) {
    alert('Veuillez entrer un nom d\'utilisateur');
    return;
  }

  // Sauvegarder le nom d'utilisateur dans localStorage
  localStorage.setItem('username', name);

  // Rediriger vers la sélection de salons
  router.push({ name: 'RoomSelector' });
};
</script>

<style scoped>
/* Les styles sont définis dans style.css */
</style>
