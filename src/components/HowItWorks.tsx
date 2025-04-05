import { motion } from 'framer-motion';
import { Plane, Upload, CheckCircle2, BanknoteIcon } from 'lucide-react';

const steps = [
  {
    icon: Plane,
    title: "Check Your Eligibility",
    description: "Instantly verify if your flight qualifies for up to €600 compensation with our AI-powered system.",
    color: "blue",
  },
  {
    icon: Upload,
    title: "Submit Documents Digitally",
    description: "Simply upload your boarding pass and ticket. Our smart system handles all the paperwork.",
    color: "purple",
  },
  {
    icon: CheckCircle2,
    title: "We Handle Everything",
    description: "Our legal experts manage all airline communications, ensuring maximum compensation.",
    color: "emerald",
  },
  {
    icon: BanknoteIcon,
    title: "Receive Your Payment",
    description: "Get paid fast via bank transfer. We only take 30% when we win your claim.",
    color: "amber",
  },
];

export function HowItWorks() {
  return (
    <div className="py-20 bg-gradient-to-b from-[#F5F5F7] to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Effortless Compensation in 4 Steps
          </h2>
          <p className="text-[#6e6e73] max-w-2xl mx-auto text-lg">
            We've simplified the complex claim process. You focus on your travels, we focus on your compensation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-32 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 hidden lg:block -z-10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-white/50 h-full backdrop-blur-sm relative z-10">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon with gradient background */}
                  <div className="mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center shadow-sm">
                    <step.icon className={`w-8 h-8 text-${step.color}-500`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#6e6e73] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="absolute -z-10 w-24 h-24 -bottom-6 -left-6 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-xl"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full text-[#1D1D1F] text-sm shadow-sm border border-white/50 backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">Trusted by 24,000+ travelers worldwide</span>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            <a 
              href="#check-flight" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Get Your Free Assessment
            </a>
            <p className="mt-4 text-[#6e6e73]">Just 2 minutes to check. No obligation to proceed.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}