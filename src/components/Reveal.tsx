import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  /** Delay en ms para efecto escalonado */
  delay?: number;
  className?: string;
}

/**
 * Wrapper global de scroll-reveal.
 * Oculta contenido hasta que entra en viewport (una sola vez).
 * Usa clase global `.animate-on-scroll` + hook useReveal.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={['animate-on-scroll', className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default Reveal;
