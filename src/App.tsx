import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

// Initialize monitoring
performanceMonitor.startMonitoring();

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
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
          <Routes>
            <Route path="/" element={
              <ErrorBoundary>
                <Layout />
              </ErrorBoundary>
            }>
              <Route index element={
                <ErrorBoundary>
                  <LandingPage />
                </ErrorBoundary>
              } />
              <Route path="login" element={
                <ErrorBoundary>
                  <LoginPage />
                </ErrorBoundary>
              } />
              <Route path="forgot-password" element={
                <ErrorBoundary>
                  <PasswordReset />
                </ErrorBoundary>
              } />
              <Route path="reset-password" element={
                <ErrorBoundary>
                  <PasswordReset />
                </ErrorBoundary>
              } />
              <Route path="terms" element={
                <ErrorBoundary>
                  <TermsPage />
                </ErrorBoundary>
              } />
              <Route path="privacy" element={
                <ErrorBoundary>
                  <PrivacyPage />
                </ErrorBoundary>
              } />
              <Route path="help" element={
                <ErrorBoundary>
                  <HelpCenter />
                </ErrorBoundary>
              } />
              <Route path="about" element={
                <ErrorBoundary>
                  <AboutUs />
                </ErrorBoundary>
              } />
              
              {/* Protected Routes */}
              <Route path="dashboard" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="admin" element={
                <ErrorBoundary>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ErrorBoundary>
              } />
              <Route path="claim" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <ClaimForm />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="claim/:id" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <ClaimStatus />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="settings" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <ProfileSettings />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="documents/:claimId" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <DocumentManagerWrapper />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="notifications" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              <Route path="delete-account" element={
                <ErrorBoundary>
                  <PrivateRoute>
                    <DeleteAccount />
                  </PrivateRoute>
                </ErrorBoundary>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;