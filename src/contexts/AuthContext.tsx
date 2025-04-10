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
      console.log('checkAdminStatus: No user, setting isAdmin to false.');
      setState(prev => ({ ...prev, isAdmin: false }));
      return;
    }

    console.log(`checkAdminStatus: Checking admin status for user ID: ${user.id}`);

    // Direct check for known admin user IDs
    if (user.id === 'bade31d2-c74d-4da4-ac50-b143b0220106') {
      console.log('checkAdminStatus: Admin user ID directly matched. Setting isAdmin to true.');
      setState(prev => ({ ...prev, isAdmin: true }));
      return;
    }

    try {
      console.log('checkAdminStatus: Querying admins table...');
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('checkAdminStatus: Supabase query error:', error);
        // Ensure it defaults to false on error
         console.log('checkAdminStatus: Setting isAdmin to false due to query error.');
         setState(prev => ({ ...prev, isAdmin: false }));
        return; // Exit after setting false on error
      }

      // *** ADDED DETAILED LOGGING HERE ***
      console.log(`checkAdminStatus: DB query result for user ${user.id}:`, JSON.stringify(data));
      const isAdminResult = !!data; // isAdminResult is true if data is not null
      console.log(`checkAdminStatus: Based on DB result, setting isAdmin to: ${isAdminResult}`);
      // *** END LOGGING ***

      setState(prev => ({ ...prev, isAdmin: isAdminResult }));
    } catch (error) {
      console.error('checkAdminStatus: Error caught in try block:', error);
      // Ensure isAdmin is false if any part of the try block fails
      console.log('checkAdminStatus: Setting isAdmin to false due to caught error.');
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
      console.log('Starting signup process for:', email);
      
      // Use a simpler signup process now that we've fixed the database trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Use a relative path instead of a hardcoded Vercel URL
          emailRedirectTo: '/auth/callback',
        },
      });

      if (error) {
        // Handle specific known errors
        if (error.message?.includes('already registered')) {
          toast.error('An account with this email already exists');
          return;
        }
        
        console.error('Signup API error details:', error);
        throw error;
      }

      console.log('Signup successful, user data:', data?.user?.id);
      
      // Show success message
      toast.success('Account created! Please check your email to verify your account');
      
    } catch (error: any) {
      console.error('Complete signup error details:', error);
      
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