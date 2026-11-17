import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rolldownOptions: {
      output: {
        // three.js ships as two modules; keep its core in its own chunk so the landing page's lazily loaded
        // 3D background downloads as two parallel files instead of one 0.5 MB file.
        codeSplitting: { groups: [{ name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core/ }] }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
