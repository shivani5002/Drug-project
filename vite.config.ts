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
  plugins: [react({
    include: ['**/*.js', '**/*.jsx'] // This line is correct
  })],
  build: {
    outDir: '../dist',      // Moved outside rollupOptions
    emptyOutDir: true,      // Moved outside rollupOptions
    rollupOptions: {
      input: '/src/main.jsx' // This is correct
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