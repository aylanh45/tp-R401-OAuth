// Point d'entrée principal de l'application Vue.js 3
import { createApp } from 'vue';
import router from './router/index';
import App from './App.vue';
import './style.css';

// Créer et configurer l'application Vue
const app = createApp(App);

// Utiliser le router
app.use(router);

// Monter l'application
app.mount('#app');
