import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Shield, ShieldCheck, Ticket, User as UserIcon, Ban, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { deleteUser, reactivateUser, suspendUser } from '../../lib/adminUsers';
import type {
  Coupon,
  CouponAssignment,
  CouponRedemption,
  UserProfile,
} from '../../types/database';

export function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<CouponAssignment[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [suspendTarget, setSuspendTarget] = useState<UserProfile | null>(null);
  const [suspendMessage, setSuspendMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, assignmentsRes, redemptionsRes, couponsRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('coupon_assignments').select('*'),
        supabase.from('coupon_redemptions').select('*'),
        supabase.from('coupons').select('id, code, name'),
      ]);

      setUsers((usersRes.data ?? []) as UserProfile[]);
      setAssignments((assignmentsRes.data ?? []) as CouponAssignment[]);
      setRedemptions((redemptionsRes.data ?? []) as CouponRedemption[]);
      setCoupons((couponsRes.data ?? []) as Coupon[]);
    } catch {
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.email, user.username ?? '', user.display_name ?? '', user.whatsapp ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [users, search]);

  const toggleAdmin = async (user: UserProfile) => {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: !user.is_admin })
      .eq('id', user.id);

    if (error) {
      toast.error('No se pudo actualizar el usuario');
      return;
    }

    toast.success(user.is_admin ? 'Se quitó el acceso de administrador' : 'Ahora es administrador');
    await loadAll();
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;

    if (!suspendMessage.trim()) {
      toast.error('Escribe el motivo de la suspensión');
      return;
    }

    setIsSubmitting(true);

    try {
      await suspendUser(suspendTarget.id, suspendMessage.trim());
      toast.success('Cuenta suspendida');
      setSuspendTarget(null);
      setSuspendMessage('');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo suspender la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async (user: UserProfile) => {
    if (!window.confirm(`¿Reactivar la cuenta ${user.email}?`)) return;

    try {
      await reactivateUser(user.id);
      toast.success('Cuenta reactivada');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo reactivar la cuenta');
    }
  };

  const handleDelete = async (user: UserProfile) => {
    const confirmed = window.confirm(
      `¿Eliminar la cuenta ${user.email}?\n\nSe borra el perfil, sus cupones asignados y su acceso. ` +
        'El historial de pedidos con cupón se conserva. Podrá registrarse de nuevo desde cero.',
    );
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      toast.success('Cuenta eliminada');
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta');
    }
  };

  const couponById = useMemo(
    () => Object.fromEntries(coupons.map((coupon) => [coupon.id, coupon])),
    [coupons],
  );

  const userCoupons = (userId: string) => {
    const assigned = assignments
      .filter((assignment) => assignment.user_id === userId && !assignment.revoked_at)
      .map((assignment) => ({
        coupon: couponById[assignment.coupon_id],
        revoked: false,
        used: redemptions.some(
          (redemption) =>
            redemption.user_id === userId && redemption.coupon_id === assignment.coupon_id,
        ),
      }));

    const usedCodes = new Set(
      redemptions
        .filter((redemption) => redemption.user_id === userId)
        .map((redemption) => redemption.coupon_id),
    );

    const usedNotAssigned = [...usedCodes]
      .filter((couponId) => !assignments.some((assignment) => assignment.coupon_id === couponId && assignment.user_id === userId))
      .map((couponId) => ({ coupon: couponById[couponId], revoked: true, used: true }));

    return [...assigned, ...usedNotAssigned].filter((entry) => entry.coupon);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Usuarios</h2>
        <p className="text-sm text-slate-500">
          Cuentas registradas, sus cupones asignados, permisos y suspensión.
        </p>
      </div>

      <div className="panel p-4">
        <label className="field-label" htmlFor="user-search">Buscar usuario</label>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Correo, usuario o WhatsApp"
            className="field pl-9"
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full divide-y divide-slate-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                    No hay usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => {
                const entries = userCoupons(user.id);
                const isExpanded = expandedId === user.id;

                return (
                  <Fragment key={user.id}>
                    <tr className={user.is_suspended ? 'bg-red-50/40' : undefined}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                              <UserIcon size={16} aria-hidden="true" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                            <p className="truncate text-xs text-gray-500">
                              {user.display_name || user.username || '—'}
                              {user.whatsapp ? ` · ${user.whatsapp}` : ''}
                            </p>
                            {user.is_suspended && (
                              <p className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                Suspendida
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('es-NI')
                          : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {entries.length === 0 ? (
                          <span className="text-xs text-gray-400">Sin cupones</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : user.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800"
                          >
                            <Ticket size={12} aria-hidden="true" />
                            {entries.length} cupón(es)
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            user.is_admin
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          {user.is_admin ? (
                            <ShieldCheck size={11} aria-hidden="true" />
                          ) : (
                            <Shield size={11} aria-hidden="true" />
                          )}
                          {user.is_admin ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => void toggleAdmin(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {user.is_admin ? 'Quitar admin' : 'Dar admin'}
                          </button>

                          {user.is_suspended ? (
                            <button
                              type="button"
                              onClick={() => void handleReactivate(user)}
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                            >
                              <RotateCcw size={13} aria-hidden="true" />
                              Reactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSuspendTarget(user);
                                setSuspendMessage('');
                              }}
                              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900"
                            >
                              <Ban size={13} aria-hidden="true" />
                              Suspender
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleDelete(user)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && entries.length > 0 && (
                      <tr>
                        <td colSpan={5} className="bg-slate-50 px-4 py-3">
                          <ul className="space-y-1">
                            {entries.map((entry) => (
                              <li
                                key={`${entry.coupon?.id}-${entry.revoked}`}
                                className="flex flex-wrap items-center gap-2 text-xs text-slate-700"
                              >
                                <span className="font-mono font-bold">{entry.coupon?.code}</span>
                                <span className="text-slate-500">{entry.coupon?.name}</span>
                                <span
                                  className={[
                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                                    entry.used
                                      ? 'bg-slate-200 text-slate-600'
                                      : 'bg-teal-100 text-teal-800',
                                  ].join(' ')}
                                >
                                  {entry.used ? 'Usado' : 'Disponible'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {suspendTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Suspender cuenta</h3>
                <p className="mt-1 text-sm text-slate-500">{suspendTarget.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuspendTarget(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Cerrar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">
              <label className="field-label" htmlFor="suspend-message">
                Motivo (se le muestra al usuario al intentar entrar)
              </label>
              <textarea
                id="suspend-message"
                value={suspendMessage}
                onChange={(event) => setSuspendMessage(event.target.value)}
                rows={3}
                className="field"
                placeholder="Tu cuenta ha sido suspendida por: ..."
              />
              <p className="mt-2 text-[11px] text-slate-400">
                No podrá iniciar sesión. El correo queda registrado, así que no puede crear otra cuenta
                con el mismo correo.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSuspendTarget(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSuspend()}
                disabled={isSubmitting}
                className="btn-danger"
              >
                <Ban size={15} aria-hidden="true" />
                {isSubmitting ? 'Suspendiendo...' : 'Suspender cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
