import { corsHeaders, getServiceClient, jsonResponse } from '../_shared/coupons.ts';

/**
 * Estado de una cuenta por correo (público, sin sesión).
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
    const email = String(body?.email ?? '').trim().toLowerCase();

    if (!email) {
      return jsonResponse({ suspended: false });
    }

    const supabase = getServiceClient();
    const { data } = await supabase
      .from('users')
      .select('is_suspended, suspension_message')
      .eq('email', email)
      .maybeSingle();

    if (!data?.is_suspended) {
      return jsonResponse({ suspended: false });
    }

    return jsonResponse({
      suspended: true,
      message: data.suspension_message ?? 'Tu cuenta ha sido suspendida.',
    });
  } catch (error) {
    console.error('account-status error', error);
    return jsonResponse({ suspended: false });
  }
});
