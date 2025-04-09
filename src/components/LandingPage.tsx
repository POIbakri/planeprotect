import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, Shield, Star, ArrowRight } from 'lucide-react';
import { FlightCheck } from './FlightCheck';
import { HowItWorks } from './HowItWorks';
import { WhyRefundHero } from './WhyRefundHero';
import { toast } from 'react-hot-toast';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "With RefundHero, I received €600 for my delayed flight within just 11 days. Their process was remarkably simple.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Michael Chen",
    role: "Family Vacationer",
    content: "After our flight was cancelled, RefundHero secured £1,040 in compensation for my family. Truly exceptional service!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Emma Davis",
    role: "Frequent Flyer",
    content: "I've used RefundHero three times now. They handle everything, and I only pay when they win. It's brilliantly simple.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100"
  }
];

const stats = [
  { value: "€4.2M+", label: "Compensation Secured" },
  { value: "24K+", label: "Satisfied Customers" },
  { value: "98%", label: "Success Rate" },
  { value: "14 Days", label: "Avg. Settlement Time" }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-[0.02]" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/10 via-transparent to-purple-50/10" />
      </div>

      {/* Hero Section */}
      <div className="relative w-full px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-6">
            {/* Logo Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3 mb-1 shadow-md"
            >
              <Plane className="w-8 h-8 text-white" />
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1D1D1F] tracking-tight leading-tight sm:leading-tight md:leading-tight">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block"
              >
                Flight Disrupted?
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="block"
              >
                Claim Up to €600 / £520
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-base sm:text-lg text-[#666] max-w-xl mx-auto font-normal leading-relaxed"
            >
              Check your eligibility for flight delay or cancellation compensation in minutes.
              <span className="block mt-1 text-[#888]">
                No win, no fee – Simple 30% success fee.
              </span>
            </motion.p>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4 text-xs sm:text-sm text-[#555]"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>High Success Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Quick Check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>No Upfront Fees</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Flight Check Form */}
        <div id="check-flight" className="pt-16 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto"
          >
            <FlightCheck 
              onSuccess={(details) => {
                if (user) {
                  console.log('LandingPage onSuccess: Navigating to /claim with details:', details);
                  navigate('/claim', { state: details }); 
                } else {
                  // Store details in sessionStorage before login redirect
                  try {
                    sessionStorage.setItem('pendingClaimDetails', JSON.stringify(details));
                    console.log('LandingPage onSuccess: User not logged in. Storing pending claim details and redirecting to login.');
                    navigate('/login', { state: { from: '/claim' } });
                  } catch (error) {
                    console.error("LandingPage: Failed to save pending claim details:", error);
                    toast.error("Could not save flight details. Please try again.");
                  }
                }
              }}
            />
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mt-16 sm:mt-24"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 text-center shadow-sm border border-gray-200/50"
            >
              <div className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-[#666]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Why RefundHero Section */}
      <WhyRefundHero />

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 sm:py-24 bg-white/50">
        <HowItWorks />
      </div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl px-4 py-16 sm:py-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] mb-3">Trusted by Travellers</h2>
          <p className="text-[#666] text-base sm:text-lg">Real stories from passengers we've helped.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-md border border-gray-200/50 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-3 border-2 border-white object-cover"
                />
                <div>
                  <div className="font-semibold text-[#1D1D1F] text-base">{testimonial.name}</div>
                  <div className="text-sm text-[#888]">{testimonial.role}</div>
                </div>
              </div>
              <blockquote className="text-[#444] leading-relaxed text-base italic border-l-2 border-blue-200 pl-4 mb-4 flex-grow">
                {testimonial.content}
              </blockquote>
              <div className="mt-auto flex pt-4 border-t border-gray-100">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call To Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 sm:mt-20 text-center"
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mb-4">Ready to Start Your Claim?</h3>
          <a 
            href="#check-flight" 
            className="inline-flex items-center group px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-base"
          >
            Check Eligibility Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-300" />
          </a>
          <p className="mt-3 text-[#666] text-sm">It takes 2 minutes. No win, no fee.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}