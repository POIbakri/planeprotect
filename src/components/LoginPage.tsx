import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isAdmin, user } = useAuth();

  // Effect for redirection after successful login
  useEffect(() => {
    if (loginSuccess && user) {
      let claimDetails = null;
      const pendingClaimData = sessionStorage.getItem('pendingClaimDetails');
      if (pendingClaimData) {
        try {
          claimDetails = JSON.parse(pendingClaimData);
          console.log('Found pending claim details in sessionStorage:', claimDetails);
          sessionStorage.removeItem('pendingClaimDetails');
        } catch (error) {
          console.error('Failed to parse pending claim details:', error);
        }
      }

      const state = location.state as { from?: string };
      // Redirect admin users to admin dashboard
      const redirectTo = isAdmin ? '/admin' : (state?.from || '/dashboard');
      
      console.log(`Redirecting to ${redirectTo} with claim details:`, claimDetails);
      navigate(redirectTo, { state: claimDetails });
      setLoginSuccess(false);
    }
  }, [loginSuccess, user, isAdmin, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created! Check your email to verify.');
        navigate('/'); 
      } else {
        await signIn(email, password);
        setLoginSuccess(true);
      }
    } catch (error) {
      console.error('Authentication error in form handler:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-8 sm:mt-20 px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg">
            <Plane className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-12"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </motion.div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}