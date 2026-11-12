import {
  authenticate,
  corsHeaders,
  getServiceClient,
  jsonResponse,
} from '../_shared/coupons.ts';
import { deleteImageKitFileByUrl } from '../_shared/imagekit.ts';

/**
 * Acciones administrativas sobre cuentas: suspender, reactivar y eliminar.
 * Solo un usuario con `public.users.is_admin = true` puede ejecutarlas.
 * - Suspender: banea el login en Supabase Auth (ban_duration) y guarda el motivo
 * - Reactivar: quita el ban y limpia el motivo
 * - Eliminar: borra la cuenta de auth (cascada de perfil/asignaciones)
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

    const supabase = getServiceClient();

    const { data: me } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!me?.is_admin) {
      return jsonResponse({ error: 'Solo administradores pueden hacer esto' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? '');
    const userId = String(body?.user_id ?? '');
    const message = String(body?.message ?? '').trim();

    if (!userId) {
      return jsonResponse({ error: 'Falta el usuario' }, 400);
    }

    if (userId === user.id) {
      return jsonResponse({ error: 'No puedes aplicar esto a tu propia cuenta' }, 400);
    }

    const { data: target } = await supabase
      .from('users')
      .select('id, email, is_admin, is_suspended, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (!target) {
      return jsonResponse({ error: 'Usuario no encontrado' }, 404);
    }

    if (target.is_admin) {
      return jsonResponse({ error: 'No se puede suspender ni eliminar a otro administrador' }, 400);
    }

    if (action === 'suspend') {
      if (!message) {
        return jsonResponse({ error: 'Escribe el motivo de la suspensión' }, 400);
      }

      const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      });
      if (banError) {
        console.error('ban error', banError);
        return jsonResponse({ error: banError.message }, 500);
      }

      const { error: dbError } = await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspension_message: message,
          suspended_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (dbError) {
        console.error('suspend db error', dbError);
        return jsonResponse({ error: 'No se pudo guardar la suspensión' }, 500);
      }

      return jsonResponse({ ok: true, suspended: true, message });
    }

    if (action === 'reactivate') {
      const { error: unbanError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
      if (unbanError) {
        console.error('unban error', unbanError);
        return jsonResponse({ error: unbanError.message }, 500);
      }

      await supabase
        .from('users')
        .update({ is_suspended: false, suspension_message: null, suspended_at: null })
        .eq('id', userId);

      return jsonResponse({ ok: true, suspended: false });
    }

    if (action === 'delete') {
      // Borra la foto de perfil de ImageKit antes de eliminar la cuenta
      const avatarDeleted = await deleteImageKitFileByUrl(target.avatar_url);

      // Elimina la cuenta: por las cascadas se van perfil, cupones asignados,
      // redenciones y pedidos del usuario
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error('delete user error', deleteError);
        return jsonResponse({ error: deleteError.message }, 500);
      }

      return jsonResponse({ ok: true, deleted: true, avatarDeleted });
    }

    return jsonResponse({ error: 'Acción no válida' }, 400);
  } catch (error) {
    console.error('admin-users error', error);
    return jsonResponse({ error: 'Error interno al gestionar la cuenta' }, 500);
  }
});
