import { motion } from 'framer-motion';
import { Plane, Award, Users, BadgeCheck, Globe, Shield, Lightbulb, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export function AboutUs() {
  return (
    <div className="py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Europe's Premier Flight Compensation Specialists
          </h1>
          <p className="text-xl text-[#6e6e73] max-w-3xl mx-auto">
            Since 2018, PlaneProtect has successfully recovered over €4.2 million for more than 24,000 passengers
            affected by flight disruptions. Our mission: to make claiming your legal entitlement straightforward, 
            transparent, and accessible for everyone.
          </p>
        </motion.div>

        {/* Company Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200"
                alt="Founders of PlaneProtect" 
                className="rounded-3xl relative shadow-md"
              />
              <div className="absolute -bottom-5 -right-5 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1D1D1F]">Est. 2018</div>
                    <div className="text-sm text-[#6e6e73]">London, UK</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#1D1D1F] mb-6">Our Story</h2>
            <div className="space-y-4 text-[#424245]">
              <p>
                PlaneProtect was founded in 2018 by a team of aviation industry veterans and legal specialists who 
                experienced firsthand the frustration of flight disruptions and the deliberately complex process of 
                claiming rightful compensation.
              </p>
              <p>
                We observed how airlines routinely make the claims process unnecessarily complicated, often deterring 
                eligible passengers from pursuing their legal entitlements under EU and UK regulations. In response, 
                we developed a premium service that combines specialized legal expertise with proprietary technology 
                to navigate these challenges with ease.
              </p>
              <p>
                Today, we proudly maintain an industry-leading 98% success rate. Our dedicated team of claims specialists 
                and aviation lawyers works tirelessly to ensure passengers receive every penny they deserve—completely 
                risk-free with our transparent success-based fee model of just 30%.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission & Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Our Values</h2>
            <p className="text-[#6e6e73] max-w-2xl mx-auto">
              These core principles guide our approach as we champion passenger rights across Europe and beyond.
            </p>
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
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-7 shadow-sm border border-white/50 group hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${value.color}-50 to-${value.color}-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <value.icon className={`w-7 h-7 text-${value.color}-600`} />
                </div>
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

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Our Leadership Team</h2>
            <p className="text-[#6e6e73] max-w-2xl mx-auto">
              Meet the experts dedicated to championing passenger rights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandra Richards",
                role: "CEO & Co-Founder",
                bio: "Former airline executive with 15+ years in the aviation industry and specialist expertise in EU and UK flight compensation legislation.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200"
              },
              {
                name: "James Bennett",
                role: "Legal Director",
                bio: "European aviation law expert with over a decade of experience successfully representing passengers in 5,000+ compensation cases.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200"
              },
              {
                name: "Sophia Chen",
                role: "CTO",
                bio: "Tech visionary who developed our industry-leading eligibility assessment platform and automated claims management system.",
                image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200"
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/50 flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-[2px]"></div>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-24 h-24 rounded-full relative border-2 border-white object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#1D1D1F]">{member.name}</h3>
                <p className="text-blue-600 mb-3">{member.role}</p>
                <p className="text-[#6e6e73]">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-12 overflow-hidden mb-20"
        >
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50"></div>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-md"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Our Impact</h2>
              <p className="text-[#6e6e73] max-w-2xl mx-auto">
                Our proven record of excellence in securing flight compensation under EU261 and UK261 regulations
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { value: "98%", label: "Success Rate", icon: Award },
                { value: "€4.2M", label: "Secured for Clients", icon: Shield },
                { value: "24,000+", label: "Happy Customers", icon: Users },
                { value: "14 Days", label: "Average Settlement", icon: Clock },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                    <stat.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-[#6e6e73]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[#1D1D1F] mb-6">Discover If You're Entitled to Compensation</h2>
          <p className="text-xl text-[#6e6e73] max-w-3xl mx-auto mb-8">
            Check your flight's eligibility in just 2 minutes. Whether your flight was delayed, cancelled, or you were denied boarding, 
            we'll quickly determine if you're entitled to up to €600 (EU) or £520 (UK) compensation. Free to check, with absolutely 
            no upfront fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gradient" 
              size="lg"
              className="rounded-full px-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Check My Flight Now
            </Button>
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full px-8"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 