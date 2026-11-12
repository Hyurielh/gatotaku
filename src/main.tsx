import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Cuando se despliega una versión nueva cambian los hashes de los chunks.
 * Una pestaña abierta pide un archivo que ya no existe y el import dinámico falla.
 * Vite emite `vite:preloadError`: recargamos una sola vez para tomar la versión nueva.
 */
const RELOAD_KEY = 'gatotaku:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 15000;

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);

    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;

    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
