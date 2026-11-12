import { corsHeaders, getServiceClient, jsonResponse } from '../_shared/coupons.ts';

const WHATSAPP_DOMAIN = 'wa.gatotaku.local';
const onlyDigits = (value: string) => value.replace(/\D/g, '');

function normalizeWhatsapp(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length < 8) return null;
  if (digits.length === 8) return `505${digits}`;
  return digits;
}

/**
 * Estado de una cuenta por correo o WhatsApp (público, sin sesión).
 * Se usa en la pantalla de login para mostrar el motivo de la suspensión.
 * Solo devuelve datos cuando la cuenta está suspendida.
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
    const identifier = String(body?.identifier ?? body?.email ?? '').trim();

    if (!identifier) {
      return jsonResponse({ suspended: false });
    }

    const supabase = getServiceClient();
    let profile: { is_suspended: boolean; suspension_message: string | null } | null = null;

    if (identifier.includes('@')) {
      const { data } = await supabase
        .from('users')
        .select('is_suspended, suspension_message')
        .eq('email', identifier.toLowerCase())
        .maybeSingle();
      profile = data ?? null;
    } else {
      const whatsapp = normalizeWhatsapp(identifier);

      if (whatsapp) {
        const { data: rows } = await supabase
          .from('users')
          .select('email, whatsapp, is_suspended, suspension_message')
          .not('whatsapp', 'is', null);

        const match = (rows ?? []).find(
          (row) => onlyDigits(String(row.whatsapp ?? '')) === whatsapp,
        );

        if (match) profile = match as typeof profile;

        if (!profile) {
          const { data } = await supabase
            .from('users')
            .select('is_suspended, suspension_message')
            .eq('email', `${whatsapp}@${WHATSAPP_DOMAIN}`)
            .maybeSingle();
          profile = data ?? null;
        }
      }
    }

    if (!profile?.is_suspended) {
      return jsonResponse({ suspended: false });
    }

    return jsonResponse({
      suspended: true,
      message: profile.suspension_message ?? 'Tu cuenta ha sido suspendida.',
    });
  } catch (error) {
    console.error('account-status error', error);
    return jsonResponse({ suspended: false });
  }
});
