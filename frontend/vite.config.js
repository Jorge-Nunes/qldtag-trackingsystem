import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 6173,
    host: '0.0.0.0',
    proxy: isProduction ? undefined : {
      '/api': {
        target: 'http://localhost:6001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:6001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
