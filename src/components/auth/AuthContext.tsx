'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Client-side supabase client with explicit storage configuration
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          console.log('🔍 Supabase getting from localStorage:', key)
          const value = window.localStorage.getItem(key)
          console.log('🔍 Retrieved value:', value ? 'present' : 'null')
          return value
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          console.log('💾 Supabase setting localStorage:', key, value ? 'present' : 'null')
          window.localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          console.log('🗑️ Supabase removing from localStorage:', key)
          window.localStorage.removeItem(key)
        }
      }
    }
  }
)

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Loading initial session...')
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 AuthContext: Initial session loaded:', { hasSession: !!session, userId: session?.user?.id })
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 AuthContext: Auth state changed:', _event, { hasSession: !!session, userId: session?.user?.id })
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('🔐 Sign in result:', { hasUser: !!data.user, hasSession: !!data.session, error: error?.message })

    if (data.session) {
      console.log('🔐 Session created:', {
        access_token: data.session.access_token ? 'present' : 'missing',
        refresh_token: data.session.refresh_token ? 'present' : 'missing',
        expires_at: data.session.expires_at
      })
    }

    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
