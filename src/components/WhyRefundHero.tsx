import { motion } from 'framer-motion';
import { Scale, Shield, Zap, Award, Calculator, Clock, Users, BadgePercent } from 'lucide-react';

export function WhyRefundHero() {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-[#F5F5F7] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            The #1 Flight Compensation Service
          </h2>
          <p className="text-[#6e6e73] max-w-2xl mx-auto text-lg">
            Industry-leading expertise in EU261 and UK261 flight compensation regulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* EU Regulation Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/50 relative overflow-hidden group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/30 opacity-50"></div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl shadow-sm">
                  <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1D1D1F]">EU Regulation 261/2004</h3>
              </div>
              <ul className="space-y-4 text-[#424245]">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Applicable to all flights departing from EU airports or EU airlines arriving in the EU</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to €600 based on flight distance and delay length</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Valid for claims within the past 6 years</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* UK Regulation Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/50 relative overflow-hidden group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/30 opacity-50"></div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl shadow-sm">
                  <Scale className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-[#1D1D1F]">UK Regulation 261</h3>
              </div>
              <ul className="space-y-4 text-[#424245]">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Covers flights departing from UK airports or UK airlines arriving in the UK</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to £520 for qualifying disruptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">6-year claim window from flight date</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: BadgePercent,
              title: "Success-Based Fee",
              description: "Only 30% fee when we win your claim. If we don't secure your compensation, you pay nothing.",
              color: "emerald",
              delay: 0.1,
            },
            {
              icon: Zap,
              title: "Fast Assessment",
              description: "2-minute eligibility check with our AI-powered system. Get an instant decision on your claim.",
              color: "amber",
              delay: 0.2,
            },
            {
              icon: Award,
              title: "Industry-Leading Success",
              description: "98% success rate with over €4.2 million secured for our clients in the last year alone.",
              color: "blue",
              delay: 0.3,
            },
            {
              icon: Users,
              title: "Complete Representation",
              description: "Our legal experts handle all airline negotiations and legal procedures on your behalf.",
              color: "purple",
              delay: 0.4,
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: benefit.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-7 shadow-sm border border-white/50 group hover:shadow-md transition-shadow duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${benefit.color}-50 to-${benefit.color}-100 flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                <benefit.icon className={`w-7 h-7 text-${benefit.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">
                {benefit.title}
              </h3>
              <p className="text-[#6e6e73] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 relative rounded-3xl p-10 overflow-hidden"
        >
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50"></div>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-md"></div>
          
          {/* Content */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: "Success Rate", value: "98%" },
              { label: "Average Claim", value: "€450" },
              { label: "Average Time", value: "14 Days" },
              { label: "Satisfied Clients", value: "24,000+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-[#6e6e73]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}