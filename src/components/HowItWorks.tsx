import { motion } from 'framer-motion';
import { Plane, Upload, CheckCircle2, BanknoteIcon } from 'lucide-react';

const steps = [
  {
    icon: Plane,
    title: "Check Your Eligibility",
    description: "Instantly verify if your flight qualifies for up to €600 compensation with our AI-powered system.",
  },
  {
    icon: Upload,
    title: "Submit Documents Digitally",
    description: "Simply upload your boarding pass and ticket. Our smart system handles all the paperwork.",
  },
  {
    icon: CheckCircle2,
    title: "We Handle Everything",
    description: "Our legal experts manage all airline communications, ensuring maximum compensation.",
  },
  {
    icon: BanknoteIcon,
    title: "Receive Your Payment",
    description: "Get paid fast via bank transfer. We only take 30% when we win your claim.",
  },
];

export function HowItWorks() {
  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-5">
            Easy Compensation in 4 Steps
          </h2>
          <p className="text-[#86868b] max-w-2xl mx-auto text-xl">
            We've simplified the complex claim process. You focus on your travels, we focus on your compensation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line in desktop view */}
          <div className="absolute top-24 left-0 w-full h-[1px] bg-blue-100 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative bg-[#F5F5F7] rounded-[24px] p-8"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium shadow-md">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-6 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-medium text-[#1D1D1F] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#6e6e73] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5F5F7] rounded-full text-[#1D1D1F] text-sm mb-8">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Trusted by 24,000+ travelers worldwide</span>
          </div>
          
          <div className="flex flex-col items-center">
            <a 
              href="#check-flight" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-blue-500 text-white font-medium shadow-sm hover:bg-blue-600 transition-all duration-300"
            >
              Get Your Free Assessment
            </a>
            <p className="mt-4 text-[#86868b]">Just 2 minutes to check. No obligation to proceed.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}