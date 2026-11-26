import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import '../vendor/sakuga/button.js';

type SakugaButtonElement = HTMLElement & {
  done: (hold?: number) => void;
  impact: () => void;
};

export interface SakugaButtonHandle {
  done: (hold?: number) => void;
  impact: () => void;
}

interface SakugaButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Envuelve <sakuga-button> para React 18.
 * React 18 no enlaza onChange personalizados ni convierte bien los booleanos
 * de los custom elements, así que los atributos se arman a mano.
 */
export const SakugaButton = forwardRef<SakugaButtonHandle, SakugaButtonProps>(
  function SakugaButton({ children, variant, type, disabled, className, onClick }, ref) {
    const hostRef = useRef<SakugaButtonElement>(null);

    useImperativeHandle(ref, () => ({
      done: (hold?: number) => hostRef.current?.done(hold),
      impact: () => hostRef.current?.impact(),
    }), []);

    useEffect(() => {
      const element = hostRef.current;

      if (!element || !onClick) return;

      const handleClick = () => onClick();
      element.addEventListener('click', handleClick);

      return () => element.removeEventListener('click', handleClick);
    }, [onClick]);

    const attributes: Record<string, string> = {};

    if (className) attributes.class = className;
    if (variant === 'secondary') attributes.variant = 'secondary';
    if (type) attributes.type = type;
    if (disabled) attributes.disabled = '';

    return (
      <sakuga-button ref={hostRef} {...attributes}>
        {children}
      </sakuga-button>
    );
  },
);
