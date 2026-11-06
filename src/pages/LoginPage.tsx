import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function LoginPage() {
  return (
    <div className="login-panel flex min-h-[32rem] items-center justify-center px-4 py-8 sm:px-6">
      <SEO
        title="Login - Gatotaku"
        description="Cuentas de usuario de Gatotaku en construcción."
      />

      <section className="panel w-full max-w-lg p-6 text-center sm:p-8" aria-labelledby="login-title">
        <img
          src="/working.gif"
          alt="Ilustración animada de una página en construcción"
          className="mx-auto aspect-[457/394] w-full max-w-sm rounded-xl border border-slate-200 bg-white object-contain"
        />

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
          Gatotaku
        </p>
        <h1 id="login-title" className="mt-1 text-3xl font-bold text-slate-900">
          Login
        </h1>
        <p className="mt-2 text-base font-medium text-slate-600">
          Cuentas de usuario en construcción
        </p>

        <Link to="/" className="btn-primary mt-6">
          <ArrowLeft size={17} aria-hidden="true" />
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}
