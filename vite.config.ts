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
// import path from 'path';

// export default defineConfig ({
//   plugins: [ {name: 'log-build-info',
//       config() {
//          console.log('Build output will go to: dist/')
//       }
//     },
//     react({
//       jsxImportSource: '@emotion/react',
//   //include: ['**/*.js', '**/*.jsx'], //s line is correct
//      babel: {
//        //resets: ['@babel/preset-react'],
//         plugins: ['@emotion/babel-plugin'],
//       }
//   })],
//   define: {
//     // Only include essential defines
//     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    
//   },
//    optimizeDeps: {
   
//     exclude: ['lucide-react'],
//   },
//   resolve: {
//     alias: {
//    '@': path.resolve(__dirname, './src'),
//       // Point to the correct file that actually exists
//       '3dmol': path.resolve(__dirname, 'node_modules/3dmol/build/3Dmol.js'),
//         '@mui/icons-material': '@mui/icons-material/esm'
//     }
//   },
//     // define: {
//     // __HMR_CONFIG_NAME__: JSON.stringify('vite-hmr'),
//     // },
//   base: '/',
//   build: { // Generates manifest.json for production
//     outDir:  'dist',  // Absolute path     // Moved outside rollupOptions
//   //emptyOutDir: true,      // Moved outside rollupOptions
//      manifest: true,
//    //external: ['3dmol'],
//     chunkSizeWarningLimit: 2000, 
//     rollupOptions: {
//        input: {
//         main: './index.html' // Explicit entry point
//       },
//        output: {
//         manualChunks: {
//           vendor: ['react', 'react-dom'],
//           mui: ['@mui/material', '@mui/icons-material'],
//         //three: ['three', '3dmol']
//         },
//           globals: {
//           '3dmol': '$3Dmol'
//         }
//       }
      
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
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  define: {
    // Essential production defines
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.PROD': 'true',
    'import.meta.env.DEV': 'false',
    'import.meta.hot': 'undefined',
    
    // Explicitly nullify all HMR-related variables
    '__BASE__': JSON.stringify('./'),
    '__SERVER_HOST__': 'undefined',
    '__HMR_PROTOCOL__': 'undefined',
    '__HMR_PORT__': 'undefined',
    '__HMR_HOSTNAME__': 'undefined',
    '__HMR_BASE__': 'undefined',
    '__HMR_DIRECT_TARGET__': 'undefined',
    '__HMR_ENABLE_OVERLAY__': 'false',
    '__HMR_CONFIG_NAME__': 'undefined',
    '__DEFINES__': JSON.stringify({})
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mui/icons-material': '@mui/icons-material/esm',
      '3dmol': path.resolve(__dirname, 'node_modules/3dmol/build/3Dmol.js')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild', // Simpler than terser
    rollupOptions: {
      external: ['3dmol'],
      output: {
        globals: {
          '3dmol': '$3Dmol'
        }
      }
    }
  },
  server: {
    hmr: false,
     proxy: {
      '/api': {
        //target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});