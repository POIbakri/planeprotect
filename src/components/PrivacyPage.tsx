import { motion } from 'framer-motion';
import { Shield, Lock, Database, Bell, Mail, FileText, AlertTriangle, Globe, Search, Fingerprint, Clock, UserPlus } from 'lucide-react';

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
          Plane Protect Limited ("we", "our", "us") is committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, store, share, and protect your information when you use our flight compensation claim management services ("Service"), in compliance with the General Data Protection Regulation (GDPR) and other applicable UK/EU data protection laws.
        </p>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700 mb-6">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            By using our services, you agree to the collection and use of your personal data as described in this policy.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Important Notice:</p>
            <p>Processing flight compensation claims requires extensive personal and travel data collection. This is necessary to verify eligibility, communicate with airlines, and secure your compensation. We collect significantly more data than typical websites. Please review this policy carefully.</p>
          </div>
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
                  <li>Full name, date of birth, nationality, and gender</li>
                  <li>Passport/ID number and expiration date</li>
                  <li>Email address, postal address, and phone number</li>
                  <li>Flight details including booking references, e-ticket numbers, flight numbers</li>
                  <li>Departure and arrival airports, dates, and scheduled times</li>
                  <li>Information about your flight disruption (delay duration, reason for cancellation)</li>
                  <li>Bank account details for compensation payments</li>
                  <li>Supporting documentation (boarding passes, e-tickets, passports/ID, proof of expenses)</li>
                  <li>Communications with our customer service team</li>
                  <li>Details of any special assistance needs or disabilities</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Technical Information
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-700">We automatically collect:</p>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>IP address and geographical location data</li>
                  <li>Device information (type, model, operating system)</li>
                  <li>Browser type and version</li>
                  <li>Pages visited, navigation patterns, and features used</li>
                  <li>Time zone setting and location</li>
                  <li>Access times, dates, and duration of visits</li>
                  <li>Referral sources and exit pages</li>
                  <li>Clicks, scrolls, and mouse movements</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-600" />
                Cookies and Similar Technologies
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-slate-700">We use cookies and similar technologies to:</p>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>Authentication and session management</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Measure the effectiveness of our marketing campaigns</li>
                  <li>Provide personalized content and advertisements</li>
                </ul>
                <p className="text-sm text-slate-700 mt-3">
                  You can manage your cookie preferences through our Cookie Consent banner. For more details, see our <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">2. Legal Basis for Processing</h2>
          
          <div className="space-y-4">
            <p className="text-slate-600">Under GDPR, we process your personal data based on the following legal grounds:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Contract Performance
                </h3>
                <p className="text-sm text-slate-600">
                  Processing necessary to fulfill our service agreement with you - checking eligibility, submitting claims, and securing compensation.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  Consent
                </h3>
                <p className="text-sm text-slate-600">
                  When you provide explicit consent for certain processing activities, such as marketing communications or non-essential cookies.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  Legitimate Interests
                </h3>
                <p className="text-sm text-slate-600">
                  When processing is necessary for our legitimate business interests (such as fraud prevention, service improvement) in ways you would reasonably expect.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Legal Obligation
                </h3>
                <p className="text-sm text-slate-600">
                  When processing is necessary to comply with legal requirements, such as financial records retention or responding to court orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Usage */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">3. How We Use Your Data</h2>
          
          <div className="space-y-4">
            <p className="text-slate-600">We use your personal data for the following purposes:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Service Provision
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Verify flight disruption details</li>
                  <li>• Assess eligibility for compensation</li>
                  <li>• Process compensation claims</li>
                  <li>• Generate claim documentation</li>
                  <li>• Communicate with airlines and authorities</li>
                  <li>• Process payments and commissions</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  Communication
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Send claim status updates</li>
                  <li>• Provide customer support</li>
                  <li>• Send important service notifications</li>
                  <li>• Request additional information when needed</li>
                  <li>• Collect feedback on our services</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Service Improvement
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Analyze usage patterns and behavior</li>
                  <li>• Troubleshoot technical issues</li>
                  <li>• Improve user experience</li>
                  <li>• Develop new features and services</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Security & Compliance
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Verify identity to prevent fraud</li>
                  <li>• Secure your account and personal data</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Maintain financial records</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">4. Data Sharing and Transfers</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Third-Party Service Providers</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <p className="text-sm text-slate-700">We share your data with trusted providers:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">Infrastructure & Storage</p>
                    <ul className="text-slate-600 space-y-1">
                      <li>• Supabase - Database & Authentication</li>
                      <li>• AWS S3 - Document Storage</li>
                      <li>• Vercel - Website Hosting</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900">Services</p>
                    <ul className="text-slate-600 space-y-1">
                      <li>• AviationStack - Flight Data API</li>
                      <li>• Resend - Email Communications</li>
                      <li>• Payment processors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-4">Essential Data Sharing</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-700 mb-3">To process your claim, we must share your data with:</p>
                <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                  <li>Airlines and their representatives</li>
                  <li>Civil aviation authorities</li>
                  <li>Legal representatives (if claim escalation is required)</li>
                  <li>National enforcement bodies</li>
                  <li>Alternative dispute resolution entities</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">
                All our service providers and partners are contractually bound to protect your personal data and use it only for the specified purposes in compliance with GDPR requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">5. Security Measures</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3">Technical Measures</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• SSL/TLS encryption for data transmission</li>
                  <li>• Secure data storage with encryption</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Regular security audits and assessments</li>
                  <li>• Automated threat detection</li>
                  <li>• Secure data backups</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-medium text-slate-900 mb-3">Organizational Measures</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Staff data protection training</li>
                  <li>• Access controls and permissions</li>
                  <li>• Comprehensive security policies</li>
                  <li>• Data breach response procedures</li>
                  <li>• Regular compliance reviews</li>
                  <li>• Data minimization practices</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">6. Data Retention</h2>
          
          <div className="space-y-4">
            <p className="text-slate-600">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-slate-900 mb-3">Retention Periods</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• <span className="font-medium">Active claims:</span> For the duration of the claim process</li>
                <li>• <span className="font-medium">Completed claims:</span> 7 years after claim resolution (for legal and tax purposes)</li>
                <li>• <span className="font-medium">Unsuccessful claims:</span> 2 years after claim rejection</li>
                <li>• <span className="font-medium">Account information:</span> As long as your account remains active</li>
                <li>• <span className="font-medium">Marketing preferences:</span> Until you withdraw consent</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">7. Your Rights Under GDPR</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Access & Control</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Right to access your personal data</li>
                <li>• Right to correct inaccurate data</li>
                <li>• Right to delete your data (where applicable)</li>
                <li>• Right to restrict processing</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Additional Rights</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Right to withdraw consent</li>
                <li>• Right to lodge a complaint with a supervisory authority</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:privacy@planeprotect.co.uk" className="underline">privacy@planeprotect.co.uk</a>. We will respond to your request within 30 days. Please note that certain data may be exempt from these requests where we have a legal obligation to keep the data.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">8. Contact Us</h2>
          
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
                <p className="text-sm text-slate-600">support@planeprotect.co.uk</p>
                <p className="text-sm text-slate-600 mt-1">privacy@planeprotect.co.uk</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-slate-900">Mail</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Data Protection Officer<br />
                  Plane Protect Limited<br />
                  49 Lexington Street<br />
                  London, W1F 9AP<br />
                  United Kingdom
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Acceptance Notice */}
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-slate-600">
            By using Plane Protect Limited's services, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
          </p>
        </div>
      </div>
    </motion.div>
  );
}