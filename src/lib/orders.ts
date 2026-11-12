import { supabase } from './supabase';
import type { Order, OrderItem, OrderStatus } from '../types/database';

export interface CreateOrderInput {
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  couponCode: string | null;
  couponValidationCode: string | null;
  customerNote?: string;
}

export class OrderError extends Error {}

/** Crea el pedido del cliente (RLS: user_id = auth.uid()). */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;

  if (!userId) {
    throw new OrderError('Inicia sesión para guardar el pedido en tu historial');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      subtotal: input.subtotal,
      discount_total: input.discountTotal,
      total: input.total,
      coupon_code: input.couponCode,
      coupon_validation_code: input.couponValidationCode,
      items: input.items,
      customer_note: input.customerNote ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new OrderError(error.message || 'No se pudo registrar el pedido');
  }

  return data as Order;
}

/** Ajusta el pedido cuando el cupón no se pudo aplicar al confirmar. */
export async function clearOrderCoupon(orderId: string, subtotal: number): Promise<void> {
  await supabase
    .from('orders')
    .update({
      coupon_code: null,
      coupon_validation_code: null,
      discount_total: 0,
      total: subtotal,
    })
    .eq('id', orderId);
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, status:order_statuses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new OrderError(error.message);
  return (data ?? []) as Order[];
}

export async function fetchOrderStatuses(): Promise<OrderStatus[]> {
  const { data, error } = await supabase
    .from('order_statuses')
    .select('*')
    .order('position')
    .order('name');

  if (error) throw new OrderError(error.message);
  return (data ?? []) as OrderStatus[];
}

export async function updateOrderStatus(orderId: string, statusId: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status_id: statusId }).eq('id', orderId);
  if (error) throw new OrderError(error.message);
}

export interface OrderStatusInput {
  name: string;
  description: string;
  icon: string;
  is_completed: boolean;
  position: number;
}

export async function saveOrderStatus(input: OrderStatusInput, statusId?: string): Promise<void> {
  const payload = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    icon: input.icon.trim() || null,
    is_completed: input.is_completed,
    position: input.position,
  };

  const { error } = statusId
    ? await supabase.from('order_statuses').update(payload).eq('id', statusId)
    : await supabase.from('order_statuses').insert(payload);

  if (error) throw new OrderError(error.message);
}

export async function deleteOrderStatus(statusId: string): Promise<void> {
  const { error } = await supabase.from('order_statuses').delete().eq('id', statusId);
  if (error) throw new OrderError(error.message);
}
