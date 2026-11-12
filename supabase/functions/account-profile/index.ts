import {
  authenticate,
  corsHeaders,
  getServiceClient,
  jsonResponse,
} from '../_shared/coupons.ts';

const WHATSAPP_DOMAIN = 'wa.gatotaku.local';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

function normalizeWhatsapp(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length < 8) return null;
  if (digits.length === 8) return `505${digits}`;
  return digits;
}

function titleCaseWords(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^|\s)(\S)/g, (_match, space: string, letter: string) => space + letter.toUpperCase());
}

/**
 * Guarda el perfil y administra las DOS formas de entrar:
 * correo y WhatsApp. El correo de Supabase Auth es el correo real si existe;
 * si no, se usa el sintético `<digitos>@wa.gatotaku.local`.
 * Siempre debe quedar al menos una forma de acceso.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }

  try {
    const user = await authenticate(req);
    if (!user) {
      return jsonResponse({ error: 'Sesión requerida' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const displayName = String(body?.display_name ?? '').trim();
    const favoriteAnime = titleCaseWords(String(body?.favorite_anime ?? ''));
    const avatarUrl = String(body?.avatar_url ?? '').trim();
    const rawEmail = String(body?.email ?? '').trim().toLowerCase();
    const rawWhatsapp = String(body?.whatsapp ?? '').trim();

    const whatsapp = rawWhatsapp ? normalizeWhatsapp(rawWhatsapp) : null;

    if (rawWhatsapp && !whatsapp) {
      return jsonResponse({ error: 'Escribe un WhatsApp válido (mínimo 8 dígitos)' }, 400);
    }

    const supabase = getServiceClient();

    const { data: current } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!current) {
      return jsonResponse({ error: 'Perfil no encontrado' }, 404);
    }

    if (current.is_suspended) {
      return jsonResponse({ error: 'Tu cuenta está suspendida' }, 403);
    }

    // Al menos una forma de entrar
    if (!rawEmail && !whatsapp) {
      return jsonResponse({ error: 'Necesitas al menos un correo o un WhatsApp para entrar' }, 400);
    }

    // WhatsApp único entre cuentas
    if (whatsapp) {
      const { data: phoneRows } = await supabase
        .from('users')
        .select('id, whatsapp')
        .neq('id', user.id)
        .not('whatsapp', 'is', null);

      const phoneTaken = (phoneRows ?? []).some(
        (row) => onlyDigits(String(row.whatsapp ?? '')) === whatsapp,
      );

      if (phoneTaken) {
        return jsonResponse({ error: 'Ese WhatsApp ya está registrado en otra cuenta' }, 409);
      }
    }

    // El correo de Auth: real si hay, si no el sintético del WhatsApp
    const nextAuthEmail = rawEmail || `${whatsapp}@${WHATSAPP_DOMAIN}`;

    if (nextAuthEmail !== current.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        email: nextAuthEmail,
        email_confirm: true,
      });

      if (authError) {
        const message = String(authError.message ?? '');
        if (/already|exist|registered|duplicate/i.test(message)) {
          return jsonResponse({ error: 'Ese correo ya está registrado en otra cuenta' }, 409);
        }
        console.error('update auth email error', authError);
        return jsonResponse({ error: 'No se pudo actualizar el correo' }, 500);
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        email: nextAuthEmail,
        display_name: displayName || null,
        favorite_anime: favoriteAnime || null,
        whatsapp: whatsapp,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('update profile error', updateError);
      const message = String(updateError.message ?? '');
      if (message.includes('users_whatsapp_digits_unique')) {
        return jsonResponse({ error: 'Ese WhatsApp ya está registrado en otra cuenta' }, 409);
      }
      return jsonResponse({ error: 'No se pudo guardar el perfil' }, 500);
    }

    return jsonResponse({ profile: updated });
  } catch (error) {
    console.error('account-profile error', error);
    return jsonResponse({ error: 'Error interno al guardar el perfil' }, 500);
  }
});
