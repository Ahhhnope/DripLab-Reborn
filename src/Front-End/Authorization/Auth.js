import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useAuthStore = defineStore('auth', () => {
  const getSavedUser = () => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === "undefined") return null; // Catch the "undefined" string
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  };

  const user = ref(getSavedUser());
  const token = ref(localStorage.getItem('token') || '');

  function setUser(userData, newToken) {
    user.value = userData;
    token.value = newToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', newToken);
  }

  function logout() {
    user.value = null;
    token.value = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return { user, token, setUser, logout };
});