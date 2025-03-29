import { motion } from 'framer-motion';
import { Plane, Upload, CheckCircle2, BanknoteIcon } from 'lucide-react';

const steps = [
  {
    icon: Plane,
    title: "Enter Your Flight Details",
    description: "Check instantly if your flight qualifies for compensation up to €600.",
    color: "blue",
  },
  {
    icon: Upload,
    title: "Upload Your Documents",
    description: "Easily attach your boarding pass, e-ticket, and ID. We handle the rest.",
    color: "purple",
  },
  {
    icon: CheckCircle2,
    title: "We Process Your Claim",
    description: "Our experts handle all communication with the airline. No fees unless you win.",
    color: "emerald",
  },
  {
    icon: BanknoteIcon,
    title: "Get Paid",
    description: "Receive up to €600 compensation directly into your bank account.",
    color: "amber",
  },
];

export function HowItWorks() {
  return (
    <div className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            How RefundHero Works
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get your flight compensation in four simple steps. No hassle, no upfront fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -z-10" />
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mb-4 w-12 h-12 rounded-xl bg-${step.color}-100 flex items-center justify-center`}>
                  <step.icon className={`w-6 h-6 text-${step.color}-500`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>98% Success Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}