import {
  authenticate,
  buildQuote,
  findCoupon,
  getServiceClient,
  isUserSuspended,
  jsonResponse,
  validateCoupon,
  corsHeaders,
  type CartItemInput,
} from '../_shared/coupons.ts';

/**
 * Valida un cupón y devuelve el cotización del carrito con el descuento aplicado.
 * Los precios SIEMPRE se leen de la base de datos: nunca se confía en el cliente.
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
      return jsonResponse({ error: 'Debes iniciar sesión para usar cupones' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code ?? '').trim();

    if (!code) {
      return jsonResponse({ error: 'Escribe el código del cupón' }, 400);
    }

    const items: CartItemInput[] = Array.isArray(body?.items)
      ? body.items
          .filter((item: unknown) => item && typeof item === 'object')
          .map((item: { product_id?: unknown; quantity?: unknown }) => ({
            product_id: String(item.product_id ?? ''),
            quantity: Number(item.quantity ?? 1),
          }))
          .filter((item: CartItemInput) => item.product_id)
      : [];

    const supabase = getServiceClient();

    if (await isUserSuspended(supabase, user.id)) {
      return jsonResponse({ error: 'Tu cuenta está suspendida' }, 403);
    }

    const coupon = await findCoupon(supabase, code);

    if (!coupon) {
      return jsonResponse({ error: 'Cupón no encontrado' }, 404);
    }

    const invalidReason = await validateCoupon(supabase, coupon, user.id);
    if (invalidReason) {
      return jsonResponse({ error: invalidReason }, 400);
    }

    const { quote, error } = await buildQuote(supabase, coupon, items);
    if (error || !quote) {
      return jsonResponse({ error: error ?? 'No se pudo calcular el descuento' }, 400);
    }

    return jsonResponse(quote);
  } catch (error) {
    console.error('coupon-apply error', error);
    return jsonResponse({ error: 'Error interno al validar el cupón' }, 500);
  }
});
