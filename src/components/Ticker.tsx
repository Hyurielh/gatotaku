import React from 'react';

interface TickerProps {
  items: string[];
  className?: string;
}

/**
 * Cinta marquee infinita estilo manga (colores sólidos).
 * Contenido duplicado x2 para loop seamless (-50%).
 * Pausa al hover. Decorativa: aria-hidden en copia.
 */
export function Ticker({ items, className }: TickerProps) {
  const content = items.map((item) => `${item} ✦`).join(' ');

  return (
    <div
      className={[
        'overflow-hidden border-y-4 border-black bg-orange-500 py-2 group',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={items.join(', ')}
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            aria-hidden={copy === 1}
            className="whitespace-nowrap font-baloo font-bold uppercase tracking-wider text-black text-sm sm:text-base pr-2"
          >
            {`${content} `}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
