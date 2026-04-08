<script setup>
import { useAuthStore } from './Front-End/Authorization/Auth'
const auth = useAuthStore()
</script>

<template>
  <div>
    <!-- Loading overlay -->
    <div v-if="!auth.isInitialized" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>

    <!-- Main app -->
    <main v-else>
      <RouterView />
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  font-size: 18px;
  margin: 0;
}
</style>
