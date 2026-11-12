import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticating: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  suspensionNotice: string | null;
  clearSuspensionNotice: () => void;
  error: string | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAuthenticating: false,
  isAdmin: false,
  isAdminLoading: true,
  suspensionNotice: null,
  clearSuspensionNotice: () => {},
  error: null,
  logout: async () => {},
  login: async () => {},
  refreshProfile: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [suspensionNotice, setSuspensionNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuspensionNotice = () => setSuspensionNotice(null);

  const readFunctionError = async (error: unknown): Promise<string | null> => {
    const context = (error as { context?: unknown })?.context;
    if (typeof Response !== 'undefined' && context instanceof Response) {
      try {
        const payload = await context.json();
        if (payload && typeof payload.error === 'string') return payload.error;
      } catch {
        // sin cuerpo JSON
      }
    }
    return null;
  };

  /** Perfil en `public.users` (avatar, nombre, usuario, permisos de administrador). */
  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    setIsAdminLoading(true);

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const userProfile = (data ?? null) as UserProfile | null;
      setProfile(userProfile);
      setIsAdmin(Boolean(userProfile?.is_admin));
    } catch {
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setIsAdminLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user?.id);
  }, [loadProfile, session?.user?.id]);

  const login = async (identifier: string, password: string) => {
    try {
      setIsAuthenticating(true);
      clearError();

      const value = identifier.trim();

      if (value.includes('@')) {
        // Correo: flujo normal de Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: value.toLowerCase(),
          password,
        });

        if (signInError) throw signInError;

        setSession(data.session);
        setUser(data.user);
        await loadProfile(data.user?.id);
      } else {
        // WhatsApp: el backend resuelve la cuenta y crea la sesión
        const { data, error: functionError } = await supabase.functions.invoke<{
          access_token: string;
          refresh_token: string;
        }>('account-login', { body: { identifier: value, password } });

        if (functionError) {
          const message = await readFunctionError(functionError);
          throw new Error(message || 'No se pudo iniciar sesión');
        }

        if (!data?.access_token || !data?.refresh_token) {
          throw new Error('No se pudo iniciar sesión');
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError) throw sessionError;

        setSession(sessionData.session);
        setUser(sessionData.user);
        await loadProfile(sessionData.user?.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      clearError();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsAdminLoading(false);
      setSuspensionNotice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
      throw err;
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        await loadProfile(session?.user?.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      void loadProfile(session?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Si la cuenta es suspendida mientras hay sesión, se cierra sesión al instante
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    let cancelled = false;

    const checkSuspension = async () => {
      const { data } = await supabase
        .from('users')
        .select('is_suspended, suspension_message')
        .eq('id', userId)
        .maybeSingle();

      if (cancelled || !data?.is_suspended) return;

      setSuspensionNotice(data.suspension_message || 'Tu cuenta ha sido suspendida.');
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    };

    const interval = window.setInterval(() => void checkSuspension(), 45000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkSuspension();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    void checkSuspension();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [session?.user?.id]);

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user,
        profile,
        loading, 
        isAuthenticating,
        isAdmin,
        isAdminLoading,
        suspensionNotice,
        clearSuspensionNotice,
        error,
        logout,
        login,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}