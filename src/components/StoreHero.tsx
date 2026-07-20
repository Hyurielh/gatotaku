import React from 'react';
import { PawShape } from './AmbientBackground';

/**
 * Hero grande estilo manga/sticker para StoreFront.
 * Colores sólidos (negro + naranja), sombras duras, SIN degradados.
 * CTA hace scroll suave a la grid existente (no agrega funcionalidad nueva).
 */
export const StoreHero: React.FC = React.memo(() => {
  const scrollToProducts = () => {
    try {
      document
        .querySelector('.products-grid-wrapper')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      /* scroll es decorativo, ignorar */
    }
  };

  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border-4 border-black bg-black text-white shadow-hard-orange animate-fade-up">
      {/* Textura de huellas */}
      <div className="absolute inset-0 pattern-paws-light" aria-hidden="true" />

      {/* Huellas flotando (decorativas) */}
      <span
        aria-hidden="true"
        className="absolute bottom-6 right-6 text-orange-500/30 animate-float hidden sm:block"
      >
        <PawShape size={64} rotate={-18} />
      </span>
      <span
        aria-hidden="true"
        className="absolute top-16 left-4 text-white/15 animate-float hidden md:block"
        style={{ animationDelay: '1.4s' }}
      >
        <PawShape size={44} rotate={22} />
      </span>

      {/* Sticker giratorio */}
      <div
        aria-hidden="true"
        className="absolute top-4 right-4 sm:top-6 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500 border-2 border-black shadow-hard-sm flex items-center justify-center text-center font-baloo font-bold text-[10px] sm:text-xs uppercase leading-tight text-black animate-rotate-slow"
      >
        100%<br />Otaku
      </div>

      <div className="relative z-10 px-4 py-10 sm:px-10 sm:py-14">
        <p className="font-baloo uppercase tracking-widest text-orange-400 text-xs sm:text-sm mb-2 animate-fade-up">
          Tienda de anime · Rivas, Nicaragua
        </p>

        <h1
          className="font-black text-4xl sm:text-6xl lg:text-7xl leading-none mb-4 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          GATO<span className="text-orange-500">TAKU</span>
        </h1>

        <p
          className="max-w-xl text-sm sm:text-lg mb-6 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          <span className="marker-highlight">
            Figuras, peluches y merch de tus animes favoritos
          </span>
        </p>

        <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-6 py-3 border-2 border-black shadow-hard-sm transition-all duration-200 hover:bg-orange-600 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Ver productos ↓
          </button>
        </div>
      </div>
    </section>
  );
});

export default StoreHero;
