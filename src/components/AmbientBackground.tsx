import React from 'react';

interface Particle {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  rotate: number;
  tone: 'orange' | 'gray';
  hideOnMobile?: boolean;
}

/* Posiciones fijas (no random) para evitar re-render caos */
const PARTICLES: Particle[] = [
  { top: '18%', left: '4%', size: 34, delay: '0s', duration: '5s', rotate: -15, tone: 'orange' },
  { top: '35%', left: '88%', size: 42, delay: '1.2s', duration: '6s', rotate: 20, tone: 'gray' },
  { top: '55%', left: '10%', size: 28, delay: '0.6s', duration: '4.5s', rotate: 10, tone: 'gray', hideOnMobile: true },
  { top: '70%', left: '82%', size: 36, delay: '2s', duration: '5.5s', rotate: -25, tone: 'orange', hideOnMobile: true },
  { top: '82%', left: '30%', size: 30, delay: '0.3s', duration: '5s', rotate: 15, tone: 'orange' },
  { top: '25%', left: '55%', size: 26, delay: '1.8s', duration: '6.5s', rotate: -10, tone: 'gray', hideOnMobile: true },
  { top: '62%', left: '60%', size: 38, delay: '2.6s', duration: '5.2s', rotate: 30, tone: 'orange', hideOnMobile: true },
  { top: '88%', left: '65%', size: 30, delay: '1s', duration: '4.8s', rotate: -20, tone: 'gray' },
];

function PawShape({ size, rotate }: { size: number; rotate: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="currentColor"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <ellipse cx="28" cy="36" rx="8" ry="6.5" />
      <circle cx="15" cy="24" r="4" />
      <circle cx="28" cy="18" r="4" />
      <circle cx="41" cy="24" r="4" />
    </svg>
  );
}

/**
 * Fondo ambiental: huellitas flotando suave.
 * pointer-events-none, z-0, decorativo puro.
 * Mitad se oculta en móvil por rendimiento.
 */
export const AmbientBackground: React.FC = React.memo(() => {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className={[
            'absolute animate-float',
            particle.tone === 'orange' ? 'text-orange-500/10' : 'text-gray-900/5',
            particle.hideOnMobile ? 'hidden sm:block' : '',
          ].filter(Boolean).join(' ')}
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        >
          <PawShape size={particle.size} rotate={particle.rotate} />
        </span>
      ))}
    </div>
  );
});

export default AmbientBackground;
