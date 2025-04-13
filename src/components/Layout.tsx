import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, User, LogOut, Settings, Bell, Menu, X, 
  Shield, CheckCircle2, Mail, Phone, MapPin
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with enhanced mobile responsiveness */}
      <nav className={`sticky top-0 z-50 ${scrollPosition > 10 ? 'bg-white/95' : 'bg-white/90'} backdrop-blur-lg border-b border-gray-200/70 shadow-sm transition-all duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg p-1.5 shadow-sm transition-all duration-300"
                >
                  <Plane className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-lg sm:text-xl font-semibold text-[#1D1D1F]">
                  PlaneProtect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-lg hover:bg-gray-100"
                    onClick={() => handleNavigation('/notifications')}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-[#333]" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center gap-1.5 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center gap-1.5 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleNavigateToHowItWorks}
                    className="rounded-lg text-gray-600 hover:text-blue-600"
                  >
                    How It Works
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleNavigation('/login')}
                    className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="rounded-lg hover:bg-gray-100"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                data-mobile-menu="trigger"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#333]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#333]" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation with improved accessibility and transitions */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200/70 bg-white/95 backdrop-blur-lg overflow-hidden shadow-md"
              data-mobile-menu="content"
            >
              <div className="px-4 py-4 space-y-2">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/dashboard')}
                      className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3"
                    >
                      <User className="w-5 h-5 mr-3 text-gray-500" />
                      My Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/notifications')}
                      className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3"
                    >
                      <Bell className="w-5 h-5 mr-3 text-gray-500" />
                      Notifications
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation('/admin')}
                        className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3"
                      >
                        <Settings className="w-5 h-5 mr-3 text-gray-500" />
                        Admin Dashboard
                      </Button>
                    )}
                     <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start rounded-lg text-base text-red-600 hover:bg-red-50 h-11 px-3 mt-2 border-t border-gray-100 pt-3"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="gradient"
                      onClick={() => handleNavigation('/login')}
                      className="w-full justify-center rounded-lg text-base h-11"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleNavigateToHowItWorks}
                      className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3 mt-2"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-3 text-gray-500" />
                      How It Works
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </main>

      {/* Responsive footer */}
      <footer className="bg-white/60 backdrop-blur-lg border-t border-gray-200/60 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg p-1.5 shadow-sm">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-[#1D1D1F]">PlaneProtect</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Helping passengers claim rightful compensation for flight disruptions across the UK & EU.
              </p>
            </div>
            
            <div className="mt-2 sm:mt-0">
              <h3 className="text-sm font-semibold mb-4 text-gray-700 tracking-wider uppercase">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/" className="hover:text-blue-600 transition-colors duration-200">Home</Link></li>
                <li><a href="/#how-it-works" onClick={(e) => { e.preventDefault(); handleNavigateToHowItWorks(); }} className="hover:text-blue-600 transition-colors duration-200">How It Works</a></li>
                <li><Link to="/about" className="hover:text-blue-600 transition-colors duration-200">About Us</Link></li>
              </ul>
            </div>
            
            <div className="mt-2 sm:mt-0">
              <h3 className="text-sm font-semibold mb-4 text-gray-700 tracking-wider uppercase">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div className="mt-2 sm:mt-0">
              <h3 className="text-sm font-semibold mb-4 text-gray-700 tracking-wider uppercase">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <a href="mailto:support@planeprotect.com" className="hover:text-blue-600">support@planeprotect.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <a href="tel:+447123456789" className="hover:text-blue-600">+44 (0) 7123 456789</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>London, UK</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-200/60 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} PlaneProtect Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}