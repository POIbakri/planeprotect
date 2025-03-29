import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, BanknoteIcon, Shield, Star, Users } from 'lucide-react';
import { FlightCheck } from './FlightCheck';
import { HowItWorks } from './HowItWorks';
import { WhyRefundHero } from './WhyRefundHero';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "RefundHero helped me claim €600 for my delayed flight. The process was incredibly smooth!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Michael Chen",
    role: "Family Vacationer",
    content: "Got compensation for our entire family's cancelled flight. Excellent service!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Emma Davis",
    role: "Frequent Flyer",
    content: "I've used RefundHero multiple times. They make the claim process effortless.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100"
  }
];

const stats = [
  { value: "€2.5M+", label: "Compensation Secured" },
  { value: "15K+", label: "Happy Customers" },
  { value: "98%", label: "Success Rate" },
  { value: "24h", label: "Avg. Response Time" }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] bg-gradient-to-r from-blue-100/30 to-purple-100/30 animate-[move 8s linear infinite] blur-3xl opacity-50" />
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-[0.03]" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <div className="flex flex-col items-center justify-center gap-6 max-w-5xl mx-auto">
            {/* Logo and Badge */}
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3">
                <Plane className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Missed Your Flight?
              </span>
              <br />
              <span className="mt-2 block">
                You're Owed Up to €600
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Check Your Eligibility Instantly.
              <span className="block mt-2 text-slate-500">
                No Win, No Fee – Get Your Compensation in 14 Days
              </span>
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>98% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>2 Minute Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>No Win, No Fee</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flight Check Form */}
        <div id="check-flight" className="mt-8">
          <FlightCheck onSuccess={() => user ? navigate('/claim') : navigate('/login')} />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm"
            >
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
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
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-6xl px-4 py-16"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Thousands</h2>
          <p className="text-slate-600">Here's what our customers say about us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}