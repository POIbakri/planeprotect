import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/api';
import { sendEmail } from '@/lib/email';
import type { User, AuthError, Provider } from '@supabase/supabase-js';
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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const isDev = process.env.NODE_ENV === 'development';

// Log function that only logs in development
const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
  });

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      devLog('checkAdminStatus: No user, setting isAdmin to false.');
      setState(prev => ({ ...prev, isAdmin: false }));
      return;
    }

    devLog(`checkAdminStatus: Checking admin status for user ID: ${user.id}`);

    // Securely check admin status through database only
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Admin status check error:', error);
        setState(prev => ({ ...prev, isAdmin: false }));
        return;
      }

      const isAdminResult = !!data;
      devLog(`Admin status for user ${user.id}: ${isAdminResult}`);
      setState(prev => ({ ...prev, isAdmin: isAdminResult }));
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
        case 'Password should be at least 6 characters':
          message = 'Password should be at least 6 characters';
          break;
        case 'For security purposes, you can only request this once every 60 seconds':
          message = 'Please wait a moment before requesting another password reset';
          break;
        case 'Email rate limit exceeded':
          message = 'Too many attempts. Please try again later';
          break;
        default:
          // Make generic error messages more user-friendly
          if (authError.message.includes('rate limit')) {
            message = 'Too many attempts. Please try again later';
          } else if (authError.message.includes('timeout')) {
            message = 'Connection timeout. Please check your internet and try again';
          } else {
            message = authError.message;
          }
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
      devLog('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific known errors
        if (error.message?.includes('already registered')) {
          toast.error('An account with this email already exists');
          return;
        }
        
        console.error('Signup error:', error);
        throw error;
      }

      devLog('Signup successful');
      
      // Show success message
      toast.success('Account created! Please check your email to verify your account');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Give user friendly error message
      if (error.message?.includes('Database error') || error.message?.includes('saving new user')) {
        toast.error('Unable to create account. Our team has been notified. Please try again later.');
      } else {
        handleAuthError(error);
      }
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

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset link sent to your email');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
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
        resetPassword,
        updatePassword,
        signInWithProvider,
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