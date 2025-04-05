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
        a: 'RefundHero is the world\'s leading flight compensation service, helping passengers secure compensation for flight delays, cancellations, and denied boarding under EU261 and UK261 regulations. Our premium service handles the entire claims process so you don\'t have to deal with airlines directly.',
      },
      {
        q: 'How much does it cost?',
        a: 'Our service is completely free to check and claim. We operate on a "No Win, No Fee" basis with a competitive 30% success fee (including VAT) only if we secure your compensation. If we don\'t win your claim, you don\'t pay a penny—zero risk to you.',
      },
      {
        q: 'How much compensation can I get?',
        a: 'Under EU261, you can receive up to €600 based on flight distance and delay length. Short flights (up to 1,500km) receive €250, medium flights (1,500-3,500km) €400, and long flights (over 3,500km) €600. Under UK261, the amounts are £220, £350, and £520 respectively.',
      },
    ],
  },
  {
    category: 'Eligibility',
    questions: [
      {
        q: 'Which flights are covered?',
        a: 'Under EU261: All flights departing from EU airports (any airline) or arriving at EU airports (EU airlines only). Under UK261: All flights departing from UK airports (any airline) or arriving at UK airports (UK airlines only). Claims must be filed within 6 years of the disruption.',
      },
      {
        q: 'How long must my flight be delayed?',
        a: 'Your flight must be delayed by at least 3 hours at your final destination to qualify for compensation. Our advanced AI system can instantly verify your eligibility with 99.8% accuracy.',
      },
      {
        q: 'What if my flight was cancelled?',
        a: 'If your flight was cancelled with less than 14 days\' notice, you\'re likely entitled to compensation unless the airline can prove extraordinary circumstances beyond their control. Our legal experts are particularly skilled at challenging airline\'s "extraordinary circumstances" claims.',
      },
    ],
  },
  {
    category: 'Claims Process',
    questions: [
      {
        q: 'How long does the claims process take?',
        a: 'Our industry-leading average settlement time is just 14 days, though some claims may take longer if airlines dispute the claim. Thanks to our proprietary claim management system, we resolve claims significantly faster than industry standards.',
      },
      {
        q: 'What documents do I need?',
        a: 'You\'ll need your booking confirmation, boarding pass (if available), and identification document. Our premium digital upload system makes document submission quick and secure, with 128-bit encryption for your data protection.',
      },
      {
        q: 'How do I track my claim?',
        a: 'Access your personalized RefundHero dashboard for real-time updates on your claim\'s progress. Our transparent process keeps you informed at every stage, and our customer support team is available 24/7 to address any questions.',
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
          Premium Support Center
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Get expert answers to your questions or connect with our dedicated support team.
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
          <h3 className="text-lg font-semibold mb-2">Expert FAQs</h3>
          <p className="text-slate-600 mb-4">Find detailed answers from our compensation specialists.</p>
          <Button variant="outline" className="w-full">
            Browse FAQs
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
          <Mail className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
          <p className="text-slate-600 mb-4">Get personalized assistance from our customer service team.</p>
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
          <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">24/7 Live Chat</h3>
          <p className="text-slate-600 mb-4">Connect with a compensation expert in real-time.</p>
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
          <h2 className="text-2xl font-bold mb-4">Need Personalized Assistance?</h2>
          <p className="mb-6 opacity-90">
            Our premium support team is available 24/7 to help maximize your compensation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              <Mail className="w-4 h-4 mr-2" />
              Priority Support
            </Button>
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              <MessageCircle className="w-4 h-4 mr-2" />
              Expert Chat
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}