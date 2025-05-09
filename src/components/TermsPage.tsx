import { motion } from 'framer-motion';
import { Shield, Scale, Clock, AlertTriangle } from 'lucide-react';

export function TermsPage() {
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
          Terms and Conditions
        </h1>
        <p className="text-slate-600">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Introduction Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Welcome to Plane Protect Limited</h2>
            <p className="text-slate-600 text-sm">Please read these terms carefully</p>
          </div>
        </div>

        <p className="text-slate-600 mb-6">
          These Terms and Conditions govern your use of our website and services, which provide an automated solution to check your eligibility and assist in claiming compensation for flight disruptions under EU Regulation 261/2004 ("the Regulation"). By accessing or using Plane Protect Limited's website and services, you agree to be bound by these Terms.
        </p>

        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            If you do not agree to these Terms, please do not use our services.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Definitions */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">1. Definitions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.1 "Service"</h3>
              <p className="text-slate-600">
                The flight compensation claim management service provided by Plane Protect Limited, which includes checking flight eligibility, generating claim documentation, and assisting in the submission of compensation claims to airlines.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.2 "User"</h3>
              <p className="text-slate-600">
                "User", "you", or "your" refers to any individual or entity using Plane Protect Limited's services.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.3 "Claim"</h3>
              <p className="text-slate-600">
                A request for financial redress made under EU Regulation 261/2004, relating to flight delays, cancellations, or denied boarding.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.4 "Commission"</h3>
              <p className="text-slate-600">
                The fee that Plane Protect Limited charges on successful compensation claims, currently set at 30% of the compensation awarded, inclusive of VAT.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.5 "Airline"</h3>
              <p className="text-slate-600">
                The carrier responsible for the flight disruption, as defined in the claim.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">1.6 "Documents"</h3>
              <p className="text-slate-600">
                Any files, such as boarding passes, e-tickets, passports, and other travel-related documentation uploaded by you as part of the claim process.
              </p>
            </div>
          </div>
        </section>

        {/* Scope of Service */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">2. Scope of Service</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">2.1 Platform Features</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Enter flight details and check eligibility for compensation based on EU Regulation 261/2004</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Complete a claims form and upload required documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Automatically generate a claim letter referencing the Regulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Facilitate the submission of claims to the relevant airline(s)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Provide updates regarding the claim's progress</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">2.2 Service Limitations</h3>
              <p className="text-slate-600">
                Plane Protect Limited does not guarantee a successful claim or a specific compensation amount. All claims are subject to the eligibility criteria outlined in EU Regulation 261/2004 and the airline's review process.
              </p>
            </div>
          </div>
        </section>

        {/* User Obligations */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">3. User Obligations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">3.1 Accurate Information</h3>
              <p className="text-slate-600">
                You agree to provide complete, accurate, and current information when using our services. Plane Protect Limited is not responsible for any claims denied due to incorrect or incomplete data.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">3.2 Document Submission</h3>
              <p className="text-slate-600">
                You must upload all required documents (e.g., boarding passes, e-tickets, passport or driving license) in the formats specified by Plane Protect Limited. Failure to do so may result in delays or rejection of your claim.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">3.3 Authorization</h3>
              <p className="text-slate-600">
                By using Plane Protect Limited, you grant us the right to act as your representative in pursuing compensation claims against airlines on your behalf. You agree to provide explicit consent that authorizes Plane Protect Limited to communicate with the relevant airline(s) and to use your data for the purposes of processing your claim.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">3.4 Compliance</h3>
              <p className="text-slate-600">
                You are responsible for ensuring that you comply with any applicable laws or regulations regarding the use of our service, including data protection and privacy laws.
              </p>
            </div>
          </div>
        </section>

        {/* Continue with remaining sections... */}
        {/* Add similar sections for 4-10 following the same pattern */}

        {/* Contact Information */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">10. Contact Information</h2>
          <p className="text-slate-600 mb-4">
            If you have any questions or concerns regarding these Terms, please contact us at:
          </p>
          <div className="space-y-2 text-slate-600">
            <p>Email: support@planeprotect.co.uk</p>
            <p>Phone: +44 (0) 20 1234 5678</p>
            <p>Address: Plane Protect Limited, 49 Lexington Street, London, W1F 9AP, United Kingdom</p>
          </div>
        </section>

        {/* Acceptance Notice */}
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-slate-600">
            By using Plane Protect Limited's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}