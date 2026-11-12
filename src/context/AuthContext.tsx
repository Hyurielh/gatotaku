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
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

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

  const login = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      clearError();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      
      setSession(data.session);
      setUser(data.user);
      await loadProfile(data.user?.id);
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