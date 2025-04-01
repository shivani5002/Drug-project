// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    include: ['**/*.js', '**/*.jsx'] // Add this line
  })],
  build: {
    rollupOptions: {
      input: '/src/main.jsx', // Ensure this points to your entry file
    },
  },
});