import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Proxy the API locally so requests are same-origin (avoids CORS)
const proxy = {
  '/updates/api': {
    target: 'https://bigorange.cloud',
    changeOrigin: true,
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/updates/' : '/',
  server: { proxy },
  preview: { proxy },
})
