import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, Shield, Star, ArrowRight, AlertCircle, XCircle, BanknoteIcon } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-[0.04]" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
          }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20" 
        />
        
        {/* Animated airplane paths */}
        <motion.div
          initial={{ x: "-100%", y: "20%" }}
          animate={{ x: "200%", y: "10%" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent top-1/4 blur-sm"
        />
        <motion.div
          initial={{ x: "-100%", y: "50%" }}
          animate={{ x: "200%", y: "60%" }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent top-1/3 blur-sm"
        />
      </div>

      {/* Integrated Hero Section with FlightCheck */}
      <div className="relative w-full px-4 py-8 sm:py-16 max-w-7xl mx-auto">
        {/* Two-column layout with more specific width controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Hero Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            <div className="flex flex-col items-center lg:items-start gap-3 mb-6 lg:mb-0">
              {/* Alert Banner */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-blue-50 border border-blue-200 rounded-full py-1.5 px-4 flex items-center gap-2 mb-4 shadow-sm max-w-max"
              >
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Airlines won't tell you this!</span>
              </motion.div>

              {/* Logo Badge - Responsive for mobile */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg lg:mr-auto"
              >
                <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Main Headline with better spacing */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="inline-block mb-1 sm:mb-2"
                >
                  <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 bg-clip-text text-transparent">DELAYED?</span>{" "}
                  <span className="bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">CANCELLED?</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex flex-col items-center lg:items-start mt-2"
                >
                  <div className="relative">
                    <span className="block text-3xl sm:text-4xl md:text-5xl">YOU'RE OWED</span>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.5, duration: 0.8 }}
                      className="absolute -bottom-1 sm:-bottom-2 left-0 h-2 sm:h-3 bg-blue-200/40 -z-10 rounded-full"
                    />
                  </div>
                  <div className="flex items-center mt-2 sm:mt-3 gap-1 sm:gap-2">
                    <BanknoteIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                    <span className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                      UP TO €600/£520
                    </span>
                    <BanknoteIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </motion.div>
              </h1>

              {/* Subheadline with cleaner sizing */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="text-base sm:text-lg text-[#444] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                <span className="underline decoration-blue-400 decoration-2 underline-offset-2">Airlines won't pay unless you claim.</span> Check your eligibility in <span className="font-bold text-blue-600">under 2 minutes</span>.
                <span className="block mt-2 text-[#666] font-bold">
                  No win, no fee — 30% success fee
                </span>
              </motion.p>

              {/* Trust Badges with better spacing */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 mt-4 sm:mt-6 text-xs sm:text-sm bg-white/50 backdrop-blur-sm py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-sm border border-gray-100 w-full max-w-md mx-auto lg:mx-0"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">98% Success Rate</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">2-Minute Check</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">Zero Upfront Fees</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Flight Check Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            id="check-flight"
            className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden">
              <div className="p-5 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-[#1D1D1F] mb-4 text-center lg:text-left">Check Your Eligibility</h3>
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
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section with better spacing */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mt-16 sm:mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-sm border border-gray-200/50"
            >
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-[#666]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Why PlaneProtect Section */}
      <WhyPlaneProtect />

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