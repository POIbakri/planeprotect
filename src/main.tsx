import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { performanceMonitor } from './lib/performance';
import { securityMonitor } from './lib/security';

// Initialize monitoring
performanceMonitor.startMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);