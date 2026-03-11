import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiUrl = process.env.VITE_API_URL || 'http://localhost:6001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6173,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true
      },
      '/uploads': {
        target: apiUrl,
        changeOrigin: true
      }
    }
  }
})
