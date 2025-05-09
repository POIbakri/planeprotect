import { motion } from 'framer-motion';
import { Plane, Award, Users, BadgeCheck, Shield, Lightbulb, Clock, Star, MessageSquare, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useState, ReactNode } from 'react';

// Animated number counter component for statistics
const AnimatedCounter = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1"
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, type: "spring" }}
      >
        {value}{suffix}
      </motion.span>
    </motion.div>
  );
};

// Accordion component for FAQs
const AccordionItem = ({ title, children }: { title: string; children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-[#1D1D1F]">{title}</h3>
        {isOpen ? 
          <ChevronUp className="w-5 h-5 text-blue-600" /> : 
          <ChevronDown className="w-5 h-5 text-blue-600" />
        }
      </button>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 pb-2 text-[#6e6e73]">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export function AboutUs() {
  // Sections visible state for revealing animations
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="py-16 relative overflow-hidden">
      {/* Enhanced Background elements */}
      <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
      <div className="absolute top-[60%] left-[20%] w-64 h-64 bg-amber-100/20 rounded-full blur-2xl" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Hero Section - Enhanced with parallax effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              Europe's Premier Flight Compensation Specialists
            </h1>
          </motion.div>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-xl text-[#6e6e73] max-w-3xl mx-auto"
          >
            Since 2024, PlaneProtect has successfully recovered over €4.2 million for more than 24,000 passengers
            affected by flight disruptions. Our mission: to make claiming your legal entitlement straightforward, 
            transparent, and accessible for everyone.
          </motion.p>
          
          {/* Call-to-action button in hero section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-12"
          >
            <Link to="/">
              <Button 
                variant="gradient" 
                size="lg"
                className="rounded-full px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-lg font-medium"
              >
                Check My Flight Eligibility
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Statistics - Enhanced with counter animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-12 overflow-hidden mb-24"
        >
          {/* Enhanced background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50"></div>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-md"></div>
          <motion.div 
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Our Impact</h2>
              <p className="text-[#6e6e73] max-w-2xl mx-auto">
                Our proven record of excellence in securing flight compensation under EU261 and UK261 regulations
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { value: "98", suffix: "%", label: "Success Rate", icon: Award },
                { value: "€4.2", suffix: "M", label: "Secured for Clients", icon: Shield },
                { value: "24,000", suffix: "+", label: "Happy Customers", icon: Users },
                { value: "14", suffix: " Days", label: "Average Settlement", icon: Clock },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <motion.div 
                    className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <div className="text-[#6e6e73] font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Animated Client Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 py-10 px-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl text-[#6e6e73] font-medium">Trusted by Passengers Flying with</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
            {["British Airways", "Lufthansa", "Air France", "Ryanair", "EasyJet"].map((airline, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grayscale hover:grayscale-0 transition-all duration-300"
              >
                <div className="font-bold text-2xl text-[#424245]">{airline}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Values - Enhanced with interactive cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#1D1D1F] mb-6"
            >
              Our Values
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#6e6e73] max-w-2xl mx-auto"
            >
              These core principles guide our approach as we champion passenger rights across Europe and beyond.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description: "We maintain the highest ethical standards and only pursue claims with legitimate merit under EU261 and UK261 regulations.",
                color: "blue",
                delay: 0.1,
              },
              {
                icon: BadgeCheck,
                title: "Transparency",
                description: "Our straightforward 30% success fee model means no hidden costs, no upfront charges, and complete visibility throughout your claim.",
                color: "purple",
                delay: 0.2,
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                description: "Our proprietary technology and streamlined processes deliver the fastest possible claim resolution while maximizing your compensation.",
                color: "amber",
                delay: 0.3,
              },
              {
                icon: Users,
                title: "Client Focus",
                description: "Your peace of mind is our priority. Our specialists handle every aspect of your claim, from initial assessment to final payment.",
                color: "emerald",
                delay: 0.4,
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: value.delay, duration: 0.5 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-sm border border-white/50 group hover:shadow-md transition-all duration-300 ${hoveredCard === index ? 'scale-105' : ''}`}
              >
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${value.color}-50 to-${value.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  animate={{ rotate: hoveredCard === index ? 5 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <value.icon className={`w-8 h-8 text-${value.color}-600`} />
                </motion.div>
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3">
                  {value.title}
                </h3>
                <p className="text-[#6e6e73] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1D1D1F] mb-6">What Our Clients Say</h2>
            <p className="text-xl text-[#6e6e73] max-w-2xl mx-auto">
              Real experiences from real passengers we've helped recover compensation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "After my flight was cancelled with just 2 hours notice, PlaneProtect secured me €600 compensation within 12 days. Their process was incredibly easy.",
                author: "Sarah T.",
                location: "Manchester, UK",
                stars: 5,
                delay: 0.1
              },
              {
                quote: "The airline rejected my initial claim, but PlaneProtect's legal team took over and won my case. I received £520 compensation without any hassle.",
                author: "Michael D.",
                location: "Dublin, Ireland",
                stars: 5,
                delay: 0.2
              },
              {
                quote: "Professional service from start to finish. Their team kept me informed throughout the process and secured compensation for our family of four.",
                author: "Luisa M.",
                location: "Madrid, Spain",
                stars: 5,
                delay: 0.3
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: testimonial.delay, duration: 0.6 }}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-white/50 flex flex-col h-full"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex-grow">
                  <p className="text-[#424245] italic mb-6 leading-relaxed text-lg">"{testimonial.quote}"</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-semibold text-[#1D1D1F]">{testimonial.author}</p>
                  <p className="text-sm text-[#6e6e73]">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/testimonials" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg">
              View more client testimonials
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1D1D1F] mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-[#6e6e73] max-w-2xl mx-auto">
              Everything you need to know about our flight compensation service
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-10 shadow-sm">
            <AccordionItem title="How much compensation am I entitled to?">
              <p>
                Under EU Regulation 261/2004 and UK261, you may be entitled to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>€250/£220 for flights up to 1,500km</li>
                <li>€400/£350 for flights between 1,500km and 3,500km</li>
                <li>€600/£520 for flights over 3,500km</li>
              </ul>
              <p className="mt-2">
                The exact amount depends on your flight distance, delay duration, and the specific circumstances of your disruption.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How long does the claims process take?">
              <p>
                On average, our clients receive their compensation within 14 days of submitting their claim. However, if the airline disputes the claim and legal action is required, the process can take 2-3 months. Rest assured, our legal team handles everything for you.
              </p>
            </AccordionItem>
            
            <AccordionItem title="What is your success fee?">
              <p>
                We operate on a simple, transparent success fee model: 30% of the compensation amount (including VAT) only if we win your case. There are no upfront costs or hidden fees, and if we don't secure your compensation, you pay absolutely nothing.
              </p>
            </AccordionItem>
            
            <AccordionItem title="Which flights are eligible for compensation?">
              <p>
                Flights are eligible if:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your flight departed from an EU/UK airport, or arrived at an EU/UK airport on an EU/UK-based airline</li>
                <li>You experienced a delay of 3+ hours, a cancellation, or were denied boarding</li>
                <li>The disruption was within the airline's control (not extraordinary circumstances like extreme weather)</li>
                <li>Your flight was within the last 6 years</li>
              </ul>
            </AccordionItem>
            
            <AccordionItem title="What documents do I need to make a claim?">
              <p>
                To start your claim, we just need your:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Booking reference or e-ticket number</li>
                <li>Flight details (date, flight number, departure/arrival airports)</li>
                <li>Brief description of the disruption</li>
              </ul>
              <p className="mt-2">
                We'll handle all communication with the airline and gather any additional evidence required to strengthen your case.
              </p>
            </AccordionItem>
          </div>
        </motion.div>

        {/* Contact CTA - Enhanced with animated gradient background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center relative overflow-hidden rounded-3xl p-16"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-purple-50/70"></div>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          <motion.div 
            className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"
            animate={{ 
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#1D1D1F] mb-8"
            >
              Discover If You're Entitled to Compensation
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#6e6e73] max-w-3xl mx-auto mb-12"
            >
              Check your flight's eligibility in just 2 minutes. Whether your flight was delayed, cancelled, or you were denied boarding, 
              we'll quickly determine if you're entitled to up to €600 (EU) or £520 (UK) compensation. Free to check, with absolutely 
              no upfront fees.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/">
                <Button 
                  variant="gradient" 
                  size="lg"
                  className="rounded-full px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-xl font-medium"
                >
                  Check My Flight Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-10 py-7 border-2 text-xl font-medium"
                >
                  Contact Our Team
                  <MessageSquare className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 