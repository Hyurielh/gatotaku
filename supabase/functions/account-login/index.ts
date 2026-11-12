import { corsHeaders, getServiceClient, jsonResponse } from '../_shared/coupons.ts';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

function normalizeWhatsapp(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length < 8) return null;
  if (digits.length === 8) return `505${digits}`;
  return digits;
}

/**
 * Login con correo o WhatsApp.
 * - Correo: se usa tal cual (es el correo de Supabase Auth)
 * - WhatsApp: se busca la cuenta por `users.whatsapp` y se entra con su correo
 * La contraseña se valida contra Supabase Auth; nunca se almacena.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body?.identifier ?? '').trim();
    const password = String(body?.password ?? '');

    if (!identifier || !password) {
      return jsonResponse({ error: 'Escribe tu WhatsApp o correo y tu contraseña' }, 400);
    }

    let email = '';

    if (identifier.includes('@')) {
      email = identifier.toLowerCase();
    } else {
      const whatsapp = normalizeWhatsapp(identifier);

      if (!whatsapp) {
        return jsonResponse({ error: 'Escribe un WhatsApp válido (mínimo 8 dígitos) o un correo' }, 400);
      }

      const supabase = getServiceClient();
      const { data: profiles } = await supabase
        .from('users')
        .select('id, email, whatsapp')
        .not('whatsapp', 'is', null);

      const match = (profiles ?? []).find(
        (row) => onlyDigits(String(row.whatsapp ?? '')) === whatsapp,
      );

      if (!match?.email) {
        return jsonResponse({ error: 'No hay una cuenta con ese número de WhatsApp' }, 404);
      }

      email = String(match.email);
    }

    const tokenResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const tokenBody = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const message = String(tokenBody?.msg ?? tokenBody?.error_description ?? 'Credenciales inválidas');
      return jsonResponse({ error: message }, tokenResponse.status === 400 ? 401 : tokenResponse.status);
    }

    return jsonResponse({
      access_token: tokenBody.access_token,
      refresh_token: tokenBody.refresh_token,
      expires_in: tokenBody.expires_in,
      expires_at: tokenBody.expires_at,
      token_type: tokenBody.token_type,
      user: tokenBody.user,
    });
  } catch (error) {
    console.error('account-login error', error);
    return jsonResponse({ error: 'Error interno al iniciar sesión' }, 500);
  }
});
