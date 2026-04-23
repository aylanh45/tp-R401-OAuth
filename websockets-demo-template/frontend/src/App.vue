<template>
  <div class="container">
    <!-- Vue Router - affiche le composant de la route actuelle -->
    <router-view />
  </div>
</template>

<script setup>
// Le composant principal contient juste le router-view
// Les styles globaux sont définis dans style.css
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
