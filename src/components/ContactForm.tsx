import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, Phone, User, Send, MessageSquare, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface ContactFormProps {
  claimId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function ContactForm({ claimId, onClose, isModal = false }: ContactFormProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    claimId: claimId || '',
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.full_name || '',
        claimId: claimId || '',
      }));
    }
  }, [user, claimId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return false;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Using FormSubmit.co - completely free with no signup required
      const response = await fetch('https://formsubmit.co/support@planeprotect.co.uk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `[PlaneProtect] ${formData.subject} ${formData.claimId ? `(Claim ID: ${formData.claimId})` : ''}`,
          _captcha: 'false', // Disable captcha for better UX (enable in production if spam becomes an issue)
        }),
      });
      
      if (response.ok) {
        toast.success('Your message has been sent successfully!');
        setFormData({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: '',
          subject: '',
          message: '',
          claimId: claimId || '',
        });
        if (onClose) onClose();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
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
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="phone" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            Phone Number (Optional)
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+44 123 456 7890"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="claimId" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <FileText className="w-4 h-4 mr-2 text-gray-400" />
            Claim ID (Optional)
          </label>
          <Input
            id="claimId"
            name="claimId"
            value={formData.claimId}
            onChange={handleChange}
            placeholder="Your claim ID (if applicable)"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
          value={formData.subject}
          onChange={handleChange}
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
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe your issue or question in detail..."
          className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm h-32 px-4 py-3 text-sm"
          required
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-2">
        <div className="text-sm text-gray-500 flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <span>Or email us directly at <a href="mailto:support@planeprotect.co.uk" className="text-blue-600 font-medium hover:underline">support@planeprotect.co.uk</a></span>
        </div>
        
        <Button
          type="submit"
          variant="gradient"
          className="w-full sm:w-auto h-11 rounded-lg font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg p-6 max-w-[90%] w-full md:w-[700px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#1D1D1F] flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Contact Support
          </h2>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Have questions or need assistance? Fill out the form below and our support team will get back to you as soon as possible.
        </p>
        
        {renderForm()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-gray-100"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-blue-500" />
          Contact Us
        </h2>
        <p className="text-gray-600">
          Have questions or need assistance? Fill out the form below and our support team will get back to you as soon as possible.
        </p>
      </div>
      
      {renderForm()}
    </motion.div>
  );
} 