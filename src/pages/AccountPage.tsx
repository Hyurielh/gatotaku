import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, LogOut, LogIn, UserPlus, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import {
  profileDisplayName,
  profileInitials,
  profileRealEmail,
  saveProfile,
  uploadAvatar,
} from '../lib/profile';
import { fetchAccountStatus } from '../lib/adminUsers';
import {
  formatWhatsapp,
  isWhatsappAccountEmail,
  resolveAuthIdentifier,
} from '../lib/authIdentifier';
import type { Anime } from '../types/database';

export default function AccountPage() {
  const { session, user, profile, loading, login, logout, refreshProfile, suspensionNotice, clearSuspensionNotice } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [favoriteAnime, setFavoriteAnime] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isWhatsappAccount = isWhatsappAccountEmail(profile?.email);

  useEffect(() => {
    if (!profile) return;

    setDisplayName(profile.display_name ?? '');
    setFavoriteAnime(profile.favorite_anime ?? '');
    setWhatsapp(profile.whatsapp ?? '');
    setEmail(profileRealEmail(profile));
    setAvatarUrl(profile.avatar_url ?? '');
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data } = await supabase.from('anime').select('*').order('name');
      if (!cancelled) setAnimes((data ?? []) as Anime[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    clearSuspensionNotice();
    setIsSubmitting(true);

    let authEmail = '';

    try {
      // Acepta correo o WhatsApp (el WhatsApp usa un correo sintético interno)
      const resolved = resolveAuthIdentifier(identifier);
      authEmail = resolved.email;

      if (mode === 'login') {
        await login(identifier, password);
        toast.success('Sesión iniciada');
      } else {
        const { error } = await supabase.auth.signUp({
          email: resolved.email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp: resolved.whatsapp ?? '',
            },
          },
        });
        if (error) throw error;
        toast.success('¡Cuenta creada! Ya podés ver tus cupones');
      }
    } catch (err) {
      const authMessage = err instanceof Error ? err.message : 'No se pudo completar la operación';

      // Cuenta suspendida: mostrar el motivo que dejó el administrador
      if (authEmail) {
        const status = await fetchAccountStatus(identifier);
        if (status.suspended) {
          setAuthError(`Tu cuenta está suspendida: ${status.message}`);
          return;
        }
      }

      setAuthError(authMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setIsUploadingAvatar(true);

    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      toast.success('Foto subida, guarda los cambios');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la foto');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() && !whatsapp.trim()) {
      toast.error('Deja al menos un correo o un WhatsApp para poder entrar');
      return;
    }

    setIsSaving(true);

    try {
      await saveProfile({
        display_name: displayName,
        favorite_anime: favoriteAnime,
        whatsapp,
        email,
        avatar_url: avatarUrl,
      });

      await refreshProfile();
      toast.success('Perfil guardado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Cargando...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <SEO
        title="Mi cuenta - Gatotaku"
        description="Actualiza tu foto, nombre y datos de contacto en Gatotaku."
      />

      {!session ? (
        <section className="panel p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Gatotaku</p>
          <h1 className="section-title mt-1">Mi cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inicia sesión o crea tu cuenta con tu WhatsApp o correo.
          </p>

          {suspensionNotice && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              Tu cuenta está suspendida: {suspensionNotice}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
            >
              <LogIn size={16} aria-hidden="true" />
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={mode === 'register' ? 'btn-primary' : 'btn-secondary'}
            >
              <UserPlus size={16} aria-hidden="true" />
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmitAuth} className="mt-5 space-y-3">
            {mode === 'register' && (
              <div>
                <label className="field-label" htmlFor="account-name">Nombre</label>
                <input
                  id="account-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="field"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="account-email">WhatsApp o correo</label>
              <input
                id="account-email"
                type="text"
                inputMode="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="field"
                placeholder="+505 8888 8888, 8888 8888 o correo@ejemplo.com"
                required
                autoComplete="username"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Usamos tu WhatsApp o correo para identificarte como cliente. El número puede ir con
                o sin +505 (ej. 8812 3456).
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="account-password">Contraseña</label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {authError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {authError}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Tu foto de perfil"
                    className="h-20 w-20 rounded-full border-2 border-teal-200 bg-white object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
                    {profileInitials(profile)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow transition hover:bg-teal-700 disabled:opacity-60"
                  aria-label="Cambiar foto de perfil"
                  title="Cambiar foto de perfil"
                >
                  {isUploadingAvatar ? (
                    <Loader className="animate-spin" size={15} aria-hidden="true" />
                  ) : (
                    <Camera size={15} aria-hidden="true" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Mi cuenta</p>
                <h1 className="mt-1 truncate text-xl font-bold text-slate-900">
                  {profileDisplayName(profile) || 'Tu perfil'}
                </h1>
                <p className="truncate text-sm text-slate-500">
                  {isWhatsappAccount
                    ? formatWhatsapp(profile?.whatsapp)
                    : (profile?.email ?? user?.email)}
                </p>
              </div>

              <button type="button" onClick={() => void logout()} className="btn-secondary shrink-0">
                <LogOut size={16} aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
          </section>

          <form onSubmit={handleSaveProfile} className="panel space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Editar perfil</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="profile-display-name">Nombre para mostrar</label>
                <input
                  id="profile-display-name"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="field"
                  placeholder="Cómo te llamamos"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="field-label" htmlFor="profile-email">Correo electrónico</label>
                  {email.trim() && whatsapp.trim() && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                    >
                      Quitar correo
                    </button>
                  )}
                </div>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="field"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Puedes entrar con tu correo.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="field-label" htmlFor="profile-whatsapp">WhatsApp</label>
                  {whatsapp.trim() && email.trim() && (
                    <button
                      type="button"
                      onClick={() => setWhatsapp('')}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                    >
                      Quitar WhatsApp
                    </button>
                  )}
                </div>
                <input
                  id="profile-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className="field"
                  placeholder="8812 3456 o +505 8812 3456"
                  autoComplete="tel"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Puedes entrar con tu WhatsApp. Deja al menos uno de los dos.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="profile-anime">Anime favorito (opcional)</label>
                <input
                  id="profile-anime"
                  type="text"
                  value={favoriteAnime}
                  onChange={(event) => setFavoriteAnime(event.target.value)}
                  className="field"
                  placeholder="Death Note"
                  list="anime-suggestions"
                />
                <datalist id="anime-suggestions">
                  {animes.map((anime) => (
                    <option key={anime.id} value={anime.name} />
                  ))}
                </datalist>
                <p className="mt-1 text-[11px] text-slate-400">
                  Escribe el que quieras; se guarda con mayúscula inicial.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Tus cupones están en{' '}
                <Link to="/mis-cupones" className="font-semibold text-teal-700 hover:underline">
                  Mis Cupones
                </Link>
                .
              </p>
              <button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
