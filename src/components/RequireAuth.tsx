import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { session, loading, isAdmin, isAdminLoading } = useAuth();

  if (loading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // El panel es solo para administradores de la tienda
  if (!isAdmin) {
    return (
      <div className="login-panel flex min-h-[32rem] items-center justify-center px-4 py-8 sm:px-6">
        <div className="panel w-full max-w-md p-6 text-center sm:p-8">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Gatotaku</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-slate-500">
            Esta sección es solo para administradores de la tienda.
          </p>
          <Link to="/cuenta" className="btn-primary mt-6">
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
