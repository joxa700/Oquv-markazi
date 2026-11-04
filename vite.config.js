import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('i18next')) return 'i18n';
          if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) return 'state';
          if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
