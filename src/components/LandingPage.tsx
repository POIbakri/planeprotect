import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, Shield, Star, ArrowRight, AlertCircle, BanknoteIcon } from 'lucide-react';
import { FlightCheck } from './FlightCheck';
import { HowItWorks } from './HowItWorks';
import { WhyPlaneProtect } from './WhyPlaneProtect';
import { toast } from 'react-hot-toast';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "With PlaneProtect, I received €600 for my delayed flight within just 11 days. Their process was remarkably simple.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Michael Chen",
    role: "Family Vacationer",
    content: "After our flight was cancelled, PlaneProtect secured £1,040 in compensation for my family. Truly exceptional service!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Emma Davis",
    role: "Frequent Flyer",
    content: "I've used PlaneProtect three times now. They handle everything, and I only pay when they win. It's brilliantly simple.",
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-[#F5F5F7] to-white overflow-hidden">
        {/* Subtle background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-[0.02]" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
            }}
          />
          
          {/* Subtle animated elements */}
          <motion.div
            initial={{ x: "-100%", y: "30%" }}
            animate={{ x: "200%", y: "25%" }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent top-1/4 blur-sm opacity-70"
          />
          <motion.div
            initial={{ x: "-100%", y: "60%" }}
            animate={{ x: "200%", y: "55%" }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute w-32 h-px bg-gradient-to-r from-transparent via-purple-100 to-transparent top-1/3 blur-sm opacity-70"
          />
        </div>

        {/* Main hero content */}
        <div className="relative max-w-[1200px] mx-auto px-6 py-4 sm:py-6 lg:py-8">
          {/* Small logo mark centered on mobile, left aligned on desktop */}
          <div className="flex justify-center lg:justify-start mb-5">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="rounded-full p-3 bg-white shadow-sm border border-gray-100"
            >
              <Plane className="w-8 h-8 text-blue-500" />
            </motion.div>
          </div>
          
          {/* Two-column layout for hero content */}
          <div className="lg:flex items-start gap-12">
            {/* Left Column - Flight Check Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full lg:w-6/12 lg:order-1 order-2 mt-12 lg:mt-0"
            >
              <div className="bg-white rounded-[28px] shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">Check Your Eligibility</h3>
                  <FlightCheck 
                    onSuccess={(details) => {
                      if (user) {
                        console.log('LandingPage onSuccess: Navigating to /claim with details:', details);
                        navigate('/claim', { state: details }); 
                      } else {
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
                </div>
              </div>
            </motion.div>
            
            {/* Right Column - Hero Message */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full lg:w-6/12 lg:order-2 order-1 flex flex-col items-center lg:items-start lg:-mt-2"
              id="check-flight"
            >
              {/* Main Headline */}
              <h1 className="text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-[2.75rem] sm:text-5xl lg:text-6xl font-medium text-[#1D1D1F] leading-tight tracking-tight"
                >
                  Flight disrupted?
                  <span className="block mt-1 text-[2.75rem] sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent font-semibold">
                    You're owed money.
                  </span>
                </motion.div>
              </h1>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6 text-lg sm:text-xl text-[#86868b] max-w-xl text-center lg:text-left leading-relaxed"
              >
                Get compensation of up to <span className="text-[#1D1D1F] font-medium">€600/£520</span> for delayed and cancelled flights. 
                <span className="block mt-2">It takes just 2 minutes to check — no win, no fee.</span>
              </motion.p>

              {/* Trust indicators */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-[#1D1D1F]">98% Success Rate</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-[#1D1D1F]">2-Minute Check</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-[#1D1D1F]">Zero Upfront Fees</span>
                </div>
              </motion.div>
              
              {/* User Journey Steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-10 flex flex-col items-center lg:items-start"
              >
                <div className="bg-blue-50 rounded-xl p-5 max-w-md">
                  <h4 className="text-[#1D1D1F] font-medium mb-4 text-center lg:text-left">How it works</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">1</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">Enter your flight details</p>
                        <p className="text-xs text-[#86868b]">Takes less than 2 minutes to complete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">2</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">We check your eligibility</p>
                        <p className="text-xs text-[#86868b]">Instantly see if you qualify for compensation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">3</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">Get paid</p>
                        <p className="text-xs text-[#86868b]">We handle all communications and pay you when successful</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center">
                    <p className="text-xs text-[#86868b]">No win, no fee — only pay if we win</p>
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium cursor-pointer group" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Mobile CTA Arrow - Only visible on small screens */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex lg:hidden justify-center w-full"
              >
                <div className="animate-bounce rounded-full p-2 bg-blue-50 text-blue-500">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats with a clean, spaced row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 sm:mt-24"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
                {stats.map((stat, index) => (
                  <div key={index} className="px-6 py-8 flex flex-col items-center">
                    <div className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] mb-2">{stat.value}</div>
                    <div className="text-sm text-[#86868b]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why PlaneProtect Section - keep original component */}
      <WhyPlaneProtect />

      {/* How It Works Section - keep original component */}
      <div id="how-it-works" className="bg-white">
        <HowItWorks />
      </div>

      {/* Testimonials - streamlined design */}
      <div className="bg-[#F5F5F7]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1200px] mx-auto px-6 py-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-4">Trusted by Travelers</h2>
            <p className="text-[#86868b] text-lg max-w-xl mx-auto">Real stories from passengers we've helped secure compensation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-[24px] p-8 shadow-sm"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-medium text-[#1D1D1F]">{testimonial.name}</div>
                    <div className="text-sm text-[#86868b]">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-[#1D1D1F] leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex">
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
            className="mt-20 text-center"
          >
            <div className="max-w-xl mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-[28px] px-10 py-12 text-white shadow-lg">
              <h3 className="text-2xl font-medium mb-4">Ready to claim your compensation?</h3>
              <p className="text-blue-50 mb-8">Check your eligibility in under 2 minutes. No upfront costs.</p>
              <a 
                href="#check-flight" 
                className="inline-flex items-center px-8 py-4 rounded-full bg-white text-blue-600 font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                Check Eligibility Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}