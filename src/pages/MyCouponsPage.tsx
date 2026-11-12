import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Check, Copy, Clock, Ban, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { describeCouponConditions, formatCouponDiscount } from '../lib/coupons';
import type {
  Coupon,
  CouponAssignment,
  CouponCategory,
  CouponProduct,
  CouponRedemption,
} from '../types/database';

type CouponBucket = 'disponibles' | 'usados' | 'vencidos';

const BUCKET_LABEL: Record<CouponBucket, string> = {
  disponibles: 'Disponibles',
  usados: 'Utilizados',
  vencidos: 'Vencidos',
};

export default function MyCouponsPage() {
  const { session, loading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [assignments, setAssignments] = useState<CouponAssignment[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [couponProducts, setCouponProducts] = useState<CouponProduct[]>([]);
  const [couponCategories, setCouponCategories] = useState<CouponCategory[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user.id ?? null;

  const loadCoupons = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const [couponsRes, assignmentsRes, redemptionsRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from('coupons').select('*'),
        supabase.from('coupon_assignments').select('*').eq('user_id', userId),
        supabase.from('coupon_redemptions').select('*').eq('user_id', userId),
        supabase.from('coupon_products').select('*'),
        supabase.from('coupon_categories').select('*'),
      ]);

      setCoupons((couponsRes.data ?? []) as Coupon[]);
      setAssignments((assignmentsRes.data ?? []) as CouponAssignment[]);
      setRedemptions((redemptionsRes.data ?? []) as CouponRedemption[]);
      setCouponProducts((productsRes.data ?? []) as CouponProduct[]);
      setCouponCategories((categoriesRes.data ?? []) as CouponCategory[]);

      const productIds = (productsRes.data ?? []).map((row: CouponProduct) => row.product_id);
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds);
        setProductNames(
          Object.fromEntries((products ?? []).map((product) => [product.id, product.name])),
        );
      }

      const categoryIds = (categoriesRes.data ?? []).map((row: CouponCategory) => row.category_id);
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', categoryIds);
        setCategoryNames(
          Object.fromEntries((categories ?? []).map((category) => [category.id, category.name])),
        );
      }
    } catch {
      toast.error('No se pudieron cargar tus cupones');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void loadCoupons();
    } else {
      setCoupons([]);
      setAssignments([]);
      setRedemptions([]);
    }
  }, [userId, loadCoupons]);

  const grouped = useMemo(() => {
    const buckets: Record<CouponBucket, Coupon[]> = { disponibles: [], usados: [], vencidos: [] };
    const now = Date.now();

    for (const coupon of coupons) {
      const userUsages = redemptions.filter((r) => r.coupon_id === coupon.id).length;
      const assignment = assignments.find((a) => a.coupon_id === coupon.id);
      const revokedForUser = Boolean(assignment?.revoked_at);
      const expired = Boolean(coupon.expires_at && new Date(coupon.expires_at).getTime() < now);
      const notStarted = Boolean(coupon.starts_at && new Date(coupon.starts_at).getTime() > now);
      const exhausted = coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses;
      const userExhausted = userUsages >= coupon.max_uses_per_user;

      if (userExhausted) {
        buckets.usados.push(coupon);
      } else if (
        expired ||
        notStarted ||
        exhausted ||
        revokedForUser ||
        !coupon.is_active ||
        coupon.is_revoked
      ) {
        buckets.vencidos.push(coupon);
      } else {
        buckets.disponibles.push(coupon);
      }
    }

    return buckets;
  }, [coupons, redemptions, assignments]);

  const eligibleLabel = (coupon: Coupon): string => {
    if (coupon.applies_to === 'all') return 'Todos los productos';

    if (coupon.applies_to === 'products') {
      const names = couponProducts
        .filter((row) => row.coupon_id === coupon.id)
        .map((row) => productNames[row.product_id])
        .filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'Productos seleccionados';
    }

    const names = couponCategories
      .filter((row) => row.coupon_id === coupon.id)
      .map((row) => categoryNames[row.category_id])
      .filter(Boolean);
    return names.length > 0 ? `Categorías: ${names.join(', ')}` : 'Categorías seleccionadas';
  };

  const unavailableReason = (coupon: Coupon): string => {
    const now = Date.now();
    const assignment = assignments.find((a) => a.coupon_id === coupon.id);
    if (assignment?.revoked_at) return 'Retirado por la tienda';
    if (coupon.is_revoked) return 'Revocado por la tienda';
    if (!coupon.is_active) return 'Cupón inactivo';
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
      return `Venció el ${new Date(coupon.expires_at).toLocaleDateString('es-NI')}`;
    }
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
      return `Vigente desde ${new Date(coupon.starts_at).toLocaleDateString('es-NI')}`;
    }
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return 'Alcanzó el límite de usos';
    }
    return 'No disponible';
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Código copiado');
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <SEO
        title="Mis cupones - Gatotaku"
        description="Consulta los cupones disponibles, utilizados y vencidos de tu cuenta Gatotaku."
      />

      <div className="mb-4 flex items-center gap-2">
        <Ticket className="text-teal-600" size={22} aria-hidden="true" />
        <h1 className="section-title">Mis cupones</h1>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !session ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-slate-600">
            Inicia sesión para ver los cupones disponibles de tu cuenta.
          </p>
          <Link to="/cuenta" className="btn-primary mt-4">
            <LogIn size={16} aria-hidden="true" />
            Iniciar sesión
          </Link>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-slate-500">Cargando cupones...</p>
      ) : coupons.length === 0 ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-slate-500">
            Todavía no tienes cupones. Cuando la tienda te asigne uno aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {(Object.keys(BUCKET_LABEL) as CouponBucket[]).map((bucket) => {
            const list = grouped[bucket];
            if (list.length === 0) return null;

            return (
              <div key={bucket}>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {BUCKET_LABEL[bucket]} ({list.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((coupon) => {
                    const isAvailable = bucket === 'disponibles';
                    const isUsed = bucket === 'usados';

                    return (
                      <article
                        key={coupon.id}
                        className={[
                          'rounded-xl border p-4 transition-all duration-200',
                          isAvailable
                            ? 'border-teal-300 bg-teal-50 shadow-[0_10px_28px_rgba(15,159,143,0.16)] hover:-translate-y-0.5'
                            : 'border-slate-200 bg-white opacity-80',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{coupon.name}</p>
                            <p className="mt-0.5 text-2xl font-bold text-teal-700">
                              {formatCouponDiscount(coupon)}
                            </p>
                          </div>
                          <span
                            className={[
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              isAvailable
                                ? 'bg-teal-600 text-white'
                                : isUsed
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-red-100 text-red-700',
                            ].join(' ')}
                          >
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1">
                                <Check size={10} aria-hidden="true" />
                                Disponible
                              </span>
                            ) : isUsed ? (
                              'Utilizado'
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Ban size={10} aria-hidden="true" />
                                {unavailableReason(coupon)}
                              </span>
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => void copyCode(coupon.code)}
                          className={[
                            'mt-3 inline-flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-bold tracking-wider transition-colors',
                            isAvailable
                              ? 'border-teal-300 bg-white text-teal-800 hover:border-teal-400'
                              : 'border-slate-200 bg-slate-50 text-slate-500',
                          ].join(' ')}
                          aria-label={`Copiar código ${coupon.code}`}
                        >
                          {coupon.code}
                          <Copy size={14} aria-hidden="true" />
                        </button>

                        <p className="mt-3 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Aplica a:</span>{' '}
                          {eligibleLabel(coupon)}
                        </p>

                        <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
                          {describeCouponConditions(coupon).map((condition) => (
                            <li key={condition} className="flex items-start gap-1">
                              <Clock size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>

                        {coupon.assignment_type === 'specific' && (
                          <p className="mt-2 text-[11px] font-semibold text-teal-700">
                            Cupón personal asignado a tu cuenta
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
