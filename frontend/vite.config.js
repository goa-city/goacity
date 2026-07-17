import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // In dev mode, /api calls are proxied through the production nginx (port 80)
        // which in turn routes to the backend.
        // To use a fully local backend, create frontend/.env.local with:
        //   VITE_API_PROXY=http://localhost:5001
        // then run the backend locally: ./dev-backend.sh
        '/api': {
          target: env.VITE_API_PROXY || 'http://80.225.200.51',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_API_PROXY || 'http://80.225.200.51',
          changeOrigin: true,
        },
      },
    },
  }
})
