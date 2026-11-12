import { useState } from 'react';
import { LogOut, Package, Users, Ticket, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { SEO } from '../components/SEO';
import { InventoryManager } from '../components/admin/InventoryManager';
import { UserManager } from '../components/admin/UserManager';
import { CouponManager } from '../components/admin/CouponManager';
import { OrderManager } from '../components/admin/OrderManager';

type AdminSection = 'inventario' | 'pedidos' | 'usuarios' | 'cupones';

const SECTIONS: { id: AdminSection; label: string; icon: typeof Package }[] = [
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'cupones', label: 'Cupones', icon: Ticket },
];

export default function AdminPanel() {
  const { session, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>('inventario');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/', { replace: true });
    } catch {
      toast.error('No se pudo cerrar la sesión');
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Unauthorized Access</div>;
  }

  return (
    <div className="admin-panel">
      <SEO
        title="Panel de Administración"
        description="Panel de administración de GATOTAKU"
      />

      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Administración</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Panel de Administración</h1>
            <p className="mt-1 text-sm text-slate-500">
              Inventario, pedidos, usuarios y cupones desde un solo lugar.
            </p>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary shrink-0" aria-label="Cerrar sesión">
            <LogOut size={17} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                ].join(' ')}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {section === 'inventario' && <InventoryManager />}
        {section === 'pedidos' && <OrderManager />}
        {section === 'usuarios' && <UserManager />}
        {section === 'cupones' && <CouponManager />}
      </div>
    </div>
  );
}
