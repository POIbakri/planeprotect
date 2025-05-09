import { useState, useEffect } from 'react';
import { X, Info, Settings, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

const CONSENT_KEY = 'planeprotect_cookie_consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Check if user has already provided consent
  useEffect(() => {
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      setShowBanner(true);
    } else {
      // Parse saved preferences
      try {
        const savedPrefs = JSON.parse(hasConsent);
        setPreferences(savedPrefs);
      } catch (e) {
        // If parsing fails, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const acceptSelected = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowSettings(false);
    
    // Apply preferences to actual services
    if (prefs.analytics) {
      enableAnalytics();
    }
    
    if (prefs.marketing) {
      enableMarketingCookies();
    }

    if (prefs.preferences) {
      enablePreferenceCookies();
    }
  };

  const enableAnalytics = () => {
    // Placeholder for analytics initialization
    // For example, initialize Google Analytics, Vercel Analytics, etc.
    window.dispatchEvent(new CustomEvent('enable-analytics'));
  };

  const enableMarketingCookies = () => {
    // Placeholder for marketing cookies initialization
    window.dispatchEvent(new CustomEvent('enable-marketing'));
  };

  const enablePreferenceCookies = () => {
    // Placeholder for preference cookies initialization
    window.dispatchEvent(new CustomEvent('enable-preferences'));
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {!showSettings ? (
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-medium text-[#1D1D1F]">Privacy Preferences</h3>
                  </div>
                  <button 
                    onClick={() => setShowBanner(false)} 
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-sm text-[#86868b] mb-6">
                  <p className="mb-2">
                    This website uses cookies and similar technologies to provide services, understand how you use our site, improve your experience, personalize advertising, and ensure the website functions properly.
                  </p>
                  <p>
                    <strong>Important:</strong> We collect detailed information about your flight disruptions, including personal data, to process compensation claims. 
                    By clicking "Accept All", you consent to our complete use of cookies and data processing activities. 
                    See our <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a> for details on data we collect and your rights.
                  </p>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg mb-5 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Under GDPR, you're not required to accept all cookies. Only strictly necessary cookies are essential for the website to function properly. You can customize your preferences by clicking "Cookie Settings".</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={openSettings}
                    className="text-[#1D1D1F]"
                  >
                    Cookie Settings
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => acceptAll()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Accept All
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={acceptSelected}
                    className="bg-gray-100 hover:bg-gray-200 text-[#1D1D1F]"
                  >
                    Accept Necessary Only
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-medium text-[#1D1D1F]">Cookie Settings</h3>
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)} 
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Back"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-[#86868b] mb-6">
                  Plane Protect Limited (49 Lexington Street, London W1F 9AP) uses cookies to enhance your browsing experience. 
                  Please select which cookies you're willing to accept. You can learn more about 
                  our data collection practices in our <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1D1D1F]">Strictly Necessary</h4>
                        <p className="text-xs text-[#86868b] mt-1">
                          These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input 
                          type="checkbox" 
                          checked={preferences.necessary} 
                          disabled
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-blue-500 rounded-full peer"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1D1D1F]">Analytics</h4>
                        <p className="text-xs text-[#86868b] mt-1">
                          These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They show us which pages are popular, track conversion rates, and help us improve our service.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={preferences.analytics} 
                          onChange={() => togglePreference('analytics')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1D1D1F]">Preferences</h4>
                        <p className="text-xs text-[#86868b] mt-1">
                          These cookies enable the website to remember your choices and preferences, providing more personalized features and settings for your return visits.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={preferences.preferences} 
                          onChange={() => togglePreference('preferences')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1D1D1F]">Marketing</h4>
                        <p className="text-xs text-[#86868b] mt-1">
                          These cookies track your browsing habits to help us deliver targeted advertising more relevant to your interests. They may also be used to limit the number of times you see an advertisement as well as measure the effectiveness of advertising campaigns.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={preferences.marketing} 
                          onChange={() => togglePreference('marketing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSettings(false)}
                    className="text-[#1D1D1F]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={acceptSelected}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 