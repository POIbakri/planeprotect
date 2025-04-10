import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, User, LogOut, Settings, Bell, Menu, X, ArrowRight, 
  Shield, Star, CheckCircle2, BanknoteIcon, Mail, Phone, MapPin, ExternalLink 
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Layout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleCheckClaim = () => {
    const checkFlightSection = document.getElementById('check-flight');
    if (checkFlightSection) {
      checkFlightSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#check-flight');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/70 shadow-sm">
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
                <span className="text-xl font-semibold text-[#1D1D1F]">
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
                      Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center gap-1.5 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/#how-it-works')}
                    className="rounded-lg text-gray-600 hover:text-blue-600"
                  >
                    How It Works
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation('/login')}
                    className="rounded-lg text-gray-600 hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={handleCheckClaim}
                    className="flex items-center gap-1.5 group rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Check Eligibility
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg hover:bg-gray-100"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200/70 bg-white/95 backdrop-blur-lg overflow-hidden shadow-md"
            >
              <div className="px-4 py-4 space-y-2">
                {!user && (
                  <Button
                    variant="gradient"
                    onClick={handleCheckClaim}
                    className="w-full justify-center rounded-lg h-11 text-base"
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    Check Your Flight
                  </Button>
                )}
                
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
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/login')}
                    className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3"
                  >
                    <User className="w-5 h-5 mr-3 text-gray-500" />
                    Sign In
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/#how-it-works')}
                  className="w-full justify-start rounded-lg text-base text-[#333] hover:bg-gray-100 h-11 px-3 border-t border-gray-100 pt-3 mt-2"
                >
                  <CheckCircle2 className="w-5 h-5 mr-3 text-gray-500" />
                  How It Works
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </main>

      <footer className="bg-white/60 backdrop-blur-lg border-t border-gray-200/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
            
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-700 tracking-wider uppercase">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/" className="hover:text-blue-600 transition-colors duration-200">Home</Link></li>
                <li><a href="/#how-it-works" onClick={(e) => { e.preventDefault(); handleCheckClaim(); }} className="hover:text-blue-600 transition-colors duration-200">Check Eligibility</a></li>
                <li><Link to="/faq" className="hover:text-blue-600 transition-colors duration-200">FAQ</Link></li>
                <li><Link to="/about" className="hover:text-blue-600 transition-colors duration-200">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4 text-gray-700 tracking-wider uppercase">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
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

          <div className="mt-10 pt-6 border-t border-gray-200/60 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} PlaneProtect Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}