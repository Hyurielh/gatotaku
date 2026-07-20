import { useEffect, useRef } from 'react';

/**
 * Hook global de scroll-reveal.
 * Pegar ref en elemento con clase `animate-on-scroll`.
 * Agrega `.is-visible` cuando entra en viewport (una sola vez).
 * Fallback: si no hay IntersectionObserver, revela directo.
 * Stagger opcional vía style={{ '--reveal-delay': '100ms' }}.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    try {
      if (!('IntersectionObserver' in window)) {
        element.classList.add('is-visible');
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(element);

      return () => observer.disconnect();
    } catch {
      element.classList.add('is-visible');
    }
  }, []);

  return ref;
}

export default useReveal;
