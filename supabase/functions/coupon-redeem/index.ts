import {
  authenticate,
  buildQuote,
  findCoupon,
  getServiceClient,
  jsonResponse,
  validateCoupon,
  corsHeaders,
  type CartItemInput,
} from '../_shared/coupons.ts';

/**
 * Registra el uso del cupón (confirmación de la compra).
 * La redención es atómica: `redeem_coupon` bloquea la fila del cupón y valida
 * los límites dentro de una transacción, así que dos requests simultáneos
 * no pueden superar max_uses ni max_uses_per_user.
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
    const orderRef = body?.order_ref ? String(body.order_ref) : null;

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

    const { data: redemption, error: redeemError } = await supabase.rpc('redeem_coupon', {
      p_coupon_id: coupon.id,
      p_user_id: user.id,
      p_amount: quote.discount_total,
      p_items: quote.lines.map((line) => ({
        product_id: line.product_id,
        quantity: line.quantity,
        unit_price: line.unit_price,
        line_total: line.line_total,
        discount: line.discount,
        eligible: line.eligible,
      })),
      p_order_ref: orderRef,
    });

    if (redeemError) {
      const message = String(redeemError.message ?? '');
      if (message.includes('limite_global')) {
        return jsonResponse({ error: 'El cupón alcanzó su límite de usos' }, 409);
      }
      if (message.includes('limite_usuario')) {
        return jsonResponse({ error: 'Ya usaste este cupón el máximo de veces permitido' }, 409);
      }
      if (message.includes('cupon_no_existe')) {
        return jsonResponse({ error: 'Cupón no encontrado' }, 404);
      }
      console.error('redeem_coupon error', redeemError);
      return jsonResponse({ error: 'No se pudo registrar el uso del cupón' }, 500);
    }

    return jsonResponse({ ...quote, redemption });
  } catch (error) {
    console.error('coupon-redeem error', error);
    return jsonResponse({ error: 'Error interno al registrar el uso del cupón' }, 500);
  }
});
