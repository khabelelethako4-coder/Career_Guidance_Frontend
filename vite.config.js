import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Choose backend target automatically based on environment
const backendTarget =
  process.env.NODE_ENV === 'production'
    ? 'https://career-guidance-application-backend.onrender.com/' // 🌐 Render backend (production)
    : 'http://localhost:5000'; // 💻 Local backend (development)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false, // allows self-signed localhost certificates if used
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    'process.env.BACKEND_URL': JSON.stringify(backendTarget),
  },
});
