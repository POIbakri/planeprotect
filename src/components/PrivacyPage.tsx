import { motion } from 'framer-motion';
import { Shield, Lock, Database, Bell, Mail, FileText, AlertTriangle, Globe } from 'lucide-react';

export function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-600">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Introduction Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Your Privacy Matters</h2>
            <p className="text-slate-600 text-sm">We are committed to protecting your personal data</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          RefundHero ("we", "our", "us") is committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use our flight compensation claim management services ("Service"), in compliance with the General Data Protection Regulation (GDPR) and other applicable UK/EU data protection laws.
        </p>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            By using our services, you agree to the collection and use of your personal data as described in this policy.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Data Collection */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">1. Data We Collect</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Personal Information
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-700">We collect and process the following personal data:</p>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>First name, last name, passport number, date of birth</li>
                  <li>Email address, phone number</li>
                  <li>Flight number, flight date, departure and arrival airports</li>
                  <li>Bank details for processing payouts</li>
                  <li>Copies of boarding pass, e-ticket, and passport/ID</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Usage Data
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-700">We automatically collect:</p>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and navigation paths</li>
                  <li>Access times and dates</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Usage */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">2. How We Use Your Data</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Service Provision
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Verify flight status</li>
                <li>• Process compensation claims</li>
                <li>• Generate claim documentation</li>
                <li>• Communicate with airlines</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Communication
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Send claim updates</li>
                <li>• Provide customer support</li>
                <li>• Share important notifications</li>
                <li>• Process feedback</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">3. Data Sharing and Transfers</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Third-Party Service Providers</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <p className="text-sm text-slate-700">We share your data with trusted providers:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">Data Storage</p>
                    <ul className="text-slate-600 space-y-1">
                      <li>• Supabase - Database & Auth</li>
                      <li>• AWS S3 - Document Storage</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">Services</p>
                    <ul className="text-slate-600 space-y-1">
                      <li>• AviationStack - Flight Data</li>
                      <li>• Resend - Email Service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                All our service providers are contractually bound to protect your personal data and use it only for specified purposes.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">4. Security Measures</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3">Technical Measures</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• SSL/TLS encryption</li>
                  <li>• Regular security audits</li>
                  <li>• Secure data backups</li>
                  <li>• Access controls</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3">Organizational Measures</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Staff training</li>
                  <li>• Access monitoring</li>
                  <li>• Security policies</li>
                  <li>• Incident response plan</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">5. Your Rights</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Access & Control</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Request data access</li>
                <li>• Correct inaccurate data</li>
                <li>• Delete your data</li>
                <li>• Restrict processing</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Additional Rights</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Data portability</li>
                <li>• Object to processing</li>
                <li>• Withdraw consent</li>
                <li>• Lodge complaints</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">6. Contact Us</h2>
          
          <div className="space-y-4">
            <p className="text-slate-600">
              For any privacy-related questions or requests, please contact us at:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-slate-900">Email</h3>
                </div>
                <p className="text-sm text-slate-600">privacy@refundhero.com</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-slate-900">Mail</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Data Protection Officer<br />
                  123 Flight Street<br />
                  London, EC1A 1BB<br />
                  United Kingdom
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Acceptance Notice */}
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-slate-600">
            By using RefundHero's services, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
          </p>
        </div>
      </div>
    </motion.div>
  );
}