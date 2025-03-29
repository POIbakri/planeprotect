import { motion } from 'framer-motion';
import { Scale, Shield, Zap, Award, Calculator, Clock, Users, BadgePercent } from 'lucide-react';

export function WhyRefundHero() {
  return (
    <div className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why Choose RefundHero?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Your trusted partner in securing flight compensation under EU261 and UK261 regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* EU Regulation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">EU Regulation 261/2004</h3>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Covers flights departing from EU airports or EU airlines flying to EU</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Compensation up to €600 for delays over 3 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Valid for claims within last 6 years</span>
              </li>
            </ul>
          </motion.div>

          {/* UK Regulation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">UK Regulation 261</h3>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Protects flights departing from UK airports or UK airlines to UK</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Compensation up to £520 for qualifying disruptions</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Claims valid for up to 6 years</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BadgePercent,
              title: "No Win, No Fee",
              description: "Our competitive 30% commission means you only pay when we win your claim.",
              color: "emerald",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "2-minute eligibility check and streamlined claim submission process.",
              color: "amber",
            },
            {
              icon: Award,
              title: "Expert Service",
              description: "Dedicated legal team with 98% success rate in compensation claims.",
              color: "blue",
            },
            {
              icon: Users,
              title: "Full Support",
              description: "We handle all airline communication and legal proceedings if needed.",
              color: "purple",
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
            >
              <div className={`w-12 h-12 rounded-xl bg-${benefit.color}-100 flex items-center justify-center mb-4`}>
                <benefit.icon className={`w-6 h-6 text-${benefit.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-600">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          {[
            { label: "Success Rate", value: "98%" },
            { label: "Average Claim", value: "€450" },
            { label: "Processing Time", value: "14 Days" },
            { label: "Happy Clients", value: "15,000+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}