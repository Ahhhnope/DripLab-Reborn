import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(),vue()],
  server: {
    port: 5005,
    open: true,
    strictPort: true,
    fs: {
      strict: false,
      allow: ['..'],
    }
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  root: './src/Admin',
  publicDir: '../../public'
})