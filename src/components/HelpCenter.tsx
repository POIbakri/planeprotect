import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is RefundHero?',
        a: 'RefundHero is a service that helps air passengers claim compensation for flight delays, cancellations, and overbooking under EU Regulation 261/2004. We handle the entire claims process on your behalf.',
      },
      {
        q: 'How much does it cost?',
        a: 'We operate on a "No Win, No Fee" basis. We only charge a 35% commission (including VAT) if we successfully secure your compensation. If we don\'t win your claim, you don\'t pay anything.',
      },
      {
        q: 'How much compensation can I get?',
        a: 'Under EU261, you can receive up to €600 depending on your flight distance and the length of delay. Short flights (up to 1,500km) qualify for €250, medium flights (1,500-3,500km) for €400, and long flights (over 3,500km) for €600.',
      },
    ],
  },
  {
    category: 'Eligibility',
    questions: [
      {
        q: 'Which flights are covered?',
        a: 'Your flight is covered if it departs from an EU airport, or arrives at an EU airport on an EU-based airline. The disruption must have occurred within the last 6 years.',
      },
      {
        q: 'How long must my flight be delayed?',
        a: 'Your flight must be delayed by at least 3 hours at your final destination to be eligible for compensation.',
      },
      {
        q: 'What if my flight was cancelled?',
        a: 'If your flight was cancelled less than 14 days before departure, you may be entitled to compensation unless the airline can prove extraordinary circumstances.',
      },
    ],
  },
  {
    category: 'Claims Process',
    questions: [
      {
        q: 'How long does the claims process take?',
        a: 'Most claims are resolved within 2-3 months, but it can take longer if the airline disputes the claim or if legal action is required.',
      },
      {
        q: 'What documents do I need?',
        a: 'You\'ll need your booking confirmation, boarding pass (if available), and a copy of your passport or ID. We\'ll guide you through uploading these documents.',
      },
      {
        q: 'How do I track my claim?',
        a: 'You can track your claim\'s progress through your RefundHero dashboard. We\'ll also send you email updates at each stage of the process.',
      },
    ],
  },
];

export function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('General');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          How can we help?
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search for answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-lg"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
          <HelpCircle className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">FAQs</h3>
          <p className="text-slate-600 mb-4">Find answers to common questions about our service.</p>
          <Button variant="outline" className="w-full">
            Browse FAQs
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
          <Mail className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Email Support</h3>
          <p className="text-slate-600 mb-4">Get help from our support team via email.</p>
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
          <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
          <p className="text-slate-600 mb-4">Chat with our support team in real-time.</p>
          <Button variant="outline" className="w-full">
            Start Chat
          </Button>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {filteredFaqs.map((category) => (
              <div key={category.category} className="border rounded-lg">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-slate-50"
                >
                  {category.category}
                  {expandedCategory === category.category ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedCategory === category.category && (
                  <div className="border-t">
                    {category.questions.map((faq) => (
                      <div key={faq.q} className="border-b last:border-b-0">
                        <button
                          onClick={() => toggleQuestion(faq.q)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-900">{faq.q}</span>
                          {expandedQuestions.includes(faq.q) ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        
                        {expandedQuestions.includes(faq.q) && (
                          <div className="px-4 pb-4 text-slate-600">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="mb-6 opacity-90">
            Our support team is available 24/7 to assist you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}