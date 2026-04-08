import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../../api/axios'

export const useAuthStore = defineStore('auth', () => {
  const getSavedUser = () => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === "undefined") {
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  };

  const user = ref(getSavedUser());
  // Token is now stored in httpOnly cookie, not in frontend storage
  const token = ref('');
  const isInitialized = ref(false);

  function setUser(userData) {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  async function logout() {
    try {
      // Call backend to clear the cookie
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the logout call fails, still clear local state
      console.error('Logout error:', error);
    } finally {
      user.value = null;
      token.value = '';
      localStorage.removeItem('user');
    }
  }

  // THE INIT THE GOOD SHIT
  async function init() {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      return true; // authenticated
    } catch (error) {
      // No valid session (401 or other error ult)
      logout();
      return false; // not authenticated
    } finally {
      isInitialized.value = true;
    }
  }

  return { user, token, setUser, logout, init, isInitialized };
});