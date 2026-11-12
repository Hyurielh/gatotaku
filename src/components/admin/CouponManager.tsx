import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ticket,
  Plus,
  Pencil,
  Users,
  Ban,
  CheckCircle2,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { formatCouponDiscount } from '../../lib/coupons';
import type {
  Category,
  Coupon,
  CouponAssignment,
  CouponRedemption,
  UserProfile,
} from '../../types/database';

interface CouponForm {
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  starts_at: string;
  expires_at: string;
  max_uses: string;
  max_uses_per_user: string;
  assignment_type: 'general' | 'specific';
  applies_to: 'all' | 'products' | 'categories';
  is_exclusion: boolean;
  is_active: boolean;
}

const EMPTY_FORM: CouponForm = {
  name: '',
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  starts_at: '',
  expires_at: '',
  max_uses: '',
  max_uses_per_user: '1',
  assignment_type: 'general',
  applies_to: 'all',
  is_exclusion: false,
  is_active: true,
};

type StatusFilter = 'all' | 'active' | 'inactive' | 'revoked' | 'expired';
type AssignmentFilter = 'all' | 'general' | 'specific';
type ExpiryFilter = 'all' | 'valid' | 'expired';

const toLocalInput = (value: string | null) => (value ? new Date(value).toISOString().slice(0, 16) : '');
const toIsoOrNull = (value: string) => (value ? new Date(value).toISOString() : null);

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [assignments, setAssignments] = useState<CouponAssignment[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('all');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [manageId, setManageId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [validationCode, setValidationCode] = useState('');
  const [validationResult, setValidationResult] = useState<
    | { status: 'ok'; redemption: CouponRedemption; user: UserProfile | undefined }
    | { status: 'error'; message: string }
    | null
  >(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [couponsRes, assignmentsRes, redemptionsRes, usersRes, categoriesRes, productsRes] =
        await Promise.all([
          supabase.from('coupons').select('*').order('created_at', { ascending: false }),
          supabase.from('coupon_assignments').select('*'),
          supabase.from('coupon_redemptions').select('*'),
          supabase.from('users').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('id, name').order('name'),
        ]);

      setCoupons((couponsRes.data ?? []) as Coupon[]);
      setAssignments((assignmentsRes.data ?? []) as CouponAssignment[]);
      setRedemptions((redemptionsRes.data ?? []) as CouponRedemption[]);
      setUsers((usersRes.data ?? []) as UserProfile[]);
      setCategories((categoriesRes.data ?? []) as Category[]);
      setProducts((productsRes.data ?? []) as { id: string; name: string }[]);
    } catch {
      toast.error('No se pudieron cargar los cupones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const isExpired = (coupon: Coupon) =>
    Boolean(coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now());

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      if (term && !`${coupon.name} ${coupon.code}`.toLowerCase().includes(term)) return false;
      if (assignmentFilter !== 'all' && coupon.assignment_type !== assignmentFilter) return false;

      if (statusFilter === 'active' && (!coupon.is_active || coupon.is_revoked)) return false;
      if (statusFilter === 'inactive' && coupon.is_active) return false;
      if (statusFilter === 'revoked' && !coupon.is_revoked) return false;
      if (statusFilter === 'expired' && !isExpired(coupon)) return false;

      if (expiryFilter === 'expired' && !isExpired(coupon)) return false;
      if (expiryFilter === 'valid' && isExpired(coupon)) return false;

      return true;
    });
  }, [coupons, search, statusFilter, assignmentFilter, expiryFilter]);

  const couponStats = useCallback(
    (couponId: string) => {
      const couponAssignments = assignments.filter(
        (assignment) => assignment.coupon_id === couponId && !assignment.revoked_at,
      );
      const couponRedemptions = redemptions.filter((redemption) => redemption.coupon_id === couponId);
      const usedBy = new Set(couponRedemptions.map((redemption) => redemption.user_id));

      return {
        assigned: couponAssignments.length,
        used: usedBy.size,
        available: couponAssignments.filter((assignment) => !usedBy.has(assignment.user_id)).length,
        redemptions: couponRedemptions.length,
        amount: couponRedemptions.reduce((sum, redemption) => sum + Number(redemption.amount), 0),
      };
    },
    [assignments, redemptions],
  );

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (coupon: Coupon) => {
    setForm({
      name: coupon.name,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      starts_at: toLocalInput(coupon.starts_at),
      expires_at: toLocalInput(coupon.expires_at),
      max_uses: coupon.max_uses === null ? '' : String(coupon.max_uses),
      max_uses_per_user: String(coupon.max_uses_per_user),
      assignment_type: coupon.assignment_type,
      applies_to: coupon.applies_to,
      is_exclusion: Boolean(coupon.is_exclusion),
      is_active: coupon.is_active,
    });

    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('coupon_products').select('product_id').eq('coupon_id', coupon.id),
      supabase.from('coupon_categories').select('category_id').eq('coupon_id', coupon.id),
    ]);

    setSelectedProductIds((productsRes.data ?? []).map((row) => row.product_id));
    setSelectedCategoryIds((categoriesRes.data ?? []).map((row) => row.category_id));
    setEditingId(coupon.id);
    setIsFormOpen(true);
  };

  const saveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        starts_at: toIsoOrNull(form.starts_at),
        expires_at: toIsoOrNull(form.expires_at),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        max_uses_per_user: Number(form.max_uses_per_user) || 1,
        assignment_type: form.assignment_type,
        applies_to: form.applies_to,
        is_exclusion: form.applies_to === 'all' ? false : form.is_exclusion,
        is_active: form.is_active,
      };

      if (!payload.name || !payload.code || !payload.discount_value) {
        toast.error('Nombre, código y valor del descuento son obligatorios');
        return;
      }

      let couponId = editingId;

      if (couponId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', couponId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('coupons')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        couponId = data.id;
      }

      await supabase.from('coupon_products').delete().eq('coupon_id', couponId);
      await supabase.from('coupon_categories').delete().eq('coupon_id', couponId);

      if (form.applies_to === 'products' && selectedProductIds.length > 0) {
        const { error } = await supabase
          .from('coupon_products')
          .insert(selectedProductIds.map((product_id) => ({ coupon_id: couponId!, product_id })));
        if (error) throw error;
      }

      if (form.applies_to === 'categories' && selectedCategoryIds.length > 0) {
        const { error } = await supabase
          .from('coupon_categories')
          .insert(selectedCategoryIds.map((category_id) => ({ coupon_id: couponId!, category_id })));
        if (error) throw error;
      }

      toast.success(editingId ? 'Cupón actualizado' : 'Cupón creado');
      setIsFormOpen(false);
      setEditingId(null);
      await loadAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el cupón';
      toast.error(message.includes('coupons_code_upper_unique') ? 'Ese código ya existe' : message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleField = async (coupon: Coupon, field: 'is_active' | 'is_revoked') => {
    const { error } = await supabase
      .from('coupons')
      .update({ [field]: !coupon[field] })
      .eq('id', coupon.id);
    if (error) {
      toast.error('No se pudo actualizar el cupón');
      return;
    }
    await loadAll();
  };

  const removeCoupon = async (coupon: Coupon) => {
    const stats = couponStats(coupon.id);
    if (stats.redemptions > 0) {
      toast.error('Este cupón ya tiene usos registrados: desactívalo o revócalo, no se puede borrar');
      return;
    }
    if (!window.confirm(`¿Eliminar el cupón ${coupon.code}?`)) return;

    const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
    if (error) {
      toast.error('No se pudo eliminar el cupón');
      return;
    }
    if (manageId === coupon.id) setManageId(null);
    toast.success('Cupón eliminado');
    await loadAll();
  };

  const assignUsers = async (couponId: string) => {
    if (selectedUserIds.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    const { error } = await supabase
      .from('coupon_assignments')
      .upsert(
        selectedUserIds.map((user_id) => ({
          coupon_id: couponId,
          user_id,
          revoked_at: null,
          revoked_by: null,
        })),
        { onConflict: 'coupon_id,user_id' },
      );

    if (error) {
      toast.error('No se pudieron asignar los cupones');
      return;
    }

    toast.success(`${selectedUserIds.length} usuario(s) asignado(s)`);
    setSelectedUserIds([]);
    await loadAll();
  };

  const revokeUser = async (couponId: string, userId: string) => {
    const { error } = await supabase
      .from('coupon_assignments')
      .update({ revoked_at: new Date().toISOString() })
      .eq('coupon_id', couponId)
      .eq('user_id', userId);
    if (error) {
      toast.error('No se pudo retirar el cupón');
      return;
    }
    toast.success('Cupón retirado al usuario');
    await loadAll();
  };

  const revokeAllUsers = async (couponId: string) => {
    if (!window.confirm('¿Retirar este cupón a todos los usuarios asignados?')) return;

    const { error } = await supabase
      .from('coupon_assignments')
      .update({ revoked_at: new Date().toISOString() })
      .eq('coupon_id', couponId)
      .is('revoked_at', null);
    if (error) {
      toast.error('No se pudo retirar el cupón');
      return;
    }
    toast.success('Cupón retirado a todos los usuarios');
    await loadAll();
  };

  const restoreUsers = async (couponId: string) => {
    const { error } = await supabase
      .from('coupon_assignments')
      .update({ revoked_at: null, revoked_by: null })
      .eq('coupon_id', couponId);
    if (error) {
      toast.error('No se pudieron restaurar las asignaciones');
      return;
    }
    toast.success('Asignaciones restauradas');
    await loadAll();
  };

  const managedCoupon = coupons.find((coupon) => coupon.id === manageId) ?? null;
  const managedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.coupon_id === manageId),
    [assignments, manageId],
  );
  const managedRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.coupon_id === manageId),
    [redemptions, manageId],
  );
  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => user.email.toLowerCase().includes(term));
  }, [users, userSearch]);

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users],
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const validateOrderCode = async () => {
    const code = validationCode.trim().toUpperCase();

    if (!code) {
      setValidationResult({ status: 'error', message: 'Escribe el código de validación' });
      return;
    }

    const { data, error } = await supabase
      .from('coupon_redemptions')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      setValidationResult({ status: 'error', message: 'No se pudo consultar el código' });
      return;
    }

    if (!data) {
      setValidationResult({
        status: 'error',
        message: 'Ese código no existe. Si el cliente lo inventó, el pedido no lleva descuento.',
      });
      return;
    }

    const redemption = data as CouponRedemption;
    setValidationResult({
      status: 'ok',
      redemption,
      user: users.find((user) => user.id === redemption.user_id),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Cupones</h2>
          <p className="text-sm text-slate-500">
            Crea promociones, asócialas a usuarios y revócalas cuando quieras.
          </p>
        </div>
        <button type="button" onClick={openCreateForm} className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          Crear cupón
        </button>
      </div>

      {/* Filtros */}
      <div className="panel grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="field-label" htmlFor="coupon-search">Buscar</label>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="coupon-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre o código"
              className="field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="coupon-status">Estado</label>
          <select
            id="coupon-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="field"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="revoked">Revocados</option>
            <option value="expired">Vencidos</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="coupon-assignment">Modalidad</label>
          <select
            id="coupon-assignment"
            value={assignmentFilter}
            onChange={(event) => setAssignmentFilter(event.target.value as AssignmentFilter)}
            className="field"
          >
            <option value="all">Todas</option>
            <option value="general">Generales</option>
            <option value="specific">Usuarios específicos</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="coupon-expiry">Vencimiento</label>
          <select
            id="coupon-expiry"
            value={expiryFilter}
            onChange={(event) => setExpiryFilter(event.target.value as ExpiryFilter)}
            className="field"
          >
            <option value="all">Todos</option>
            <option value="valid">Vigentes</option>
            <option value="expired">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <form onSubmit={saveCoupon} className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Editar cupón' : 'Nuevo cupón'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Cerrar formulario"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label" htmlFor="coupon-name">Nombre interno</label>
              <input
                id="coupon-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="field"
                placeholder="Promoción de julio"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-code">Código</label>
              <input
                id="coupon-code"
                type="text"
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                className="field font-mono uppercase"
                placeholder="GAT10"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-type">Tipo de descuento</label>
              <select
                id="coupon-type"
                value={form.discount_type}
                onChange={(event) =>
                  setForm({ ...form, discount_type: event.target.value as CouponForm['discount_type'] })
                }
                className="field"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Cantidad fija</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-value">
                Valor {form.discount_type === 'percentage' ? '(%)' : '(C$)'}
              </label>
              <input
                id="coupon-value"
                type="number"
                step="0.01"
                min="0"
                max={form.discount_type === 'percentage' ? 100 : undefined}
                value={form.discount_value}
                onChange={(event) => setForm({ ...form, discount_value: event.target.value })}
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-start">Inicio</label>
              <input
                id="coupon-start"
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => setForm({ ...form, starts_at: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-expires">Vencimiento</label>
              <input
                id="coupon-expires"
                type="datetime-local"
                value={form.expires_at}
                onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-max-uses">Límite de usos (vacío = sin límite)</label>
              <input
                id="coupon-max-uses"
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(event) => setForm({ ...form, max_uses: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-max-user">Límite por usuario</label>
              <input
                id="coupon-max-user"
                type="number"
                min="1"
                value={form.max_uses_per_user}
                onChange={(event) => setForm({ ...form, max_uses_per_user: event.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-assignment-type">Asignación</label>
              <select
                id="coupon-assignment-type"
                value={form.assignment_type}
                onChange={(event) =>
                  setForm({ ...form, assignment_type: event.target.value as CouponForm['assignment_type'] })
                }
                className="field"
              >
                <option value="general">General (todos los usuarios)</option>
                <option value="specific">Usuarios específicos</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="coupon-applies">Aplica a</label>
              <select
                id="coupon-applies"
                value={form.applies_to}
                onChange={(event) =>
                  setForm({ ...form, applies_to: event.target.value as CouponForm['applies_to'] })
                }
                className="field"
              >
                <option value="all">Todos los productos</option>
                <option value="categories">Solo ciertas categorías</option>
                <option value="products">Solo ciertos productos</option>
              </select>
            </div>

            {form.applies_to !== 'all' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 sm:col-span-2 lg:col-span-3">
                <label htmlFor="coupon-exclusion" className="flex cursor-pointer items-start gap-2">
                  <input
                    id="coupon-exclusion"
                    type="checkbox"
                    checked={form.is_exclusion}
                    onChange={(event) => setForm({ ...form, is_exclusion: event.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-amber-300 accent-amber-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-amber-900">Modo exclusión</span>
                    <span className="mt-0.5 block text-xs text-amber-800">
                      Aplica a todo menos a lo seleccionado abajo. Marca solo lo que NO quieres incluir
                      (así no tienes que marcar todo y desmarcar).
                    </span>
                  </span>
                </label>
              </div>
            )}
            <div className="flex items-end">
              <label htmlFor="coupon-active" className="flex cursor-pointer items-center gap-2">
                <input
                  id="coupon-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                  className="h-4 w-4 rounded border-teal-300 accent-teal-600"
                />
                <span className="text-sm font-medium text-slate-700">Activo</span>
              </label>
            </div>
          </div>

          {form.applies_to === 'categories' && (
            <div>
              <span className="field-label">
                {form.is_exclusion ? 'Categorías excluidas (no aplican)' : 'Categorías elegibles'}
              </span>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-2">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const selected = selectedCategoryIds.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategoryIds((current) =>
                            current.includes(category.id)
                              ? current.filter((id) => id !== category.id)
                              : [...current, category.id],
                          )
                        }
                        className={[
                          'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                          selected
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300',
                        ].join(' ')}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {form.applies_to === 'products' && (
            <div>
              <span className="field-label">
                {form.is_exclusion ? 'Productos excluidos (no aplican)' : 'Productos elegibles'}
              </span>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-2">
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => {
                    const selected = selectedProductIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          setSelectedProductIds((current) =>
                            current.includes(product.id)
                              ? current.filter((id) => id !== product.id)
                              : [...current, product.id],
                          )
                        }
                        className={[
                          'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                          selected
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300',
                        ].join(' ')}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </form>
      )}

      {/* Validación de códigos de pedido */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Validar pedido con cupón</h3>
            <p className="text-sm text-slate-500">
              El cliente envía un código único en su pedido por WhatsApp. Verifícalo aquí para confirmar
              que el descuento es real.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={validationCode}
            onChange={(event) => setValidationCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void validateOrderCode();
              }
            }}
            placeholder="GAT-7F3A9K2B"
            aria-label="Código de validación del pedido"
            className="field flex-1 font-mono uppercase"
          />
          <button type="button" onClick={() => void validateOrderCode()} className="btn-primary">
            <Search size={15} aria-hidden="true" />
            Validar
          </button>
        </div>

        {validationResult?.status === 'error' && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {validationResult.message}
          </p>
        )}

        {validationResult?.status === 'ok' && (
          <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-teal-800">
              <CheckCircle2 size={16} aria-hidden="true" />
              Código válido: {validationResult.redemption.code}
            </p>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="font-semibold">Cupón:</dt>
                <dd className="font-mono">{validationResult.redemption.coupon_code}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Cliente:</dt>
                <dd>{validationResult.user?.email ?? validationResult.redemption.user_id}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Descuento:</dt>
                <dd>C${Number(validationResult.redemption.amount).toFixed(2)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">Fecha:</dt>
                <dd>{new Date(validationResult.redemption.created_at).toLocaleString('es-NI')}</dd>
              </div>
            </dl>
            {Array.isArray(validationResult.redemption.items) && validationResult.redemption.items.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {(validationResult.redemption.items as { product_id: string; quantity: number; line_total: number; discount: number; eligible: boolean }[]).map((item) => (
                  <li key={item.product_id}>
                    {item.quantity} x {item.product_id.slice(0, 8)} — C${Number(item.line_total).toFixed(2)}
                    {item.discount > 0 ? ` (-C$${Number(item.discount).toFixed(2)})` : ''}
                    {item.eligible ? '' : ' · no elegible'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Listado */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-slate-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupón</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                    Cargando cupones...
                  </td>
                </tr>
              )}
              {!isLoading && filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                    No hay cupones que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {filteredCoupons.map((coupon) => {
                const stats = couponStats(coupon.id);
                return (
                  <tr key={coupon.id}>
                    <td className="px-4 py-4">
                      <p className="font-mono text-sm font-bold text-slate-900">{coupon.code}</p>
                      <p className="text-xs text-slate-500">{coupon.name}</p>
                      {coupon.applies_to !== 'all' && (
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          {coupon.is_exclusion ? 'Excluye' : 'Solo'}{' '}
                          {coupon.applies_to === 'products' ? 'productos' : 'categorías'}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-teal-700">
                      {formatCouponDiscount(coupon)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        {coupon.assignment_type === 'general' ? 'General' : 'Específico'}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {coupon.assignment_type === 'general'
                          ? `${stats.redemptions} uso(s)`
                          : `${stats.assigned} asignado(s) · ${stats.used} lo usaron`}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {coupon.expires_at ? (
                        <>Vence {new Date(coupon.expires_at).toLocaleDateString('es-NI')}</>
                      ) : (
                        'Sin vencimiento'
                      )}
                      <p className="text-[11px] text-slate-400">
                        Límite {coupon.max_uses ?? '∞'} · {coupon.max_uses_per_user} por usuario
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {coupon.uses_count}
                      {coupon.max_uses !== null ? `/${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            coupon.is_revoked
                              ? 'bg-red-100 text-red-700'
                              : coupon.is_active
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-slate-200 text-slate-600',
                          ].join(' ')}
                        >
                          {coupon.is_revoked ? 'Revocado' : coupon.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {isExpired(coupon) && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                            Vencido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setManageId(manageId === coupon.id ? null : coupon.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label={`Gestionar asignaciones de ${coupon.code}`}
                          title="Asignaciones"
                        >
                          <Users size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void openEditForm(coupon)}
                          className="text-slate-600 hover:text-slate-900"
                          aria-label={`Editar ${coupon.code}`}
                          title="Editar"
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleField(coupon, 'is_active')}
                          className="text-amber-600 hover:text-amber-800"
                          aria-label={`${coupon.is_active ? 'Desactivar' : 'Activar'} ${coupon.code}`}
                          title={coupon.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {coupon.is_active ? (
                            <Ban size={16} aria-hidden="true" />
                          ) : (
                            <CheckCircle2 size={16} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleField(coupon, 'is_revoked')}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`${coupon.is_revoked ? 'Restaurar' : 'Revocar'} ${coupon.code}`}
                          title={coupon.is_revoked ? 'Restaurar' : 'Revocar para todos'}
                        >
                          <RotateCcw size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeCoupon(coupon)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Eliminar ${coupon.code}`}
                          title="Eliminar"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de asignaciones */}
      {managedCoupon && (
        <section className="panel space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Asignaciones de {managedCoupon.code}
            </h3>
            <button
              type="button"
              onClick={() => setManageId(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Cerrar asignaciones"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Asignados</p>
              <p className="text-xl font-bold text-slate-900">{managedAssignments.filter((a) => !a.revoked_at).length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ya lo usaron</p>
              <p className="text-xl font-bold text-slate-900">
                {new Set(managedRedemptions.map((r) => r.user_id)).size}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Usos totales</p>
              <p className="text-xl font-bold text-slate-900">{managedRedemptions.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Descuento dado</p>
              <p className="text-xl font-bold text-teal-700">
                C${managedRedemptions.reduce((sum, r) => sum + Number(r.amount), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void revokeAllUsers(managedCoupon.id)}
              className="btn-secondary"
            >
              <Ban size={15} aria-hidden="true" />
              Revocar a todos
            </button>
            <button
              type="button"
              onClick={() => void restoreUsers(managedCoupon.id)}
              className="btn-secondary"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Restaurar asignaciones
            </button>
          </div>

          <div>
            <p className="field-label">Pedidos con este cupón</p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
              {managedRedemptions.length === 0 ? (
                <p className="p-3 text-sm text-slate-500">Este cupón todavía no se ha usado.</p>
              ) : (
                managedRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-0"
                  >
                    <span className="font-mono text-xs font-bold text-teal-700">
                      {redemption.code ?? '—'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                      {userById[redemption.user_id]?.email ?? redemption.user_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      -C${Number(redemption.amount).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(redemption.created_at).toLocaleDateString('es-NI')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="field-label">Asignar usuarios</p>
              <input
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Buscar por correo"
                className="field mb-2"
                aria-label="Buscar usuarios para asignar"
              />
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
                {filteredUsers.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500">No hay usuarios que coincidan.</p>
                ) : (
                  filteredUsers.map((user) => {
                    const assigned = managedAssignments.find(
                      (assignment) => assignment.user_id === user.id && !assignment.revoked_at,
                    );
                    const used = managedRedemptions.some((redemption) => redemption.user_id === user.id);

                    return (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-0 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-4 w-4 rounded border-teal-300 accent-teal-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {user.email}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {user.is_admin ? 'Administrador' : 'Cliente'}
                            {used ? ' · ya lo usó' : ''}
                            {assigned ? ' · asignado' : ''}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void assignUsers(managedCoupon.id)}
                  className="btn-primary"
                >
                  <Ticket size={15} aria-hidden="true" />
                  Asignar ({selectedUserIds.length})
                </button>
                {selectedUserIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="field-label">Usuarios con este cupón</p>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
                {managedAssignments.length === 0 ? (
                  <p className="p-3 text-sm text-slate-500">
                    Este cupón aún no tiene asignaciones individuales.
                  </p>
                ) : (
                  managedAssignments.map((assignment) => {
                    const user = userById[assignment.user_id];
                    const used = managedRedemptions.some(
                      (redemption) => redemption.user_id === assignment.user_id,
                    );

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {user?.email ?? assignment.user_id}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {assignment.revoked_at ? 'Retirado' : used ? 'Ya lo usó' : 'Disponible'}
                          </span>
                        </span>
                        {!assignment.revoked_at ? (
                          <button
                            type="button"
                            onClick={() => void revokeUser(managedCoupon.id, assignment.user_id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                          >
                            Retirar
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold uppercase text-slate-400">
                            Retirado
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
