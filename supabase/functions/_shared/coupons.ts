import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  assignment_type: 'general' | 'specific';
  applies_to: 'all' | 'products' | 'categories';
  is_exclusion: boolean;
  is_active: boolean;
  is_revoked: boolean;
  uses_count: number;
}

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

export interface CouponLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  discount: number;
  eligible: boolean;
}

export interface CouponQuote {
  coupon: {
    id: string;
    name: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'all' | 'products' | 'categories';
    expires_at: string | null;
  };
  lines: CouponLine[];
  subtotal: number;
  eligible_subtotal: number;
  ineligible_subtotal: number;
  discount_total: number;
  total: number;
}

export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function getServiceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Verifica la sesión de Supabase y devuelve el usuario (o null). */
export async function authenticate(req: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!accessToken) return null;

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return null;

  return { id: data.user.id, email: data.user.email ?? '' };
}

/** Cuenta suspendida: no puede usar cupones. */
export async function isUserSuspended(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('is_suspended')
    .eq('id', userId)
    .maybeSingle();

  return Boolean(data?.is_suspended);
}

/** Busca el cupón por código (ignora mayúsculas y espacios). */
export async function findCoupon(supabase: SupabaseClient, code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as Coupon;
}

/** Valida estado, vigencia, asignación y límites. Devuelve el motivo del rechazo o null. */
export async function validateCoupon(
  supabase: SupabaseClient,
  coupon: Coupon,
  userId: string,
): Promise<string | null> {
  const now = Date.now();

  if (!coupon.is_active) return 'El cupón no está activo';
  if (coupon.is_revoked) return 'Este cupón fue revocado y ya no se puede usar';
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return 'El cupón todavía no está vigente';
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return 'El cupón ya venció';
  }

  if (coupon.assignment_type === 'specific') {
    const { data: assignment } = await supabase
      .from('coupon_assignments')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId)
      .is('revoked_at', null)
      .maybeSingle();

    if (!assignment) return 'Este cupón no está asignado a tu cuenta';
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return 'El cupón alcanzó su límite de usos';
  }

  const { count } = await supabase
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', coupon.id)
    .eq('user_id', userId);

  if ((count ?? 0) >= coupon.max_uses_per_user) {
    return 'Ya usaste este cupón el máximo de veces permitido';
  }

  return null;
}

/**
 * Calcula el descuento usando SIEMPRE precios de la base de datos.
 * El descuento solo se aplica a productos elegibles.
 */
export async function buildQuote(
  supabase: SupabaseClient,
  coupon: Coupon,
  items: CartItemInput[],
): Promise<{ quote?: CouponQuote; error?: string }> {
  const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];

  if (productIds.length === 0) return { error: 'El carrito está vacío' };

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, category_id')
    .in('id', productIds);

  if (productsError) return { error: 'No se pudieron leer los productos del carrito' };

  let eligibleProductIds: Set<string> | null = null;
  let eligibleCategoryIds: Set<string> | null = null;

  if (coupon.applies_to === 'products') {
    const { data } = await supabase
      .from('coupon_products')
      .select('product_id')
      .eq('coupon_id', coupon.id);
    eligibleProductIds = new Set((data ?? []).map((row) => row.product_id));
  } else if (coupon.applies_to === 'categories') {
    const { data } = await supabase
      .from('coupon_categories')
      .select('category_id')
      .eq('coupon_id', coupon.id);
    eligibleCategoryIds = new Set((data ?? []).map((row) => row.category_id));
  }

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const lines: CouponLine[] = [];

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) continue;

    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity)) || 1));
    const unitPrice = round2(Number(product.price));
    const lineTotal = round2(unitPrice * quantity);

    let eligible = true;
    if (eligibleProductIds) {
      const inList = eligibleProductIds.has(product.id);
      eligible = coupon.is_exclusion ? !inList : inList;
    } else if (eligibleCategoryIds) {
      const inList = Boolean(product.category_id) && eligibleCategoryIds.has(product.category_id as string);
      eligible = coupon.is_exclusion ? !inList : inList;
    }

    lines.push({
      product_id: product.id,
      name: product.name,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      discount: 0,
      eligible,
    });
  }

  if (lines.length === 0) return { error: 'El carrito está vacío' };

  const subtotal = round2(lines.reduce((sum, line) => sum + line.line_total, 0));
  const eligibleLines = lines.filter((line) => line.eligible);
  const eligibleSubtotal = round2(eligibleLines.reduce((sum, line) => sum + line.line_total, 0));
  const ineligibleSubtotal = round2(subtotal - eligibleSubtotal);

  if (eligibleSubtotal <= 0) {
    return { error: 'El cupón no aplica a ningún producto de tu carrito' };
  }

  let discountTotal = 0;

  if (coupon.discount_type === 'percentage') {
    const rate = Number(coupon.discount_value) / 100;
    for (const line of eligibleLines) {
      line.discount = round2(line.line_total * rate);
    }
    discountTotal = round2(eligibleLines.reduce((sum, line) => sum + line.discount, 0));
  } else {
    discountTotal = round2(Math.min(Number(coupon.discount_value), eligibleSubtotal));

    const raw = eligibleLines.map((line) => (discountTotal * line.line_total) / eligibleSubtotal);
    const amounts = raw.map((value) => Math.floor(value * 100) / 100);
    let assigned = round2(amounts.reduce((sum, value) => sum + value, 0));
    let pendingCents = Math.round((discountTotal - assigned) * 100);

    const order = raw
      .map((value, index) => ({ index, fraction: value - Math.floor(value * 100) / 100 }))
      .sort((a, b) => b.fraction - a.fraction);

    let cursor = 0;
    while (pendingCents > 0 && order.length > 0) {
      const target = order[cursor % order.length].index;
      amounts[target] = round2(amounts[target] + 0.01);
      pendingCents -= 1;
      cursor += 1;
    }

    eligibleLines.forEach((line, index) => {
      line.discount = amounts[index];
    });
  }

  const quote: CouponQuote = {
    coupon: {
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      applies_to: coupon.applies_to,
      is_exclusion: Boolean(coupon.is_exclusion),
      expires_at: coupon.expires_at,
    },
    lines,
    subtotal,
    eligible_subtotal: eligibleSubtotal,
    ineligible_subtotal: ineligibleSubtotal,
    discount_total: discountTotal,
    total: round2(subtotal - discountTotal),
  };

  return { quote };
}
