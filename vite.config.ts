// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react({
//     include: ['**/*.js', '**/*.jsx'] // Add this line
//   })],
//   build: {
//     rollupOptions: {
//       input: '/src/main.jsx', // Ensure this points to your entry file
//     },
//   },
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    include: ['**/*.js', '**/*.jsx'] // This line is correct
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',      // Moved outside rollupOptions
    emptyOutDir: true,      // Moved outside rollupOptions
    chunkSizeWarningLimit: 1600, 
    rollupOptions: {
      input: path.resolve(__dirname, './src/main.jsx'),
       output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          three: ['three', '3dmol']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      'three',
      '3dmol'
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        headers: {
          Connection: 'keep-alive'
        },
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});