import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, BanknoteIcon, Shield, Star } from 'lucide-react';
import { FlightCheck } from './FlightCheck';
import { HowItWorks } from './HowItWorks';
import { WhyRefundHero } from './WhyRefundHero';

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden bg-[#F5F5F7]">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-[0.03]" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-purple-50/30" />
      </div>

      {/* Hero Section */}
      <div className="relative w-full px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 max-w-5xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Logo Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4 mb-2 shadow-md"
            >
              <Plane className="w-10 h-10 text-white" />
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1D1D1F] tracking-tight leading-[1.1]">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block mb-2"
              >
                Flight Delayed or Cancelled?
              </motion.span>
              <br />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-2 block"
              >
                Claim Up to €600 Compensation
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl sm:text-2xl text-[#6e6e73] max-w-2xl mx-auto font-light leading-relaxed"
            >
              World's leading flight compensation service.
              <span className="block mt-2 text-[#86868b]">
                Check for free in 2 minutes. No win, no fee – only pay 30% if we win.
              </span>
            </motion.p>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-6 mt-6 text-[#6e6e73]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>98% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>2-Minute Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>Zero Upfront Fees</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Flight Check Form */}
        <motion.div 
          id="check-flight" 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mt-8 relative z-10"
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl -z-10"></div>
          <FlightCheck onSuccess={() => user ? navigate('/claim') : navigate('/login')} />
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-[#6e6e73]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Why RefundHero Section */}
      <WhyRefundHero />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl px-4 py-20 bg-gradient-to-b from-white/50 to-transparent"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4">Trusted by Thousands</h2>
          <p className="text-[#6e6e73]">Here's what our customers say about us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-sm border border-white/50"
            >
              <div className="flex items-center mb-6">
                <div className="mr-4 relative">
                  <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-[2px]"></div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full relative border-2 border-white"
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F]">{testimonial.name}</div>
                  <div className="text-sm text-[#86868b]">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-[#424245] leading-relaxed text-lg">{testimonial.content}</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
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
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-4">Start your hassle-free claim today</h3>
          <a 
            href="#check-flight" 
            className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Check Your Eligibility Now
          </a>
          <p className="mt-4 text-[#6e6e73] text-sm">It's completely free to check. You only pay 30% if we win your claim.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}