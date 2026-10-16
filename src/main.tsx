import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize dark mode before render to prevent theme flash
try {
  const savedSettings = localStorage.getItem('quran_reader_settings');
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    if (parsed.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    }
  }
} catch {
  // Ignore storage read error
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
