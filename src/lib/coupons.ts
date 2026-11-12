import { supabase } from './supabase';
import type { Coupon, CouponAppliesTo, CouponAssignmentType, CouponDiscountType } from '../types/database';

const APPLY_FUNCTION = 'coupon-apply';
const REDEEM_FUNCTION = 'coupon-redeem';

export interface CouponLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  discount: number;
  eligible: boolean;
}

export interface CouponRedemptionResult {
  id: string;
  code: string;
  uses_count: number;
  user_uses: number;
}

export interface CouponQuote {
  coupon: {
    id: string;
    name: string;
    code: string;
    discount_type: CouponDiscountType;
    discount_value: number;
    applies_to: CouponAppliesTo;
    is_exclusion?: boolean;
    expires_at: string | null;
  };
  lines: CouponLine[];
  subtotal: number;
  eligible_subtotal: number;
  ineligible_subtotal: number;
  discount_total: number;
  total: number;
  redemption?: CouponRedemptionResult;
}

export interface CartItemInput {
  product_id: string;
  quantity: number;
}

export class CouponError extends Error {}

async function invokeCouponFunction(
  functionName: string,
  body: Record<string, unknown>,
): Promise<CouponQuote> {
  const { data, error } = await supabase.functions.invoke<CouponQuote>(functionName, { body });

  if (error) {
    // supabase-js solo da "Edge Function returned a non-2xx status code";
    // el mensaje real del servidor viene en error.context (Response).
    let message = error.message || 'No se pudo validar el cupón';
    const context = (error as { context?: unknown }).context;

    if (typeof Response !== 'undefined' && context instanceof Response) {
      try {
        const payload = await context.json();
        if (payload && typeof payload.error === 'string') {
          message = payload.error;
        }
      } catch {
        // sin cuerpo JSON: se usa el mensaje por defecto
      }
    }

    throw new CouponError(message);
  }

  if (!data || typeof data.discount_total !== 'number') {
    throw new CouponError('Respuesta inválida del servidor de cupones');
  }

  return data;
}

/** Valida el cupón y devuelve la cotización del carrito (precios desde la DB). */
export async function requestCouponQuote(
  code: string,
  items: CartItemInput[],
): Promise<CouponQuote> {
  return invokeCouponFunction(APPLY_FUNCTION, { code, items });
}

/** Registra el uso del cupón al confirmar la compra. */
export async function redeemCoupon(
  code: string,
  items: CartItemInput[],
  orderRef?: string,
): Promise<CouponQuote> {
  return invokeCouponFunction(REDEEM_FUNCTION, { code, items, order_ref: orderRef ?? null });
}

/** "15%" o "C$50" */
export function formatCouponDiscount(coupon: Pick<Coupon, 'discount_type' | 'discount_value'>) {
  return coupon.discount_type === 'percentage'
    ? `${coupon.discount_value}%`
    : `C$${Number(coupon.discount_value).toFixed(2)}`;
}

/** Texto de las condiciones de uso para mostrar al usuario. */
export function describeCouponConditions(coupon: Coupon): string[] {
  const conditions: string[] = [];

  if (coupon.expires_at) {
    conditions.push(`Vence el ${new Date(coupon.expires_at).toLocaleDateString('es-NI')}`);
  }
  if (coupon.max_uses !== null) {
    conditions.push(`Uso máximo: ${coupon.uses_count}/${coupon.max_uses}`);
  }
  conditions.push(`Máximo ${coupon.max_uses_per_user} uso(s) por cuenta`);
  if (coupon.assignment_type === 'general') {
    conditions.push('Cupón general: disponible para cuentas registradas');
  } else {
    conditions.push('Cupón personal: asignado a tu cuenta');
  }
  if (coupon.applies_to === 'all') {
    conditions.push('Aplica a todos los productos');
  } else if (coupon.is_exclusion) {
    conditions.push(
      coupon.applies_to === 'categories'
        ? 'Aplica a todo excepto ciertas categorías'
        : 'Aplica a todo excepto ciertos productos',
    );
  } else if (coupon.applies_to === 'categories') {
    conditions.push('Aplica solo a ciertas categorías');
  } else {
    conditions.push('Aplica solo a ciertos productos');
  }

  return conditions;
}

export const COUPON_ASSIGNMENT_LABEL: Record<CouponAssignmentType, string> = {
  general: 'General',
  specific: 'Usuarios específicos',
};
