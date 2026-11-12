/**
 * Identificador de acceso: correo o WhatsApp.
 * Las cuentas de WhatsApp usan un correo sintético en Supabase Auth
 * (`<digitos>@wa.gatotaku.local`); el número real vive en `users.whatsapp`.
 */
export const WHATSAPP_EMAIL_DOMAIN = 'wa.gatotaku.local';

export function isWhatsappAccountEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith(`@${WHATSAPP_EMAIL_DOMAIN}`));
}

/** Solo dígitos; 8 dígitos se asumen de Nicaragua (505). */
export function normalizeWhatsapp(value: string): string | null {
  const digits = value.replace(/\D/g, '');

  if (digits.length < 8) return null;
  if (digits.length === 8) return `505${digits}`;

  return digits;
}

export function formatWhatsapp(value: string | null | undefined): string {
  if (!value) return '';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('505')) {
    return `+505 ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  return `+${digits}`;
}

export interface AuthIdentifier {
  email: string;
  isRealEmail: boolean;
  whatsapp: string | null;
  display: string;
}

/** Convierte lo que escribe el usuario en el correo que usa Supabase Auth. */
export function resolveAuthIdentifier(raw: string): AuthIdentifier {
  const value = raw.trim();

  if (!value) {
    throw new Error('Escribe tu WhatsApp o correo');
  }

  if (value.includes('@')) {
    return { email: value.toLowerCase(), isRealEmail: true, whatsapp: null, display: value };
  }

  const whatsapp = normalizeWhatsapp(value);

  if (!whatsapp) {
    throw new Error('Escribe un WhatsApp válido (mínimo 8 dígitos) o un correo');
  }

  return {
    email: `${whatsapp}@${WHATSAPP_EMAIL_DOMAIN}`,
    isRealEmail: false,
    whatsapp,
    display: formatWhatsapp(whatsapp),
  };
}
