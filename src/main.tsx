import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { observeAndCleanStyles } from './lib/utils';

// Start automated conversion of oklch/oklab to high-support hsl CSS formats
observeAndCleanStyles();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
