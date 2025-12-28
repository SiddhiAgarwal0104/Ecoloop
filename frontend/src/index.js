// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
// Tailwind compatibility: if Tailwind is installed, import base styles
try {
  // eslint-disable-next-line
  require('./index.css');
} catch (e) {
  // tailwind not installed in this environment - fall back to existing styles
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
