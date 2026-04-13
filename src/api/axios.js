import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true // Important: send cookies with requests
});

api.interceptors.request.use((config) => {
  // Grab the token you saved during login
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors - clear user from localStorage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored user data on unauthorized
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
