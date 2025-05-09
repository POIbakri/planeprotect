import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, User, LogOut, Settings, Bell, Menu, X, 
  Shield, CheckCircle2, Mail, Phone, MapPin, MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export function Layout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToHowItWorks = () => {
    // If we're already on the landing page, scroll to the section
    if (location.pathname === '/') {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Otherwise navigate to the landing page with the section hash
      navigate('/#how-it-works');
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigateToContact = () => {
    // If we're already on the landing page, scroll to the section
    if (location.pathname === '/') {
      const contactSection = document.getElementById('contact-us');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Otherwise navigate to the landing page with the section hash
      navigate('/#contact-us');
    }
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside or on specific sections
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Enhanced Header with backdrop blur and gradient effects */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`sticky top-0 z-50 ${
          scrollPosition > 10 
            ? 'bg-white/90 shadow-sm border-b border-gray-100/50' 
            : 'bg-white/80'
        } backdrop-blur-md transition-all duration-300`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                {/* Enhanced logo with gradient */}
                <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 group-hover:shadow-md transition-all duration-300">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-medium text-[#1D1D1F]">
                  PlaneProtect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Enhanced with transitions and hover effects */}
            <div className="hidden md:flex items-center gap-5">
              <Link 
                to="/" 
                className={`text-sm ${location.pathname === '/' ? 'text-blue-600 font-medium' : 'text-[#1D1D1F]'} hover:text-blue-500 transition-colors relative py-1 px-1`}
              >
                Home
                {location.pathname === '/' && (
                  <motion.div 
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                )}
              </Link>
              
              <button 
                onClick={handleNavigateToHowItWorks}
                className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors py-1 px-1"
              >
                How It Works
              </button>
              
              <button 
                onClick={handleNavigateToContact}
                className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors py-1 px-1"
              >
                Contact Us
              </button>
              
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigation('/notifications')}
                    className="relative p-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-[#1D1D1F]" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center gap-1.5 text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:shadow-md transition-all duration-300"
                  >
                    Dashboard
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-md transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced with animations */}
            <div className="flex items-center md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 rounded-full hover:bg-[#F5F5F7] transition-colors relative overflow-hidden"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                data-mobile-menu="trigger"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-[#1D1D1F]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-[#1D1D1F]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation with improved animations */}
        <AnimatePresence>
          {isMobileMenuOpen &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-gradient-to-b from-white to-[#FAFAFA] overflow-hidden shadow-lg border-t border-gray-100"
              data-mobile-menu="content"
            >
              <div className="px-6 py-4 space-y-4">
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link 
                    to="/"
                    className="block py-2 text-base text-[#1D1D1F] font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>
                
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <button
                    onClick={handleNavigateToHowItWorks}
                    className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                  >
                    How It Works
                  </button>
                </motion.div>
                
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <button
                    onClick={handleNavigateToContact}
                    className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                  >
                    Contact Us
                  </button>
                </motion.div>
                
                {user ? (
                  <>
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="block w-full text-left py-2 text-base text-[#1D1D1F] font-medium"
                      >
                        Dashboard
                      </button>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <button
                        onClick={() => handleNavigation('/notifications')}
                        className="block w-full text-left py-2 text-base text-[#1D1D1F] flex items-center"
                      >
                        Notifications
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      </button>
                    </motion.div>
                    
                    {isAdmin && (
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={() => handleNavigation('/admin')}
                          className="block w-full text-left py-2 text-base text-[#1D1D1F] flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Admin
                        </button>
                      </motion.div>
                    )}
                    
                    <hr className="my-3 border-gray-200" />
                    
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left py-2 text-base text-[#1D1D1F] flex items-center text-red-500"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pt-2"
                  >
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md"
                    >
                      Sign In
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </motion.header>

      <main className="flex-grow w-full mx-auto">
        {children || <Outlet />}
      </main>

      {/* Enhanced Footer with gradient accents and improved styling */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100 relative overflow-hidden">
        {/* Decorative elements similar to those in LandingPage */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-50 opacity-50 blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-50 opacity-50 blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium text-[#1D1D1F]">PlaneProtect</span>
              </div>
              <p className="text-sm text-[#6e6e73] leading-relaxed">
                Helping passengers claim rightful compensation for flight disruptions across the UK & EU.
              </p>
              
              {/* Added trust indicators */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-[#1D1D1F]">Trusted</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
                  <Shield className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-[#1D1D1F]">Secure</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-[#86868b] mb-4 uppercase tracking-wide">Company</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Home</Link></li>
                <li><button onClick={handleNavigateToHowItWorks} className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">How It Works</button></li>
                <li><Link to="/about" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">About Us</Link></li>
                <li><button onClick={handleNavigateToContact} className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Contact Us</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-[#86868b] mb-4 uppercase tracking-wide">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/compensation" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Compensation Rights</Link></li>
                <li><Link to="/faq" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-[#86868b] mb-4 uppercase tracking-wide">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 group">
                  <div className="bg-blue-50 rounded-full p-1.5 group-hover:bg-blue-100 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <a href="mailto:support@planeprotect.co.uk" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">support@planeprotect.co.uk</a>
                </li>
                
                <li className="flex items-center gap-2 group">
                  <div className="bg-purple-50 rounded-full p-1.5 group-hover:bg-purple-100 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <span className="text-sm text-[#1D1D1F]">London, UK</span>
                </li>
                
                <li className="flex items-center gap-2 group">
                  <div className="bg-teal-50 rounded-full p-1.5 group-hover:bg-teal-100 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <button onClick={handleNavigateToContact} className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">Send us a message</button>
                </li>
              </ul>
              
              {/* Social icons with enhanced style */}
              <div className="mt-6">
                <h4 className="text-xs font-medium text-[#86868b] mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-[#86868b] text-center md:text-left">
                &copy; {new Date().getFullYear()} PlaneProtect Ltd. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-xs text-[#86868b] hover:text-blue-500 transition-colors">Cookies</a>
                <a href="#" className="text-xs text-[#86868b] hover:text-blue-500 transition-colors">Accessibility</a>
                <a href="#" className="text-xs text-[#86868b] hover:text-blue-500 transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}