// src/api/index.js (or similar)
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080'
})

api.interceptors.request.use((config) => {
  // 1. Check if the key name is 'token' or 'JWT_TOKEN' 
  // It must match what you used in Login.vue!
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // 2. Ensure "Bearer " has the space after it
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token attached to request:", token); // Add this to debug
  } else {
    console.warn("No token found in localStorage!");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;