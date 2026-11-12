import { supabase } from './supabase';
import { uploadImageToImageKit } from './imagekit';
import type { UserProfile } from '../types/database';
import { formatWhatsapp, isWhatsappAccountEmail } from './authIdentifier';

export interface ProfileInput {
  display_name: string;
  favorite_anime: string;
  whatsapp: string;
  email: string;
  avatar_url: string;
}

export class ProfileError extends Error {}

/** "death note" -> "Death Note"; "highscool DXD" -> "Highschool DXD" */
export function titleCaseWords(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)(\S)/g, (_match, space: string, letter: string) => space + letter.toUpperCase());
}

async function readFunctionError(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown })?.context;

  if (typeof Response !== 'undefined' && context instanceof Response) {
    try {
      const payload = await context.json();
      if (payload && typeof payload.error === 'string') return payload.error;
    } catch {
      // sin cuerpo JSON
    }
  }

  return null;
}

/**
 * Guarda el perfil y las dos formas de entrar (correo y WhatsApp).
 * El backend decide el correo de Auth y valida que quede al menos una.
 */
export async function saveProfile(input: ProfileInput): Promise<UserProfile> {
  const { data, error } = await supabase.functions.invoke<{ profile: UserProfile }>('account-profile', {
    body: {
      display_name: input.display_name,
      favorite_anime: input.favorite_anime,
      whatsapp: input.whatsapp,
      email: input.email,
      avatar_url: input.avatar_url,
    },
  });

  if (error) {
    const serverMessage = await readFunctionError(error);
    throw new ProfileError(serverMessage || error.message || 'No se pudo guardar el perfil');
  }

  if (!data?.profile) {
    throw new ProfileError('No se pudo guardar el perfil');
  }

  return data.profile;
}

/** Sube la foto de perfil a ImageKit y devuelve la URL. */
export async function uploadAvatar(file: File): Promise<string> {
  return uploadImageToImageKit(file, { folder: 'AVATARS' });
}

/** Nombre a mostrar: display_name > username > correo/WhatsApp. */
export function profileDisplayName(profile: UserProfile | null): string {
  if (!profile) return '';
  const fallback = isWhatsappAccountEmail(profile.email)
    ? formatWhatsapp(profile.whatsapp)
    : profile.email;
  return profile.display_name || profile.username || fallback;
}

/** Iniciales para el avatar cuando no hay foto. */
export function profileInitials(profile: UserProfile | null): string {
  const name = profileDisplayName(profile).trim();
  if (!name) return '?';

  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');

  return letters.join('') || (name[0]?.toUpperCase() ?? '?');
}

/** Correo "real" del perfil (vacío si la cuenta solo usa WhatsApp). */
export function profileRealEmail(profile: UserProfile | null): string {
  if (!profile || isWhatsappAccountEmail(profile.email)) return '';
  return profile.email;
}
