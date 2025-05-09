import { motion } from 'framer-motion';
import { Scale, Shield, Zap, Award, Calculator, Clock, Users, BadgePercent } from 'lucide-react';

export function WhyPlaneProtect() {
  return (
    <div className="py-24 bg-gradient-to-b from-white to-[#F8F9FF] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 relative">
        {/* Background decorative elements */}
        <motion.div
          initial={{ opacity: 0.4 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-10 -right-20 w-64 h-64 rounded-full bg-blue-500 opacity-[0.03] blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0.3 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-500 opacity-[0.04] blur-3xl"
        />
      
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-5">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm font-medium inline-block">
              #1 Flight Compensation Service
            </div>
          </div>
          <h2 className="text-4xl font-semibold text-[#1D1D1F] mb-5">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Expert</span> in Flight Compensation
          </h2>
          <p className="text-[#86868b] max-w-2xl mx-auto text-xl">
            Industry-leading expertise in EU261 and UK261 flight compensation regulations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* EU Regulation Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[28px] p-8 overflow-hidden shadow-sm relative group hover:shadow-md transition-all duration-300"
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-400 opacity-[0.07] blur-xl transform group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-blue-300 opacity-[0.05] blur-lg"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full shadow-md">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-medium text-[#1D1D1F]">EU Regulation 261/2004</h3>
              </div>
              <ul className="space-y-5 text-[#424245]">
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Applicable to all flights departing from EU airports or EU airlines arriving in the EU</span>
                </li>
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Calculator className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to €600 based on flight distance and delay length</span>
                </li>
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Valid for claims within the past 6 years</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* UK Regulation Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-[28px] p-8 overflow-hidden shadow-sm relative group hover:shadow-md transition-all duration-300"
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-400 opacity-[0.07] blur-xl transform group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-purple-300 opacity-[0.05] blur-lg"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-full shadow-md">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-medium text-[#1D1D1F]">UK Regulation 261</h3>
              </div>
              <ul className="space-y-5 text-[#424245]">
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Covers flights departing from UK airports or UK airlines arriving in the UK</span>
                </li>
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Calculator className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">Compensation up to £520 for qualifying disruptions</span>
                </li>
                <li className="flex items-start gap-3 bg-white bg-opacity-60 p-3 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                  <span className="leading-relaxed">6-year claim window from flight date</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Key Benefits */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-5 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-full">
            <h3 className="text-gradient bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-medium">Why Choose PlaneProtect</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: BadgePercent,
              title: "Success-Based Fee",
              description: "Only 30% fee when we win your claim. If we don't secure your compensation, you pay nothing.",
              delay: 0.1,
              color: "from-blue-500 to-blue-600",
              bgColor: "from-blue-50 to-blue-100"
            },
            {
              icon: Zap,
              title: "Fast Assessment",
              description: "2-minute eligibility check with our AI-powered system. Get an instant decision on your claim.",
              delay: 0.2,
              color: "from-purple-500 to-purple-600",
              bgColor: "from-purple-50 to-purple-100"
            },
            {
              icon: Award,
              title: "Industry-Leading Success",
              description: "98% success rate with over €4.2 million secured for our clients in the last year alone.",
              delay: 0.3,
              color: "from-teal-500 to-teal-600",
              bgColor: "from-teal-50 to-teal-100"
            },
            {
              icon: Users,
              title: "Complete Representation",
              description: "Our legal experts handle all airline negotiations and legal procedures on your behalf.",
              delay: 0.4,
              color: "from-amber-500 to-amber-600",
              bgColor: "from-amber-50 to-amber-100"
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: benefit.delay, duration: 0.5 }}
              className={`bg-gradient-to-br ${benefit.bgColor} rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Decorative corner accent */}
              <div className={`absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${benefit.color} opacity-10 blur-lg group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-5 shadow-md`}>
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg font-medium text-[#1D1D1F] mb-3">
                {benefit.title}
              </h4>
              <p className="text-[#6e6e73] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 bg-gradient-to-br from-[#F5F9FF] to-[#F6F5FF] rounded-[28px] p-10 shadow-md relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400 opacity-[0.03] blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-400 opacity-[0.03] blur-xl"></div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 relative z-10">
            {[
              { label: "Success Rate", value: "98%", color: "text-blue-600", bgColor: "bg-blue-50", icon: BadgePercent },
              { label: "Average Claim", value: "€450", color: "text-purple-600", bgColor: "bg-purple-50", icon: Calculator },
              { label: "Average Time", value: "14 Days", color: "text-teal-600", bgColor: "bg-teal-50", icon: Clock },
              { label: "Satisfied Clients", value: "24,000+", color: "text-amber-600", bgColor: "bg-amber-50", icon: Users },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-semibold text-[#1D1D1F] mb-1">{stat.value}</div>
                <div className="text-[#6e6e73]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}