import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ClaimForm } from './components/ClaimForm';
import { ClaimStatus } from './components/ClaimStatus';
import { LoginPage } from './components/LoginPage';
import { PasswordReset } from './components/PasswordReset';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ProfileSettings } from './components/ProfileSettings';
import { DocumentManagerWrapper } from './components/DocumentManagerWrapper';
import { HelpCenter } from './components/HelpCenter';
import { NotificationsPage } from './components/NotificationsPage';
import { DeleteAccount } from './components/DeleteAccount';
import { NotFound } from './components/NotFound';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { performanceMonitor } from './lib/performance';
import { AboutUs } from './components/AboutUs';
import { CookieConsent } from './components/CookieConsent';
import { AssignmentForm } from './components/AssignmentForm';
import { useEffect } from 'react';

// Initialize monitoring
performanceMonitor.startMonitoring();

// ScrollToTop component that uses the useLocation hook to detect route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Analytics />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'rounded-xl border border-slate-100',
              style: {
                background: '#fff',
                color: '#334155',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="forgot-password" element={<PasswordReset />} />
              <Route path="reset-password" element={<PasswordReset />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="about" element={<AboutUs />} />
              
              <Route path="dashboard" element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              } />
              <Route path="admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="claim" element={
                <PrivateRoute>
                  <ClaimForm />
                </PrivateRoute>
              } />
              <Route path="assignment-form" element={
                <PrivateRoute>
                  <AssignmentForm />
                </PrivateRoute>
              } />
              <Route path="claim/:id" element={
                <PrivateRoute>
                  <ClaimStatus />
                </PrivateRoute>
              } />
              <Route path="settings" element={
                <PrivateRoute>
                  <ProfileSettings />
                </PrivateRoute>
              } />
              <Route path="documents/:claimId" element={
                <PrivateRoute>
                  <DocumentManagerWrapper />
                </PrivateRoute>
              } />
              <Route path="notifications" element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              } />
              <Route path="delete-account" element={
                <PrivateRoute>
                  <DeleteAccount />
                </PrivateRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          
          {/* GDPR Compliant Cookie Consent Banner - Global Placement */}
          <CookieConsent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;