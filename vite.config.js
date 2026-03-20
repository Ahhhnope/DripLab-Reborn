import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite' // <-- Dòng 1: Import tailwind

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // <-- Dòng 2: Thêm vào đầu danh sách plugins
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})