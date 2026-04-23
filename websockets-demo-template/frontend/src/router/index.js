// Configuration du routeur Vue Router
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import RoomSelector from '../views/RoomSelector.vue';
import Chat from '../views/Chat.vue';

// Définir les routes
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/rooms',
    name: 'RoomSelector',
    component: RoomSelector,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:room',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  }
];

// Créer le routeur
const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * Guard de navigation
 * Vérifie que l'utilisateur est connecté (a un username dans localStorage)
 */
router.beforeEach((to, from, next) => {
  const username = localStorage.getItem('username');

  // Si la route nécessite l'authentification
  if (to.meta.requiresAuth) {
    if (username) {
      // Utilisateur authentifié
      next();
    } else {
      // Rediriger vers login
      next({ name: 'Login' });
    }
  } else {
    // Routes publiques (Login)
    // Si déjà connecté et on va à login, rediriger vers rooms
    if (to.name === 'Login' && username) {
      next({ name: 'RoomSelector' });
    } else {
      next();
    }
  }
});

export default router;
