import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Genera credenciales de subida para ImageKit (Upload API v1, token-based auth).
 * El navegador pide un token de un solo uso y sube el archivo directo a ImageKit.
 * La private key nunca sale del servidor.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ImageKit exige que la expiración sea menor a 1 hora.
const TOKEN_TTL_SECONDS = 60 * 30;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** HMAC-SHA1(privateKey, `${token}${expire}`) en hexadecimal minúscula. */
async function createSignature(token: string, expire: number, privateKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(privateKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${token}${expire}`));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }

  try {
    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
    const publicKey = Deno.env.get('IMAGEKIT_PUBLIC_KEY');
    const urlEndpoint = Deno.env.get('IMAGEKIT_URL_ENDPOINT');

    if (!privateKey || !publicKey || !urlEndpoint) {
      console.error('Faltan secrets de ImageKit (IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT)');
      return jsonResponse({ error: 'ImageKit no está configurado en el servidor' }, 500);
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!accessToken) {
      return jsonResponse({ error: 'Sesión requerida' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Faltan variables de entorno de Supabase en la función');
      return jsonResponse({ error: 'Servidor mal configurado' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      return jsonResponse({ error: 'Sesión inválida o expirada' }, 401);
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const signature = await createSignature(token, expire, privateKey);

    console.log(`Credenciales de ImageKit generadas para ${data.user.email ?? data.user.id}`);

    return jsonResponse({ token, expire, signature, publicKey, urlEndpoint });
  } catch (error) {
    console.error('Error generating ImageKit credentials', error);
    return jsonResponse({ error: 'Error interno al generar credenciales de ImageKit' }, 500);
  }
});
