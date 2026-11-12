import { supabase } from './supabase';
import { compressImage } from '../utils/imageOptimization';

const IMAGEKIT_UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_AUTH_FUNCTION = 'imagekit-auth';
const MAX_UPLOAD_SIZE_KB = 1024;

export interface ImageKitUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/**
 * Pide al backend (Edge Function) credenciales de subida de un solo uso.
 * La private key de ImageKit nunca llega al navegador.
 */
export async function requestImageKitUploadAuth(): Promise<ImageKitUploadAuth> {
  const { data, error } = await supabase.functions.invoke<ImageKitUploadAuth>(IMAGEKIT_AUTH_FUNCTION, {
    body: {},
  });

  if (error) {
    throw new Error(error.message || 'No se pudieron obtener las credenciales de ImageKit');
  }

  if (!data?.token || !data?.signature || !data?.publicKey) {
    throw new Error('El servidor no devolvió credenciales válidas de ImageKit');
  }

  return data;
}

/** ImageKit solo admite alfanuméricos, punto y guion en el nombre; la extensión debe corresponder al contenido. */
function normalizeFileName(file: File): File {
  const extensionByType: Record<string, string> = {
    'image/webp': 'webp',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };

  const extension = extensionByType[file.type] ?? file.name.split('.').pop() ?? 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'imagen';

  return new File([file], `${baseName}.${extension}`, { type: file.type, lastModified: file.lastModified });
}

/**
 * Comprime la imagen, la sube directo a ImageKit y devuelve la URL pública.
 */
export async function uploadImageToImageKit(file: File, options?: { folder?: string }): Promise<string> {
  const compressed = await compressImage(file, MAX_UPLOAD_SIZE_KB);
  const prepared = normalizeFileName(compressed);
  const auth = await requestImageKitUploadAuth();

  const body = new FormData();
  body.append('file', prepared, prepared.name);
  body.append('fileName', prepared.name);
  body.append('publicKey', auth.publicKey);
  body.append('signature', auth.signature);
  body.append('expire', String(auth.expire));
  body.append('token', auth.token);
  body.append('useUniqueFileName', 'true');

  if (options?.folder) {
    body.append('folder', options.folder);
  }

  const response = await fetch(IMAGEKIT_UPLOAD_ENDPOINT, { method: 'POST', body });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`ImageKit rechazó la imagen (${response.status})${detail ? `: ${detail}` : ''}`);
  }

  const result = await response.json();
  const url = result?.url as string | undefined;

  if (!url) {
    throw new Error('ImageKit no devolvió la URL de la imagen');
  }

  return url;
}
