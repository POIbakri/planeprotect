import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Clock, CheckCircle2, Shield, Star, ArrowRight, AlertCircle, BanknoteIcon, Mail, User, MessageSquare, Send } from 'lucide-react';
import { FlightCheck } from './FlightCheck';
import { HowItWorks } from './HowItWorks';
import { WhyPlaneProtect } from './WhyPlaneProtect';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Traveler",
    content: "With PlaneProtect, I received €600 for my delayed flight within just 11 days. Their process was remarkably simple.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Michael Chen",
    role: "Family Vacationer",
    content: "After our flight was cancelled, PlaneProtect secured £1,040 in compensation for my family. Truly exceptional service!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100",
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Emma Davis",
    role: "Frequent Flyer",
    content: "I've used PlaneProtect three times now. They handle everything, and I only pay when they win. It's brilliantly simple.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100",
    color: "from-teal-500 to-teal-600"
  }
];

const stats = [
  { value: "€4.2M+", label: "Compensation Secured", icon: BanknoteIcon, color: "bg-blue-50 text-blue-600" },
  { value: "24K+", label: "Satisfied Customers", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  { value: "98%", label: "Success Rate", icon: Star, color: "bg-amber-50 text-amber-600" },
  { value: "14 Days", label: "Avg. Settlement Time", icon: Clock, color: "bg-purple-50 text-purple-600" }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-[#F0F4FF] to-white overflow-hidden">
        {/* Enhanced background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-[0.03]" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000')`
            }}
          />
          
          {/* Enhanced animated elements */}
          <motion.div
            initial={{ x: "-100%", y: "30%" }}
            animate={{ x: "200%", y: "25%" }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent top-1/4 blur-sm opacity-80"
          />
          <motion.div
            initial={{ x: "-100%", y: "60%" }}
            animate={{ x: "200%", y: "55%" }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent top-1/3 blur-sm opacity-80"
          />
          <motion.div
            initial={{ x: "200%", y: "45%" }}
            animate={{ x: "-100%", y: "40%" }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute w-36 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent top-2/3 blur-sm opacity-80"
          />
          
          {/* Added floating color orbs */}
          <motion.div
            initial={{ x: "10%", y: "20%", opacity: 0.6 }}
            animate={{ x: "15%", y: "22%", opacity: 0.8 }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute w-16 h-16 rounded-full bg-blue-500 opacity-[0.07] blur-xl"
          />
          <motion.div
            initial={{ x: "70%", y: "30%", opacity: 0.5 }}
            animate={{ x: "65%", y: "28%", opacity: 0.7 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-full bg-purple-500 opacity-[0.07] blur-xl"
          />
          <motion.div
            initial={{ x: "25%", y: "70%", opacity: 0.5 }}
            animate={{ x: "30%", y: "72%", opacity: 0.7 }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute w-20 h-20 rounded-full bg-teal-500 opacity-[0.07] blur-xl"
          />
        </div>

        {/* Main hero content */}
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {/* Two-column layout for hero content - Reversed on mobile for better UX */}
          <div className="lg:flex items-start gap-6 lg:gap-12">
            {/* Left Column - Hero Message (shows first on mobile) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full lg:w-6/12 flex flex-col items-center lg:items-start lg:-mt-2 mb-8 lg:mb-0"
              id="check-flight"
            >
              {/* Main Headline - Improved text scaling */}
              <h1 className="text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-3xl sm:text-5xl lg:text-6xl font-medium text-[#1D1D1F] leading-tight tracking-tight"
                >
                  Flight disrupted?
                  <span className="block mt-1 text-3xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent font-semibold">
                    You're owed money.
                  </span>
                </motion.div>
              </h1>

              {/* Subheadline - Fixed width issues */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6 text-base sm:text-lg text-[#86868b] max-w-xl text-center lg:text-left leading-relaxed px-2 sm:px-0"
              >
                Get compensation of up to <span className="text-[#1D1D1F] font-medium">€600/£520</span> for delayed and cancelled flights. 
                <span className="block mt-2">It takes just 2 minutes to check — no win, no fee.</span>
              </motion.p>

              {/* Trust indicators - Enhanced with color */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 text-sm w-full justify-center lg:justify-start"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-[#1D1D1F]">98% Success Rate</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-[#1D1D1F]">2-Minute Check</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-full">
                  <Shield className="w-5 h-5 text-teal-500" />
                  <span className="font-medium text-[#1D1D1F]">Zero Upfront Fees</span>
                </div>
              </motion.div>
              
              {/* User Journey Steps - Enhanced with color */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-10 flex flex-col items-center lg:items-start w-full max-w-md mx-auto lg:mx-0"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 w-full border border-blue-100">
                  <h4 className="text-[#1D1D1F] font-medium mb-4 text-center lg:text-left">How it works</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white">1</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">Enter your flight details</p>
                        <p className="text-xs text-[#86868b]">Takes less than 2 minutes to complete</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-medium text-white">2</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">We check your eligibility</p>
                        <p className="text-xs text-[#86868b]">Instantly see if you qualify for compensation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-xs font-medium text-white">3</div>
                      <div>
                        <p className="text-sm text-[#1D1D1F] font-medium">Get paid</p>
                        <p className="text-xs text-[#86868b]">We handle all communications and pay you when successful</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-100 flex justify-between items-center">
                    <p className="text-xs text-[#86868b]">No win, no fee — only pay if we win</p>
                    <div className="flex items-center gap-1 text-purple-600 text-xs font-medium cursor-pointer group" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Arrow indicator - Improved visibility */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-8 flex lg:hidden justify-center w-full"
              >
                <div className="animate-bounce rounded-full p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Flight Check Form (shows second on mobile) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full lg:w-6/12"
            >
              <div className="bg-white rounded-[28px] shadow-lg overflow-hidden border border-gray-100 relative">
                {/* Added decorative elements */}
                <div className="absolute -right-10 -top-10 w-20 h-20 rounded-full bg-blue-100 opacity-40 blur-xl"></div>
                <div className="absolute -left-10 -bottom-10 w-20 h-20 rounded-full bg-purple-100 opacity-40 blur-xl"></div>
                
                <div className="p-5 sm:p-8 relative">
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
          </div>

          {/* Stats with enhanced design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 sm:mt-16 lg:mt-24"
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-50 overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center relative overflow-hidden group hover:z-10 transition-all duration-300">
                    {/* Background styling */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute inset-0 ${stat.color.split(' ')[0]} opacity-10`}></div>
                    </div>
                    
                    {/* Icon with colored background */}
                    <div className={`${stat.color} rounded-full p-2 mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#1D1D1F] mb-2 relative z-10">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[#86868b] relative z-10">{stat.label}</div>
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

      {/* Testimonials - enhanced with color gradients */}
      <div className="bg-gradient-to-br from-[#F5F5F7] to-[#F0F4FF]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24"
        >
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1D1D1F] mb-4">Trusted by Travelers</h2>
            <p className="text-[#86868b] text-base sm:text-lg max-w-xl mx-auto">Real stories from passengers we've helped secure compensation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-[24px] p-6 sm:p-8 shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Color accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${testimonial.color}`}></div>
                
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-full mr-4 overflow-hidden p-0.5 bg-gradient-to-br ${testimonial.color}`}>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full rounded-full object-cover"
                      loading="lazy"
                    />
                  </div>
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

          {/* Call To Action - Enhanced with more vibrant gradient */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-14 sm:mt-20 text-center"
          >
            <div className="max-w-xl mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-[28px] px-6 sm:px-10 py-8 sm:py-12 text-white shadow-xl relative overflow-hidden">
              {/* Added subtle decorative elements */}
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
              
              <h3 className="text-xl sm:text-2xl font-medium mb-4 relative z-10">Ready to claim your compensation?</h3>
              <p className="text-blue-50 mb-6 sm:mb-8 text-sm sm:text-base relative z-10">Check your eligibility in under 2 minutes. No upfront costs.</p>
              <a 
                href="#check-flight" 
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-blue-600 font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base relative z-10 hover:-translate-y-0.5"
              >
                Check Eligibility Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Contact Us Section */}
      <div id="contact-us" className="bg-white">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24"
        >
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1D1D1F] mb-4">Contact Us</h2>
            <p className="text-[#86868b] text-base sm:text-lg max-w-xl mx-auto">
              Have questions or need assistance? Our support team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[24px] p-6 sm:p-8 border border-blue-100/50 h-full">
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-2.5 mt-1">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1D1D1F] mb-1">Email Us</h4>
                      <a href="mailto:support@planeprotect.co.uk" className="text-blue-600 hover:underline">
                        support@planeprotect.co.uk
                      </a>
                      <p className="text-sm text-[#86868b] mt-1">
                        We aim to respond within 24 hours.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-2.5 mt-1">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1D1D1F] mb-1">Support Hours</h4>
                      <p className="text-[#1D1D1F]">Monday - Friday: 9am - 5pm</p>
                      <p className="text-sm text-[#86868b] mt-1">
                        Weekend emails are processed on Monday.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 rounded-full p-2.5 mt-1">
                      <Shield className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1D1D1F] mb-1">Claims Assistance</h4>
                      <p className="text-sm text-[#86868b]">
                        For assistance with existing claims, please include your claim ID when contacting us.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-blue-100">
                    <h4 className="font-medium text-[#1D1D1F] mb-3">Follow Us</h4>
                    <div className="flex gap-3">
                      <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                      <a href="#" className="bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white rounded-[24px] shadow-md border border-gray-100">
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">Send Us a Message</h3>
                  
                  <div className="space-y-4">
                    <form
                      action="https://formsubmit.co/support@planeprotect.co.uk"
                      method="POST"
                      className="space-y-4"
                    >
                      {/* FormSubmit configuration */}
                      <input type="hidden" name="_subject" value="Contact Form Submission - Landing Page" />
                      <input type="hidden" name="_captcha" value="false" />
                      <input type="hidden" name="_template" value="table" />
                      <input type="hidden" name="_next" value={window.location.href + "#contact-us-success"} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="name" className="flex items-center text-sm font-medium text-[#333] mb-1">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            Full Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                            required
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label htmlFor="email" className="flex items-center text-sm font-medium text-[#333] mb-1">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            Email Address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="subject" className="flex items-center text-sm font-medium text-[#333] mb-1">
                          <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                          Subject
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What is your message about?"
                          className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="message" className="flex items-center text-sm font-medium text-[#333] mb-1">
                          <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          placeholder="Please describe your issue or question in detail..."
                          className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm h-32 px-4 py-3 text-sm"
                          required
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="gradient"
                          className="w-full sm:w-auto h-11 rounded-lg font-medium"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}