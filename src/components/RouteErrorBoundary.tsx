import { useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const RELOAD_KEY = 'gatotaku:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 15000;

/** Errores típicos de un chunk que ya no existe tras un deploy. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /dynamically imported module|importing a module script|loading chunk|preloaderror/i.test(message);
}

function reloadOnce(): void {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sin sessionStorage igual recargamos
  }

  window.location.reload();
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Evita la pantalla en blanco si una ruta falla al cargar.
 * - Chunk viejo (deploy nuevo): recarga automática una vez
 * - Cualquier otro error: tarjeta con reintentar / recargar
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation();

  const handleError = useCallback((error: unknown) => {
    console.error('Error al cargar la pantalla', error);

    if (isChunkLoadError(error)) {
      reloadOnce();
    }
  }, []);

  return (
    <ErrorBoundary
      resetKeys={[location.pathname]}
      onError={handleError}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex min-h-[24rem] items-center justify-center px-4 py-8">
          <div className="panel w-full max-w-md p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
            <h1 className="mt-3 text-xl font-bold text-slate-900">
              No pudimos cargar esta pantalla
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Puede ser que la tienda se haya actualizado. Reintenta o recarga la página.
            </p>
            <p className="mt-2 break-words text-[11px] text-slate-400">
              {(error instanceof Error ? error.message : String(error)).slice(0, 160)}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetErrorBoundary();
                  window.location.reload();
                }}
                className="btn-primary"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Recargar página
              </button>
              <button type="button" onClick={resetErrorBoundary} className="btn-secondary">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default RouteErrorBoundary;
