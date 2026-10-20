import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // main bundle = react + router + framer-motion + swiper (~160 kB gzipped); dashboards are split out
  build: { chunkSizeWarningLimit: 700 },
  server: {
    port: 5173,
    // Forward /api calls to the Express backend in development
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
