import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="sticky top-0 z-50 border-b bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2 transition-transform group-hover:scale-110">
                  <Plane className="w-5 h-5 text-white" />
                </div>
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
                    className="relative"
                    onClick={() => handleNavigation('/notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
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
                    className="flex items-center gap-2 group"
                  >
                    <Plane className="w-4 h-4" />
                    Check Your Flight
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {location.pathname !== '/login' && (
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation('/login')}
                      className="flex items-center gap-2"
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
                className="relative"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t bg-white"
          >
            <div className="px-4 pt-2 pb-3 space-y-2">
              {!user && (
                <Button
                  variant="gradient"
                  onClick={handleCheckClaim}
                  className="w-full justify-center"
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
                    className="w-full justify-start"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/admin')}
                      className="w-full justify-start"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/dashboard')}
                    className="w-full justify-start"
                  >
                    <User className="w-5 h-5 mr-2" />
                    My Dashboard
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    className="w-full justify-center"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                )
              )}
            </div>
          </motion.div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-white/50 backdrop-blur-xl border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* CTA Section */}
          <div className="mb-12 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to Get Your Flight Compensation?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've received compensation for their disrupted flights. No win, no fee!
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleCheckClaim}
              className="group"
            >
              Start Your Claim Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>No Win, No Fee</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Star className="w-5 h-5 text-amber-500" />
                <span>98% Success Rate</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>€600 Max Compensation</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefundHero
                </span>
              </Link>
              <p className="text-sm text-slate-600 mb-4">
                Making flight compensation simple and hassle-free. Get up to €600 for delays and cancellations with our expert service.
              </p>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <a href="tel:+442012345678" className="hover:text-blue-600">+44 20 1234 5678</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <a href="mailto:support@refundhero.com" className="hover:text-blue-600">support@refundhero.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>123 Flight Street, London</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-blue-600">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-600">Cookie Policy</Link></li>
                <li><Link to="/complaints" className="hover:text-blue-600">Complaints</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/faq" className="hover:text-blue-600">FAQ</Link></li>
                <li><Link to="/help" className="hover:text-blue-600">Help Center</Link></li>
                <li><a href="mailto:support@refundhero.com" className="hover:text-blue-600">Email Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-600">
                © {new Date().getFullYear()} RefundHero. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com/refundhero" className="text-slate-600 hover:text-blue-600">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/refundhero" className="text-slate-600 hover:text-blue-600">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="https://facebook.com/refundhero" className="text-slate-600 hover:text-blue-600">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}