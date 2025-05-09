import { motion } from 'framer-motion';
import { Plane, Upload, CheckCircle2, BanknoteIcon } from 'lucide-react';

const steps = [
  {
    icon: Plane,
    title: "Check Your Eligibility",
    description: "Instantly verify if your flight qualifies for up to €600 compensation with our AI-powered system.",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100"
  },
  {
    icon: Upload,
    title: "Submit Documents Digitally",
    description: "Simply upload your boarding pass and ticket. Our smart system handles all the paperwork.",
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100"
  },
  {
    icon: CheckCircle2,
    title: "We Handle Everything",
    description: "Our legal experts manage all airline communications, ensuring maximum compensation.",
    color: "from-teal-500 to-teal-600",
    bgColor: "from-teal-50 to-teal-100"
  },
  {
    icon: BanknoteIcon,
    title: "Receive Your Payment",
    description: "Get paid fast via bank transfer. We only take 30% when we win your claim.",
    color: "from-amber-500 to-amber-600",
    bgColor: "from-amber-50 to-amber-100"
  },
];

export function HowItWorks() {
  return (
    <div className="py-24 overflow-hidden bg-gradient-to-b from-white to-[#F8F9FF]">
      <div className="max-w-[1200px] mx-auto px-6 relative">
        {/* Background decorative elements */}
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-40 right-0 w-80 h-80 rounded-full bg-blue-500 opacity-[0.03] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute bottom-20 -left-40 w-80 h-80 rounded-full bg-purple-500 opacity-[0.03] blur-3xl"
        />
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-5">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 text-sm font-medium inline-block">
              Simple 4-Step Process
            </div>
          </div>
          <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-5">
            Easy Compensation in <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">4 Steps</span>
          </h2>
          <p className="text-[#86868b] max-w-2xl mx-auto text-xl">
            We've simplified the complex claim process. You focus on your travels, we focus on your compensation.
          </p>
        </motion.div>

        <div className="relative">
          {/* Enhanced connecting line in desktop view */}
          <div className="absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 hidden lg:block rounded-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className={`relative bg-gradient-to-br ${step.bgColor} rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all duration-300 group`}
              >
                {/* Decorative elements */}
                <div className={`absolute -top-3 -right-3 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} opacity-[0.07] blur-lg group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Step Number with enhanced styling */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-sm font-medium shadow-md z-10`}>
                  {index + 1}
                </div>

                {/* Icon with gradient background */}
                <div className={`mb-6 w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                  <step.icon className="w-7 h-7 text-white" />
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

        {/* Call to Action with enhanced styling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-[#1D1D1F] text-sm mb-8 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Trusted by 24,000+ travelers worldwide</span>
          </div>
          
          <div className="flex flex-col items-center">
            <a 
              href="#check-flight" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group"
            >
              {/* Subtle shine effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
              
              Get Your Free Assessment
            </a>
            <p className="mt-4 text-[#86868b]">Just 2 minutes to check. No obligation to proceed.</p>
          </div>
        </motion.div>

        {/* Added feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Expert Legal Team",
              description: "Our specialists have deep knowledge of EU and UK air passenger regulations",
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "No Upfront Fees",
              description: "You only pay our 30% success fee when we win your compensation",
              color: "text-purple-600",
              bgColor: "bg-purple-50"
            },
            {
              title: "Hassle-Free Process",
              description: "We handle all the paperwork and communication with airlines",
              color: "text-teal-600",
              bgColor: "bg-teal-50"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className={`${feature.bgColor} rounded-xl p-6 border border-[#E0E5FF] shadow-sm`}
            >
              <div className={`text-lg font-medium ${feature.color} mb-2`}>{feature.title}</div>
              <div className="text-[#6e6e73]">{feature.description}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}