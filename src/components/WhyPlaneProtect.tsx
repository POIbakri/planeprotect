import { motion } from 'framer-motion';
import { Scale, Shield, Zap, Award, Calculator, Clock, Users, BadgePercent } from 'lucide-react';

export function WhyPlaneProtect() {
  return (
    <div className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-5">
            The #1 Flight Compensation Service
          </h2>
          <p className="text-[#86868b] max-w-2xl mx-auto text-xl">
            Industry-leading expertise in EU261 and UK261 flight compensation regulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* EU Regulation Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#F5F5F7] rounded-[28px] p-8 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium text-[#1D1D1F]">EU Regulation 261/2004</h3>
              </div>
              <ul className="space-y-5 text-[#424245]">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Applicable to all flights departing from EU airports or EU airlines arriving in the EU</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to €600 based on flight distance and delay length</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
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
            transition={{ duration: 0.6 }}
            className="bg-[#F5F5F7] rounded-[28px] p-8 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium text-[#1D1D1F]">UK Regulation 261</h3>
              </div>
              <ul className="space-y-5 text-[#424245]">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Covers flights departing from UK airports or UK airlines arriving in the UK</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to £520 for qualifying disruptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">6-year claim window from flight date</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Key Benefits */}
        <h3 className="text-2xl font-medium text-[#1D1D1F] text-center mb-10">Why Choose PlaneProtect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: BadgePercent,
              title: "Success-Based Fee",
              description: "Only 30% fee when we win your claim. If we don't secure your compensation, you pay nothing.",
              delay: 0.1,
            },
            {
              icon: Zap,
              title: "Fast Assessment",
              description: "2-minute eligibility check with our AI-powered system. Get an instant decision on your claim.",
              delay: 0.2,
            },
            {
              icon: Award,
              title: "Industry-Leading Success",
              description: "98% success rate with over €4.2 million secured for our clients in the last year alone.",
              delay: 0.3,
            },
            {
              icon: Users,
              title: "Complete Representation",
              description: "Our legal experts handle all airline negotiations and legal procedures on your behalf.",
              delay: 0.4,
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: benefit.delay, duration: 0.5 }}
              className="bg-[#F5F5F7] rounded-2xl p-7"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-5">
                <benefit.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-[#1D1D1F] mb-3">
                {benefit.title}
              </h4>
              <p className="text-[#6e6e73] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 bg-[#F5F5F7] rounded-[28px] p-10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: "Success Rate", value: "98%" },
              { label: "Average Claim", value: "€450" },
              { label: "Average Time", value: "14 Days" },
              { label: "Satisfied Clients", value: "24,000+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-semibold text-[#1D1D1F] mb-1">{stat.value}</div>
                <div className="text-[#6e6e73]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}