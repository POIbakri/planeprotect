import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CreditCard, Import as Passport, Plane, User, Mail, Phone, CheckCircle2, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { formatFlightNumber } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitClaim, uploadDocument } from '@/lib/api';
import toast from 'react-hot-toast';

type Step = 'personal' | 'documents' | 'payment' | 'success';

export function ClaimForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightNumber, flightDate, compensation } = location.state || {};

  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    bankAccount: '',
    bankName: '',
    bankHolder: '',
    consentGiven: false,
    documents: {
      boardingPass: null as File | null,
      bookingConfirmation: null as File | null,
      passport: null as File | null,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof formData.documents) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, [type]: e.target.files?.[0] },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit claim data
      const claim = await submitClaim({
        flightNumber,
        flightDate,
        compensationAmount: compensation,
        ...formData,
      });

      // Upload documents
      const uploadPromises = Object.entries(formData.documents).map(([type, file]) => {
        if (file) {
          return uploadDocument(claim.id, file, type as any);
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);
      
      setStep('success');
      toast.success('Claim submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit claim');
    }
  };

  const handleNext = async () => {
    if (step === 'personal' && !formData.consentGiven) {
      toast.error('Please accept the terms and consent to proceed');
      return;
    }

    if (step === 'payment') {
      await handleSubmit();
    } else {
      setStep(step === 'personal' ? 'documents' : 'payment');
    }
  };

  const handleBack = () => {
    if (step === 'documents') setStep('personal');
    else if (step === 'payment') setStep('documents');
  };

  const renderStepIndicator = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {step === 'personal' && 'Personal Details'}
        {step === 'documents' && 'Upload Documents'}
        {step === 'payment' && 'Payment Details'}
        {step === 'success' && 'Claim Submitted'}
      </h2>
      {step !== 'success' && (
        <div className="flex gap-2">
          {(['personal', 'documents', 'payment'] as const).map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                s === step
                  ? 'bg-blue-600'
                  : step === 'documents' && s === 'personal'
                  ? 'bg-blue-600'
                  : step === 'payment' && (s === 'personal' || s === 'documents')
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderPersonalDetails = () => (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      <div className="bg-slate-50 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 text-slate-600 mb-4">
          <Plane className="w-5 h-5" />
          <span className="font-medium">Flight Details</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Flight Number</label>
            <div className="font-semibold text-slate-900">{flightNumber || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Flight Date</label>
            <div className="font-semibold text-slate-900">
              {flightDate ? new Date(flightDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-600 mb-2">
          <User className="w-5 h-5" />
          <span className="font-medium">Personal Information</span>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="h-12 pl-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="h-12 pl-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="passportNumber" className="block text-sm font-medium text-slate-700">
            Passport Number
          </label>
          <div className="relative">
            <Passport className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="passportNumber"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleInputChange}
              placeholder="Enter your passport number"
              className="h-12 pl-12"
              required
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Info className="w-5 h-5" />
            <span className="font-medium">Legal Consent</span>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentGiven"
                name="consentGiven"
                checked={formData.consentGiven}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
              <label htmlFor="consentGiven" className="text-sm text-slate-700">
                I hereby authorize RefundHero to act as my representative in pursuing compensation under EC Regulation 261/2004 or other applicable regulations for my flight disruption claim. I confirm that I am the passenger or have the legal authority to act on behalf of the passenger, and I have not received any previous compensation for this claim. I understand that RefundHero will handle all communication with the airline and legal proceedings if necessary. I declare that all information provided is true and accurate.
              </label>
            </div>
            <p className="text-xs text-slate-500">
              By checking this box, you agree to our terms and conditions and authorize us to represent you in your compensation claim. You can revoke this authorization at any time by contacting us.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full h-12"
      >
        Continue to Documents
      </Button>
    </motion.form>
  );

  const renderDocumentUpload = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center transition-colors hover:border-blue-400 cursor-pointer group">
          <Upload className="w-8 h-8 mx-auto mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-slate-700">Boarding Pass</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'boardingPass')}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="mt-1 text-sm text-slate-500">
              {formData.documents.boardingPass
                ? formData.documents.boardingPass.name
                : 'Drop your file here or tap to upload'}
            </p>
          </label>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center transition-colors hover:border-blue-400 cursor-pointer group">
          <CreditCard className="w-8 h-8 mx-auto mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-slate-700">Booking Confirmation</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'bookingConfirmation')}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="mt-1 text-sm text-slate-500">
              {formData.documents.bookingConfirmation
                ? formData.documents.bookingConfirmation.name
                : 'Drop your file here or tap to upload'}
            </p>
          </label>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center transition-colors hover:border-blue-400 cursor-pointer group">
          <Passport className="w-8 h-8 mx-auto mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-slate-700">Passport or ID</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'passport')}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="mt-1 text-sm text-slate-500">
              {formData.documents.passport
                ? formData.documents.passport.name
                : 'Drop your file here or tap to upload'}
            </p>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 order-1 sm:order-none"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          variant="gradient"
          className="flex-1 h-12"
        >
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );

  const renderPaymentDetails = () => (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="bankName" className="block text-sm font-medium text-slate-700">
            Bank Name
          </label>
          <Input
            id="bankName"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            placeholder="Enter your bank name"
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bankHolder" className="block text-sm font-medium text-slate-700">
            Account Holder Name
          </label>
          <Input
            id="bankHolder"
            name="bankHolder"
            value={formData.bankHolder}
            onChange={handleInputChange}
            placeholder="Enter account holder name"
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700">
            IBAN / Account Number
          </label>
          <Input
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
            placeholder="Enter your IBAN or account number"
            className="h-12"
            required
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 order-1 sm:order-none"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="gradient"
          className="flex-1 h-12"
        >
          Submit Claim
        </Button>
      </div>
    </motion.form>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">Claim Submitted Successfully!</h3>
      <p className="text-slate-600">
        We've received your claim and will start processing it right away. You'll receive
        updates via email about the status of your claim.
      </p>
      <div className="pt-6">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="gradient"
          className="w-full sm:w-auto h-12"
        >
          View Claim Status
        </Button>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
        {renderStepIndicator()}
        <AnimatePresence mode="wait">
          {step === 'personal' && renderPersonalDetails()}
          {step === 'documents' && renderDocumentUpload()}
          {step === 'payment' && renderPaymentDetails()}
          {step === 'success' && renderSuccess()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}