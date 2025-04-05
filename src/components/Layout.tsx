import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, User, LogOut, Settings, Bell, Menu, X, ArrowRight, 
  Shield, Star, CheckCircle2, BanknoteIcon, Mail, Phone, MapPin 
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Layout() {
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
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2 shadow-sm transition-all duration-300"
                >
                  <Plane className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefundHero
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="relative rounded-full hover:bg-slate-100"
                    onClick={() => handleNavigation('/notifications')}
                  >
                    <Bell className="w-5 h-5 text-[#1D1D1F]" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center gap-2 rounded-full border border-slate-200 text-[#1D1D1F] hover:bg-slate-100 transition-colors duration-300"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center gap-2 rounded-full border border-slate-200 text-[#1D1D1F] hover:bg-slate-100 transition-colors duration-300"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-full border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="gradient"
                    onClick={handleCheckClaim}
                    className="flex items-center gap-2 group rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Plane className="w-4 h-4" />
                    Check Your Flight
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  {location.pathname !== '/login' && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/login')}
                      className="flex items-center gap-2 rounded-full border border-slate-200 text-[#1D1D1F] hover:bg-slate-100 transition-colors duration-300"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full hover:bg-slate-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#1D1D1F]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#1D1D1F]" />
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/30 bg-white/90 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-3">
                {!user && (
                  <Button
                    variant="gradient"
                    onClick={handleCheckClaim}
                    className="w-full justify-center rounded-full shadow-sm"
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    Check Your Flight
                  </Button>
                )}
                
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/notifications')}
                      className="w-full justify-start rounded-full text-[#1D1D1F] hover:bg-slate-100"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </Button>
                    
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation('/admin')}
                        className="w-full justify-start rounded-full text-[#1D1D1F] hover:bg-slate-100"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/dashboard')}
                      className="w-full justify-start rounded-full text-[#1D1D1F] hover:bg-slate-100"
                    >
                      <User className="w-5 h-5 mr-2" />
                      My Dashboard
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start rounded-full text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  location.pathname !== '/login' && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/login')}
                      className="w-full justify-center rounded-full"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Sign In
                    </Button>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-white/70 backdrop-blur-2xl border-t border-white/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* CTA Section */}
          <div className="mb-12 text-center">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-[#1D1D1F] mb-4"
            >
              Ready to Get Your Flight Compensation?
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#6e6e73] mb-6 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers who've received compensation for their disrupted flights. No win, no fee!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={handleCheckClaim}
                className="group rounded-full px-8 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                Start Your Claim Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 mt-6"
            >
              <div className="flex items-center gap-2 text-[#6e6e73]">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>No Win, No Fee</span>
              </div>
              <div className="flex items-center gap-2 text-[#6e6e73]">
                <Star className="w-5 h-5 text-amber-500" />
                <span>98% Success Rate</span>
              </div>
              <div className="flex items-center gap-2 text-[#6e6e73]">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>€600 Max Compensation</span>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-200">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 group mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefundHero
                </span>
              </Link>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-[#6e6e73]">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href="mailto:support@refundhero.com" className="hover:text-blue-600">support@refundhero.com</a>
                </div>
                <div className="flex items-center gap-2 text-[#6e6e73]">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href="tel:+447123456789" className="hover:text-blue-600">+44 (0) 7123 456789</a>
                </div>
                <div className="flex items-start gap-2 text-[#6e6e73]">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <span>123 Flight Street<br />London, UK<br />SW1 1AA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-[#1D1D1F]">Company</h3>
              <ul className="space-y-3 text-sm text-[#6e6e73]">
                <li><Link to="/about" className="hover:text-blue-600 transition-colors duration-200">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors duration-200">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-blue-600 transition-colors duration-200">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-[#1D1D1F]">Legal</h3>
              <ul className="space-y-3 text-sm text-[#6e6e73]">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-600 transition-colors duration-200">Cookie Policy</Link></li>
                <li><Link to="/complaints" className="hover:text-blue-600 transition-colors duration-200">Complaints</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-[#1D1D1F]">Support</h3>
              <ul className="space-y-3 text-sm text-[#6e6e73]">
                <li><Link to="/faq" className="hover:text-blue-600 transition-colors duration-200">FAQ</Link></li>
                <li><Link to="/help" className="hover:text-blue-600 transition-colors duration-200">Help Center</Link></li>
                <li><a href="mailto:support@refundhero.com" className="hover:text-blue-600 transition-colors duration-200">Email Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[#6e6e73] mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} RefundHero. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" aria-label="Facebook" className="text-[#6e6e73] hover:text-blue-600 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-[#6e6e73] hover:text-blue-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-[#6e6e73] hover:text-blue-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 8.32h3.058v9.794H5.23V8.32zM6.76 7.159a1.775 1.775 0 110-3.55 1.775 1.775 0 010 3.55zm12.072 10.953V13.98c0-2.608-.562-4.614-3.607-4.614-1.464 0-2.447.802-2.849 1.564h-.041v-1.322H9.57v9.794h2.904v-4.85c0-1.22.23-2.4 1.742-2.4 1.49 0 1.512 1.392 1.512 2.479v4.783h3.101l.002-.208z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-[#6e6e73] hover:text-pink-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}