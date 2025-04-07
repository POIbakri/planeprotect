import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/api';
import { sendEmail } from '@/lib/email';
import type { User, AuthError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setState(prev => ({ ...prev, isAdmin: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setState(prev => ({ ...prev, isAdmin: !!data }));
    } catch (error) {
      console.error('Error checking admin status:', error);
      setState(prev => ({ ...prev, isAdmin: false }));
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        setState(prev => ({ ...prev, user: session.user }));
        await checkAdminStatus(session.user);
      } else {
        setState(prev => ({ ...prev, user: null, isAdmin: false }));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setState(prev => ({ ...prev, user: null, isAdmin: false }));
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession().finally(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null }));
      await checkAdminStatus(session?.user ?? null);
    });

    // Periodic admin status check
    const adminCheckInterval = setInterval(() => {
      if (state.user) {
        checkAdminStatus(state.user);
      }
    }, ADMIN_CHECK_INTERVAL);

    // Session refresh interval
    const sessionRefreshInterval = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(adminCheckInterval);
      clearInterval(sessionRefreshInterval);
    };
  }, []);

  const handleAuthError = (error: unknown) => {
    const authError = error as AuthError;
    let message = 'An unexpected error occurred';

    if (authError.message) {
      switch (authError.message) {
        case 'Invalid login credentials':
          message = 'Invalid email or password';
          break;
        case 'Email not confirmed':
          message = 'Please confirm your email address';
          break;
        case 'Email already registered':
          message = 'An account with this email already exists';
          break;
        default:
          message = authError.message;
      }
    }

    toast.error(message);
    throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Send welcome email
      if (data?.user) {
        await sendEmail({
          to: email,
          name: email.split('@')[0], // Use email username as name
          template: 'welcome',
        });
      }

      toast.success('Account created successfully!');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState(prev => ({ ...prev, user: null, isAdmin: false }));
      toast.success('Signed out successfully');
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshSession,
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