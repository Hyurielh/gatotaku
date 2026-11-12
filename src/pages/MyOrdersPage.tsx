import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, LogIn, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { fetchMyOrders, fetchOrderStatuses } from '../lib/orders';
import type { Order, OrderStatus } from '../types/database';

const formatMoney = (value: number) => `C$${Number(value).toFixed(2)}`;

export default function MyOrdersPage() {
  const { session, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user.id ?? null;

  const loadOrders = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const [ordersData, statusesData] = await Promise.all([
        fetchMyOrders(userId),
        fetchOrderStatuses(),
      ]);
      setOrders(ordersData);
      setStatuses(statusesData);
    } catch {
      toast.error('No se pudieron cargar tus pedidos');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const { active, completed } = useMemo(() => {
    const act = orders.filter((order) => !order.status?.is_completed);
    const done = orders.filter((order) => order.status?.is_completed);
    return { active: act, completed: done };
  }, [orders]);

  const statusOrder = (status: OrderStatus | null | undefined) =>
    statuses.findIndex((item) => item.id === status?.id);

  const renderOrder = (order: Order, isCompleted: boolean) => {
    const currentIndex = statusOrder(order.status);

    return (
      <article
        key={order.id}
        className={[
          'rounded-xl border p-4',
          isCompleted ? 'border-slate-200 bg-white' : 'border-teal-300 bg-teal-50/60 shadow-[0_10px_28px_rgba(15,159,143,0.12)]',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-sm font-bold text-slate-900">{order.code ?? order.id.slice(0, 8)}</p>
            <p className="text-xs text-slate-500">
              {new Date(order.created_at).toLocaleString('es-NI')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-teal-700">{formatMoney(order.total)}</p>
            {order.discount_total > 0 && (
              <p className="text-[11px] font-semibold text-emerald-700">
                Ahorraste {formatMoney(order.discount_total)}
              </p>
            )}
          </div>
        </div>

        {order.status && (
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <span className="text-2xl leading-none" aria-hidden="true">
              {order.status.icon ?? '📦'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{order.status.name}</p>
              {order.status.description && (
                <p className="text-xs text-slate-500">{order.status.description}</p>
              )}
            </div>
          </div>
        )}

        {!isCompleted && statuses.length > 0 && (
          <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
            {statuses.map((status, index) => (
              <li
                key={status.id}
                className={[
                  'rounded-full px-2 py-0.5',
                  index <= currentIndex ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                {status.name}
              </li>
            ))}
          </ol>
        )}

        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {order.items.map((item) => (
            <li key={`${order.id}-${item.product_id}`} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {item.quantity}x {item.name}
              </span>
              <span className="shrink-0 font-semibold">
                {formatMoney(item.line_total)}
                {item.discount > 0 && (
                  <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                    -{formatMoney(item.discount)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {order.coupon_code && (
          <p className="mt-2 text-[11px] text-slate-500">
            Cupón <span className="font-mono font-bold">{order.coupon_code}</span>
            {order.coupon_validation_code ? ` · ${order.coupon_validation_code}` : ''}
          </p>
        )}
      </article>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <SEO
        title="Mis pedidos - Gatotaku"
        description="Consulta el estado de tu pedido activo y tu historial de compras en Gatotaku."
      />

      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="text-teal-600" size={22} aria-hidden="true" />
        <h1 className="section-title">Mis pedidos</h1>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !session ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-slate-600">
            Inicia sesión para ver el estado de tus pedidos y tu historial.
          </p>
          <Link to="/cuenta" className="btn-primary mt-4">
            <LogIn size={16} aria-hidden="true" />
            Iniciar sesión
          </Link>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-slate-500">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="panel p-6 text-center">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">
            Todavía no tienes pedidos. Cuando hagas uno con tu cuenta iniciada aparecerá aquí.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Pedido activo ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="panel p-4 text-sm text-slate-500">
                No tienes pedidos en curso. ¡Todos entregados!
              </p>
            ) : (
              <div className="space-y-3">{active.map((order) => renderOrder(order, false))}</div>
            )}
          </section>

          {completed.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Package size={13} aria-hidden="true" />
                Completados ({completed.length})
              </h2>
              <div className="space-y-3">{completed.map((order) => renderOrder(order, true))}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
