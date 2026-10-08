import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // En GitHub Pages la ruta es /beca18-unsm-smart-academy/
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
