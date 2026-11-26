import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  interface Window {
    SakugaFX?: {
      clear?: () => void;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'primary' | 'secondary';
        type?: 'button' | 'submit';
        disabled?: boolean;
      };
    }
  }
}

export {};
