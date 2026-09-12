import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Output to the root /dist folder so Vercel outputDirectory: "dist" works
  build: {
    outDir: '../dist',
    emptyOutDir: true,
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
