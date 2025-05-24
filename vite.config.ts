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

export default defineConfig({
  plugins: [ {name: 'log-build-info',
      config() {
         console.log('Build output will go to: dist/')
      }
    },
    react({
    include: ['**/*.js', '**/*.jsx'] // This line is correct
  })],
  resolve: {
    alias: {
      '@': './src'
    }
  },
  base: '/',
  build: {
    outDir:  'dist',  // Absolute path     // Moved outside rollupOptions
    assetsDir: '.',
    emptyOutDir: true,      // Moved outside rollupOptions
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      input: './src/main.jsx',
       output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          three: ['three', '3dmol']
        }
      }
    }
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