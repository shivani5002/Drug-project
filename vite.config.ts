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

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react({
//     include: ['**/*.js', '**/*.jsx'] // This line is correct
//   })],
//   build: {
//     outDir: 'buil',      // Moved outside rollupOptions
//     emptyOutDir: true,      // Moved outside rollupOptions
//     rollupOptions: {
//       input: '/src/main.jsx' // This is correct
//     }
//   },
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false,
//         headers: {
//           Connection: 'keep-alive'
//         },
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js']  // Include all file types
  })],
  build: {
    outDir: 'build',  // Explicit output directory for Render
    emptyOutDir: true,  // Clear directory before build
    chunkSizeWarningLimit: 1000,  // Increase chunk warning limit
    rollupOptions: {
      input: '/src/main.jsx',  // Entry point
      output: {
        manualChunks: {  // Code splitting optimization
          threejs: ['three', '3dmol'],
          react: ['react', 'react-dom'],
          vendor: ['lodash', 'axios']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {  // For local development
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  // For production environment variables
  define: {
    'process.env': {
      REACT_APP_AUTH_API_URL: JSON.stringify(process.env.REACT_APP_AUTH_API_URL),
      REACT_APP_VIT_API_URL: JSON.stringify(process.env.REACT_APP_VIT_API_URL)
    }
  }
});