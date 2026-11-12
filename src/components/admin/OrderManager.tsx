import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Save, Trash2, Pencil, X, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import {
  deleteOrderStatus,
  fetchOrderStatuses,
  saveOrderStatus,
  updateOrderStatus,
} from '../../lib/orders';
import type { Order, OrderStatus, UserProfile } from '../../types/database';

const EMOJI_PICKS = ['⏳', '📦', '🚚', '✅', '🛍️', '💳', '📍', '🎁', '❌', '⭐'];

interface StatusForm {
  name: string;
  description: string;
  icon: string;
  is_completed: boolean;
  position: number;
}

const EMPTY_STATUS: StatusForm = {
  name: '',
  description: '',
  icon: '📦',
  is_completed: false,
  position: 0,
};

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusForm, setStatusForm] = useState<StatusForm>(EMPTY_STATUS);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, statusesData, usersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        fetchOrderStatuses(),
        supabase.from('users').select('*'),
      ]);

      setOrders((ordersRes.data ?? []) as Order[]);
      setStatuses(statusesData);
      setUsers((usersRes.data ?? []) as UserProfile[]);
    } catch {
      toast.error('No se pudieron cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const statusById = useMemo(
    () => Object.fromEntries(statuses.map((status) => [status.id, status])),
    [statuses],
  );

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users],
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status_id !== statusFilter) return false;
      if (!term) return true;

      const client = order.user_id ? userById[order.user_id]?.email ?? '' : '';
      return `${order.code ?? ''} ${client} ${order.coupon_code ?? ''}`.toLowerCase().includes(term);
    });
  }, [orders, search, statusFilter, userById]);

  const changeStatus = async (orderId: string, statusId: string) => {
    try {
      await updateOrderStatus(orderId, statusId);
      toast.success('Estado actualizado');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el estado');
    }
  };

  const openNewStatus = () => {
    setStatusForm({ ...EMPTY_STATUS, position: statuses.length + 1 });
    setEditingStatusId(null);
    setIsStatusFormOpen(true);
  };

  const openEditStatus = (status: OrderStatus) => {
    setStatusForm({
      name: status.name,
      description: status.description ?? '',
      icon: status.icon ?? '',
      is_completed: status.is_completed,
      position: status.position,
    });
    setEditingStatusId(status.id);
    setIsStatusFormOpen(true);
  };

  const saveStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingStatus(true);

    try {
      await saveOrderStatus(statusForm, editingStatusId ?? undefined);
      toast.success(editingStatusId ? 'Estado actualizado' : 'Estado creado');
      setIsStatusFormOpen(false);
      setEditingStatusId(null);
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el estado');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const removeStatus = async (status: OrderStatus) => {
    if (!window.confirm(`¿Eliminar el estado "${status.name}"? Los pedidos que lo usan quedarán sin estado.`)) {
      return;
    }

    try {
      await deleteOrderStatus(status.id);
      toast.success('Estado eliminado');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar el estado');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Pedidos</h2>
          <p className="text-sm text-slate-500">
            Historial de pedidos y estado que ve el cliente en «Mis pedidos».
          </p>
        </div>
        <button type="button" onClick={openNewStatus} className="btn-secondary">
          <Plus size={16} aria-hidden="true" />
          Nuevo estado
        </button>
      </div>

      {/* Filtros */}
      <div className="panel grid gap-3 p-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="order-search">Buscar</label>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="order-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pedido, cliente o cupón"
              className="field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="order-status-filter">Estado</label>
          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="field"
          >
            <option value="all">Todos</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.icon ?? ''} {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados */}
      {isStatusFormOpen && (
        <form onSubmit={saveStatus} className="panel space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingStatusId ? 'Editar estado' : 'Nuevo estado'}
            </h3>
            <button type="button" onClick={() => setIsStatusFormOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="status-name">Nombre</label>
              <input
                id="status-name"
                type="text"
                value={statusForm.name}
                onChange={(event) => setStatusForm({ ...statusForm, name: event.target.value })}
                className="field"
                placeholder="En camino"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="status-position">Orden</label>
              <input
                id="status-position"
                type="number"
                min="0"
                value={statusForm.position}
                onChange={(event) => setStatusForm({ ...statusForm, position: Number(event.target.value) || 0 })}
                className="field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="status-description">Descripción (opcional)</label>
              <input
                id="status-description"
                type="text"
                value={statusForm.description}
                onChange={(event) => setStatusForm({ ...statusForm, description: event.target.value })}
                className="field"
                placeholder="Tu pedido va en camino"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="status-icon">Icono (emoji o texto)</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="status-icon"
                  type="text"
                  value={statusForm.icon}
                  onChange={(event) => setStatusForm({ ...statusForm, icon: event.target.value })}
                  className="field w-24 text-center text-lg"
                  maxLength={4}
                />
                <div className="flex flex-wrap gap-1">
                  {EMOJI_PICKS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setStatusForm({ ...statusForm, icon: emoji })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-lg transition hover:border-teal-300"
                      aria-label={`Usar icono ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="status-completed" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  id="status-completed"
                  type="checkbox"
                  checked={statusForm.is_completed}
                  onChange={(event) => setStatusForm({ ...statusForm, is_completed: event.target.checked })}
                  className="h-4 w-4 rounded border-teal-300 accent-teal-600"
                />
                Marca el pedido como completado (pasa a «Completados» del cliente)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsStatusFormOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSavingStatus} className="btn-primary">
              <Save size={15} aria-hidden="true" />
              {isSavingStatus ? 'Guardando...' : 'Guardar estado'}
            </button>
          </div>
        </form>
      )}

      {/* Catálogo de estados */}
      <div className="panel p-4">
        <p className="field-label">Estados disponibles</p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <span
              key={status.id}
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                status.is_completed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700',
              ].join(' ')}
            >
              <span aria-hidden="true">{status.icon ?? '📦'}</span>
              {status.name}
              <button
                type="button"
                onClick={() => openEditStatus(status)}
                className="ml-1 text-slate-400 transition hover:text-teal-700"
                aria-label={`Editar ${status.name}`}
              >
                <Pencil size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void removeStatus(status)}
                className="text-slate-400 transition hover:text-red-600"
                aria-label={`Eliminar ${status.name}`}
              >
                <Trash2 size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Pedidos */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full divide-y divide-slate-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupón</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                    Cargando pedidos...
                  </td>
                </tr>
              )}
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                    <ClipboardList className="mx-auto mb-2 h-6 w-6 text-slate-300" aria-hidden="true" />
                    No hay pedidos que coincidan.
                  </td>
                </tr>
              )}
              {filteredOrders.map((order) => {
                const status = statusById[order.status_id ?? ''];
                const client = order.user_id ? userById[order.user_id] : undefined;

                return (
                  <tr key={order.id}>
                    <td className="px-4 py-4">
                      <p className="font-mono text-sm font-bold text-slate-900">{order.code ?? order.id.slice(0, 8)}</p>
                      <p className="text-[11px] text-slate-400">{order.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700">
                      {client?.email ?? '—'}
                      {client?.display_name && (
                        <p className="text-[11px] text-slate-400">{client.display_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {new Date(order.created_at).toLocaleString('es-NI')}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      C${Number(order.total).toFixed(2)}
                      {order.discount_total > 0 && (
                        <p className="text-[11px] font-semibold text-emerald-700">
                          -C${Number(order.discount_total).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-slate-600">
                      {order.coupon_code ? (
                        <>
                          <span className="font-mono font-bold">{order.coupon_code}</span>
                          {order.coupon_validation_code && (
                            <p className="font-mono text-[10px] text-slate-400">
                              {order.coupon_validation_code}
                            </p>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status_id ?? ''}
                        onChange={(event) => void changeStatus(order.id, event.target.value)}
                        className="field py-1.5 text-xs"
                        aria-label={`Estado del pedido ${order.code ?? order.id}`}
                      >
                        {!status && <option value="">Sin estado</option>}
                        {statuses.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.icon ?? ''} {item.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
