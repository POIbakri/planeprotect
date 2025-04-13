import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isAdmin, user } = useAuth();

  // Password strength calculation
  const getPasswordStrength = (password: string): { strength: number; message: string } => {
    if (!password) return { strength: 0, message: 'No password' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const messages = [
      'Too weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
      'Very strong'
    ];
    
    return { strength, message: messages[strength] };
  };

  const passwordStrength = getPasswordStrength(password);

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

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = regex.test(email);
    setEmailError(isValid ? '' : 'Please enter a valid email address');
    return isValid;
  };

  // Validate password
  const validatePassword = (password: string): boolean => {
    if (!isSignUp) return true; // Don't validate password on login
    
    const isValid = password.length >= 8;
    setPasswordError(isValid ? '' : 'Password must be at least 8 characters');
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    if (isSignUp && !acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

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

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setAcceptTerms(false);
    setEmailError('');
    setPasswordError('');
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                className={`pl-12 h-12 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                onBlur={() => validateEmail(email)}
                placeholder="your.email@example.com"
              />
              {emailError && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {emailError}
                </div>
              )}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                className={`pl-12 pr-12 h-12 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                onBlur={() => validatePassword(password)}
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {passwordError && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {passwordError}
                </div>
              )}
            </div>
            
            {isSignUp && password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength <= 1 ? 'text-red-500' : 
                    passwordStrength.strength <= 3 ? 'text-amber-500' : 'text-green-500'
                  }`}>{passwordStrength.message}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength.strength <= 1 ? 'bg-red-500' : 
                      passwordStrength.strength <= 3 ? 'bg-amber-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {!isSignUp && (
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>

          {isSignUp && (
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-slate-600">
                  I accept the <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-12"
            disabled={loading || (isSignUp && !acceptTerms)}
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
            onClick={toggleForm}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}