// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App'; // Ensure this path is correct
// import './index.css';
// import React from 'react'

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(
//   // <StrictMode>
//   //   <App />
//   // </StrictMode>
//    <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import './setup-globals';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
// Your other imports...
import App from './App';
// src/main.jsx
import './index.css' // Verify this path is correct

// Debug mounting
console.log('Mounting React...');
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { AuthProvider } from './contexts/AuthContext';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );