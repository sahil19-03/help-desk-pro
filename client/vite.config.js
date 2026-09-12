import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: '../dist',    // outputs to project-root/dist — matches vercel.json outputDirectory: "dist"
    emptyOutDir: true,    // silence Vite's out-of-root warning and clean before build
  },

  // In local dev, proxy /api/* to the Express server so fetch('/api/...')
  // works without CORS issues and without needing VITE_API_URL.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
