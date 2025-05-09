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
      {/* Header - Apple-inspired design */}
      <header className={`sticky top-0 z-50 ${scrollPosition > 10 ? 'bg-white/90' : 'bg-white/80'} backdrop-blur-md transition-all duration-300`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-medium text-[#1D1D1F]">
                  PlaneProtect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">
                Home
              </Link>
              <button 
                onClick={handleNavigateToHowItWorks}
                className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={handleNavigateToContact}
                className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors"
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
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
                    className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm font-medium text-[#1D1D1F] hover:bg-[#EBEBEB] transition-colors"
                  >
                    Dashboard
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                data-mobile-menu="trigger"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#1D1D1F]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#1D1D1F]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white overflow-hidden"
              data-mobile-menu="content"
            >
              <div className="px-6 py-4 space-y-4">
                <Link 
                  to="/"
                  className="block py-2 text-base text-[#1D1D1F]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                <button
                  onClick={handleNavigateToHowItWorks}
                  className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                >
                  How It Works
                </button>
                
                <button
                  onClick={handleNavigateToContact}
                  className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                >
                  Contact Us
                </button>
                
                {user ? (
                  <>
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                    >
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/notifications')}
                      className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                    >
                      Notifications
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={() => handleNavigation('/admin')}
                        className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                      >
                        Admin
                      </button>
                    )}
                    
                    <hr className="my-2 border-gray-100" />
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left py-2 text-base text-[#1D1D1F]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full py-2 rounded-full bg-blue-500 text-white font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
}
        </AnimatePresence>
      </header>

      <main className="flex-grow w-full mx-auto">
        {children || <Outlet />}
      </main>

      {/* Footer - Apple-inspired design */}
      <footer className="bg-white py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-full bg-blue-500">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium text-[#1D1D1F]">PlaneProtect</span>
              </div>
              <p className="text-sm text-[#6e6e73] leading-relaxed">
                Helping passengers claim rightful compensation for flight disruptions across the UK & EU.
              </p>
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
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-[#86868b] mb-4 uppercase tracking-wide">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#86868b]" />
                  <a href="mailto:support@planeprotect.co.uk" className="text-sm text-[#1D1D1F] hover:text-blue-500 transition-colors">support@planeprotect.co.uk</a>
                </li>
            
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#86868b]" />
                  <span className="text-sm text-[#1D1D1F]">London, UK</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-xs text-[#86868b] text-center">
              &copy; {new Date().getFullYear()} PlaneProtect Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}