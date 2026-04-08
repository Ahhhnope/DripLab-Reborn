import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../../api/axios'

export const useAuthStore = defineStore('auth', () => {
  // Start with null - we'll load from server via init()
  const user = ref(null);
  // Token is now stored in httpOnly cookie, not in frontend storage
  const token = ref('');
  const isInitialized = ref(false);
  let initPromise = null; // Prevent duplicate calls

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

  // Initialize auth state - can be called multiple times safely
  async function init() {
    // If already initialized or initialization in progress, return existing promise
    if (isInitialized.value || initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
        isInitialized.value = true;
        return true; // authenticated
      } catch (error) {
        // No valid session (401 or other error)
        logout();
        isInitialized.value = true;
        return false; // not authenticated
      }
    })();

    return initPromise;
  }

  return { user, token, setUser, logout, init, isInitialized };
});