import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { SEO } from '../components/SEO';

const NEKOS_ENDPOINT = 'https://nekos.best/api/v2/cry';
const FALLBACK_GIF = '/working.gif';
const REQUEST_TIMEOUT_MS = 6000;

export default function NotFound() {
  const [gifUrl, setGifUrl] = useState<string>(FALLBACK_GIF);
  const [isFallback, setIsFallback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let cancelled = false;

    const loadGif = async () => {
      try {
        const response = await fetch(NEKOS_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`nekos.best respondió ${response.status}`);
        }

        const data = await response.json();
        const url = data?.results?.[0]?.url;

        if (!url || typeof url !== 'string') {
          throw new Error('nekos.best no devolvió ninguna imagen');
        }

        if (!cancelled) {
          setGifUrl(url);
          setIsFallback(false);
        }
      } catch {
        if (!cancelled) {
          setGifUrl(FALLBACK_GIF);
          setIsFallback(true);
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    loadGif();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const handleImageError = useCallback(() => {
    setGifUrl(FALLBACK_GIF);
    setIsFallback(true);
  }, []);

  return (
    <div className="login-panel flex min-h-[32rem] items-center justify-center px-4 py-8 sm:px-6">
      <SEO
        title="Página no encontrada - Gatotaku"
        description="La página que buscas no existe en Gatotaku."
      />
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="panel w-full max-w-lg p-6 text-center sm:p-8" aria-labelledby="notfound-title">
        <div className="relative mx-auto aspect-[457/394] w-full max-w-sm">
          {isLoading && (
            <div className="absolute inset-0 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
          )}
          <img
            src={gifUrl}
            alt="Ilustración animada de un personaje anime"
            className={`relative h-full w-full rounded-xl border border-slate-200 bg-white object-contain transition-opacity duration-500 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
          />
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
          Gatotaku
        </p>
        <h1 id="notfound-title" className="mt-1 text-3xl font-bold text-slate-900">
          404
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          ¡Ups! Esta página se escapó a otra dimensión.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          El enlace que buscas no existe o cambió de dirección. Pero hay productos esperando por ti.
        </p>

        {isFallback && !isLoading && (
          <p className="mt-3 text-xs text-slate-400">
            No pudimos cargar la imagen de nekos.best, mostramos una ilustración local.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link to="/" className="btn-primary">
            <ArrowLeft size={17} aria-hidden="true" />
            Volver al inicio
          </Link>
          <button type="button" onClick={retry} className="btn-secondary" disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" className={isLoading ? 'animate-spin' : undefined} />
            Reintentar imagen
          </button>
        </div>
      </section>
    </div>
  );
}
