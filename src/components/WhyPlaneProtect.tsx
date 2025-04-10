import { motion } from 'framer-motion';
import { Scale, Shield, Zap, Award, Calculator, Clock, Users, BadgePercent, ShieldCheck, UserCheck, Banknote, CheckCircle2 } from 'lucide-react';

export function WhyPlaneProtect() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Dedicated Legal Expertise",
      description: "Our team of aviation law specialists handles your case from start to finish."
    },
    {
      icon: Clock,
      title: "Fast Resolution",
      description: "Most claims are settled within 14 days, getting compensation to you quickly."
    },
    {
      icon: UserCheck, 
      title: "Hassle-Free Process",
      description: "We handle all paperwork, airline communications, and if needed, court proceedings."
    },
    {
      icon: Banknote,
      title: "No Win, No Fee",
      description: "You only pay our 30% success fee when we secure your compensation."
    },
    {
      icon: CheckCircle2,
      title: "98% Success Rate",
      description: "Our proven track record makes us the most reliable choice for your claim."
    }
  ];

  return (
    <div className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] mb-3">Why Choose PlaneProtect</h2>
          <p className="text-[#666] max-w-2xl mx-auto text-base sm:text-lg">
            We make claiming flight compensation simple, effective, and risk-free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-2">{feature.title}</h3>
              <p className="text-[#666] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-10 text-white max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-3/4">
              <h3 className="text-2xl font-bold mb-3">Your Rights Matter</h3>
              <p className="text-white/90 leading-relaxed">
                Airlines often don't inform passengers about their compensation rights. 
                Under EU and UK regulations, you could be entitled to up to €600/£520 for 
                delays over 3 hours, cancellations, or being denied boarding.
              </p>
            </div>
            <div className="md:w-1/4 flex justify-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Banknote className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}