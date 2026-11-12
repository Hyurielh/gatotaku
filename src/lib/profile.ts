import { supabase } from './supabase';
import { uploadImageToImageKit } from './imagekit';
import type { UserProfile } from '../types/database';
import { formatWhatsapp, isWhatsappAccountEmail } from './authIdentifier';

export interface ProfileInput {
  display_name: string;
  username: string;
  favorite_anime: string;
  whatsapp: string;
  avatar_url: string;
}

export class ProfileError extends Error {}

/**
 * Guarda el perfil vía RPC del servidor.
 * La RPC solo permite tocar las columnas seguras de la propia fila
 * (nunca `is_admin` ni el id).
 */
export async function updateMyProfile(input: ProfileInput): Promise<UserProfile> {
  const { data, error } = await supabase.rpc('update_my_profile', {
    p_display_name: input.display_name,
    p_username: input.username,
    p_favorite_anime: input.favorite_anime,
    p_whatsapp: input.whatsapp,
    p_avatar_url: input.avatar_url,
  });

  if (error) {
    if (error.message.includes('username_en_uso')) {
      throw new ProfileError('Ese nombre de usuario ya está en uso');
    }
    if (error.message.includes('whatsapp_suspendido')) {
      throw new ProfileError('Ese número de WhatsApp pertenece a una cuenta suspendida');
    }
    throw new ProfileError(error.message || 'No se pudo guardar el perfil');
  }

  if (!data) {
    throw new ProfileError('No se pudo guardar el perfil');
  }

  return data as UserProfile;
}

/** Sube la foto de perfil a ImageKit y devuelve la URL. */
export async function uploadAvatar(file: File): Promise<string> {
  return uploadImageToImageKit(file, { folder: 'AVATARS' });
}

/** Nombre a mostrar: display_name > username > correo. */
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
