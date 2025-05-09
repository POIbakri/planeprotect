import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CreditCard, Import as Passport, Plane, User, Mail, Phone, CheckCircle2, Info, BanknoteIcon, Building, Lock, Shield } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { formatFlightNumber } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitClaim, uploadDocument } from '@/lib/api';
import toast from 'react-hot-toast';

type Step = 'personal' | 'documents' | 'payment' | 'success';

// Helper function to get file name or default text
const getFileName = (file: File | null, defaultText: string) => {
  if (!file) return defaultText;
  // Truncate long file names
  return file.name.length > 30 ? `${file.name.substring(0, 27)}...` : file.name;
};

export function ClaimForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('ClaimForm received location.state:', location.state);
  const { flightNumber, flightDate, compensation } = location.state || {};
  console.log('ClaimForm destructured flightNumber:', flightNumber);

  // Add effect to check for required state and redirect if missing
  useEffect(() => {
    if (!flightNumber || !flightDate) {
      toast.error('Missing flight details. Please check your flight again.', { id: 'missing-flight-details' });
      navigate('/'); // Redirect to home or flight check page
    }
  }, [flightNumber, flightDate, navigate]);

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

  // Add validation for email, phone, and passport number
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Allow various phone formats with optional country codes
    const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,14}$/;
    return phoneRegex.test(phone);
  };

  const validatePassport = (passport: string): boolean => {
    // General passport format: 6-9 characters, alphanumeric
    const passportRegex = /^[A-Z0-9]{6,12}$/i;
    return passportRegex.test(passport);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof formData.documents) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      // Validate file types and size
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type. Use JPEG, PNG, or PDF.`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large (Max 5MB).`);
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, [type]: file },
      }));
      
      // Use a more specific success message
      toast.success(`${type === 'boardingPass' ? 'Boarding Pass' : type === 'bookingConfirmation' ? 'Booking Confirmation' : 'Passport/ID'} uploaded!`, {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
    }
  };

  const validateForm = (): boolean => {
    // Validate personal details
    if (step === 'personal') {
      if (!formData.fullName || formData.fullName.trim() === '') {
        toast.error('Please enter your full name');
        return false;
      }
      
      if (!formData.email || !validateEmail(formData.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
      
      if (!formData.phone || !validatePhone(formData.phone)) {
        toast.error('Please enter a valid phone number');
        return false;
      }
      
      if (!formData.passportNumber || !validatePassport(formData.passportNumber)) {
        toast.error('Please enter a valid passport number');
        return false;
      }
      
      if (!formData.consentGiven) {
        toast.error('Please accept the terms and consent to proceed');
        return false;
      }
    }
    
    // Validate documents
    if (step === 'documents') {
      if (!formData.documents.boardingPass) {
        toast.error('Please upload your boarding pass');
        return false;
      }
      
      if (!formData.documents.bookingConfirmation) {
        toast.error('Please upload your booking confirmation');
        return false;
      }
    }
    
    // Validate payment details
    if (step === 'payment') {
      if (!formData.bankAccount || formData.bankAccount.trim() === '') {
        toast.error('Please enter your bank account number');
        return false;
      }
      
      if (!formData.bankName || formData.bankName.trim() === '') {
        toast.error('Please enter your bank name');
        return false;
      }
      
      if (!formData.bankHolder || formData.bankHolder.trim() === '') {
        toast.error('Please enter the account holder name');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Validate payment details one more time
      if (!validateForm()) {
        return;
      }
      
      const loadingToast = toast.loading('Submitting your claim...');
      
      // Submit claim data
      const claim = await submitClaim({
        flightNumber,
        flightDate,
        compensationAmount: compensation,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        passportNumber: formData.passportNumber,
        // Pass bank details if collected at this step
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankHolder: formData.bankHolder,
      });

      // Upload documents
      const uploadPromises = Object.entries(formData.documents).map(([type, file]) => {
        if (file) {
          // Ensure 'type' matches the expected values for uploadDocument if different from DB
          // Assuming 'boarding_pass', 'booking_confirmation', 'passport'
          let docType: 'boarding_pass' | 'booking_confirmation' | 'passport' = 'passport'; // Default or map appropriately
          if (type === 'boardingPass') docType = 'boarding_pass';
          if (type === 'bookingConfirmation') docType = 'booking_confirmation';
          
          return uploadDocument(claim.id, file, docType); 
        }
        return Promise.resolve();
      });

      await Promise.all(uploadPromises);

      toast.dismiss(loadingToast);
      toast.success('Claim submitted successfully!');

      // Navigate to assignment form instead of dashboard
      navigate('/assignment-form', { 
        state: { 
          claimData: {
            claimId: claim.id,
            fullName: formData.fullName,
            bookingReference: location.state?.bookingReference || '',
            flightNumber: flightNumber,
            flightDate: flightDate,
            email: formData.email,
            phone: formData.phone,
            // Include bank details for possible address inference
            bankHolder: formData.bankHolder
          } 
        } 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit claim';
      toast.error(errorMessage);
      // Dismiss loading toast on error as well - needs ID which we don't have easily here
      // Consider refactoring toast usage if precise dismissal on error is needed
      // For now, rely on user seeing the error toast.
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    if (step === 'payment') {
      await handleSubmit();
    } else {
      setStep(step === 'personal' ? 'documents' : 'payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 'documents') setStep('personal');
    else if (step === 'payment') setStep('documents');
  };

  // Refined Step Indicator
  const renderStepIndicator = () => {
    const steps: { id: Step; name: string }[] = [
      { id: 'personal', name: 'Personal' },
      { id: 'documents', name: 'Documents' },
      { id: 'payment', name: 'Payment' },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-[#1D1D1F] mb-6">
          {step === 'personal' && 'Enter Your Details'}
          {step === 'documents' && 'Upload Required Documents'}
          {step === 'payment' && 'Provide Payment Information'}
          {step === 'success' && 'Claim Submitted'}
        </h2>
        {step !== 'success' && (
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {steps.map((s, index) => {
              const isActive = index <= currentStepIndex;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <span className={`mt-1 text-xs text-center ${isActive ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                      {s.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Personal Details Form - Refined Styling
  const renderPersonalDetails = () => (
    <motion.form
      key="personal"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5" // Adjusted spacing
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      {/* Flight Details Summary - Adjusted Style */}
      <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200/60 mb-6">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Plane className="w-4 h-4" />
          <span className="text-sm font-medium">Flight Summary</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Flight No:</span>
            <span className="font-medium text-gray-800 ml-1">{flightNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-800 ml-1">
              {flightDate ? new Date(flightDate).toLocaleDateString('en-GB') : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Your Data is Secure</h3>
            <p className="text-xs text-blue-700">
              Plane Protect Limited is fully GDPR compliant. We encrypt and securely store all personal information. Your data will only be used to process your claim and will never be sold to third parties.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Inputs with updated styling and icons */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="As shown on passport"
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
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+44 123 456 7890"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="passportNumber" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <Passport className="w-4 h-4 mr-2 text-gray-400" />
            Passport/ID Number
          </label>
          <Input
            id="passportNumber"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleInputChange}
            placeholder="Document number"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        {/* Legal Consent Section - Refined */}
        <div className="pt-4">
          <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentGiven"
                name="consentGiven"
                checked={formData.consentGiven}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                required
              />
              <label htmlFor="consentGiven" className="text-xs text-gray-700">
                 I authorize PlaneProtect to represent me in pursuing compensation for this flight disruption under applicable regulations (e.g., EC 261/2004). I confirm I'm the passenger (or have authority) and haven't received prior compensation for this. I understand PlaneProtect handles communications and potential legal action, and confirm my provided details are accurate. I agree to the Terms & Conditions.
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button - Updated Style */}
      <Button
        type="submit"
        variant="gradient"
        className="w-full h-12 rounded-lg text-base font-medium mt-6"
      >
        Next: Upload Documents
      </Button>
    </motion.form>
  );

  // Document Upload Section - Refined Styling
  const renderDocumentUpload = () => (
    <motion.div
      key="documents"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-emerald-800 mb-1">Documents Securely Stored</h3>
            <p className="text-xs text-emerald-700">
              All documents are encrypted and stored in compliance with GDPR requirements. We implement best-in-class security measures to protect your sensitive information. Documents are only accessed by authorized personnel involved in processing your claim.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* File Upload Area - Boarding Pass */}
        <div className={`border-2 border-dashed rounded-xl p-4 transition-colors group relative ${formData.documents.boardingPass ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-blue-500'}`}>
          <label htmlFor="boardingPassUpload" className="block cursor-pointer">
            <div className="flex items-center">
              <Upload className={`w-6 h-6 mr-3 flex-shrink-0 ${formData.documents.boardingPass ? 'text-green-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <div>
                <span className={`text-sm font-medium ${formData.documents.boardingPass ? 'text-green-800' : 'text-gray-700'}`}>Boarding Pass</span>
                <p className={`mt-0.5 text-xs ${formData.documents.boardingPass ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                  {getFileName(formData.documents.boardingPass, 'Click or drop PDF, JPG, PNG (Max 5MB)')}
                </p>
              </div>
            </div>
          </label>
          <input
            id="boardingPassUpload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'boardingPass')}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        {/* File Upload Area - Booking Confirmation */}
        <div className={`border-2 border-dashed rounded-xl p-4 transition-colors group relative ${formData.documents.bookingConfirmation ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-blue-500'}`}>
           <label htmlFor="bookingConfirmationUpload" className="block cursor-pointer">
            <div className="flex items-center">
              <CreditCard className={`w-6 h-6 mr-3 flex-shrink-0 ${formData.documents.bookingConfirmation ? 'text-green-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <div>
                <span className={`text-sm font-medium ${formData.documents.bookingConfirmation ? 'text-green-800' : 'text-gray-700'}`}>Booking Confirmation</span>
                 <p className={`mt-0.5 text-xs ${formData.documents.bookingConfirmation ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                  {getFileName(formData.documents.bookingConfirmation, 'Click or drop PDF, JPG, PNG (Max 5MB)')}
                </p>
              </div>
            </div>
          </label>
          <input
             id="bookingConfirmationUpload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'bookingConfirmation')}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        {/* File Upload Area - Passport/ID */}
        <div className={`border-2 border-dashed rounded-xl p-4 transition-colors group relative ${formData.documents.passport ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-blue-500'}`}>
           <label htmlFor="passportUpload" className="block cursor-pointer">
            <div className="flex items-center">
              <Passport className={`w-6 h-6 mr-3 flex-shrink-0 ${formData.documents.passport ? 'text-green-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <div>
                <span className={`text-sm font-medium ${formData.documents.passport ? 'text-green-800' : 'text-gray-700'}`}>Passport or ID (Optional)</span>
                 <p className={`mt-0.5 text-xs ${formData.documents.passport ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                  {getFileName(formData.documents.passport, 'Click or drop PDF, JPG, PNG (Max 5MB)')}
                </p>
              </div>
            </div>
          </label>
          <input
             id="passportUpload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'passport')}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      </div>

      {/* Navigation Buttons - Updated Style */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 rounded-lg order-1 sm:order-none border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          variant="gradient"
          className="flex-1 h-12 rounded-lg"
        >
          Next: Payment Details
        </Button>
      </div>
    </motion.div>
  );

  // Payment Details Form - Refined Styling
  const renderPaymentDetails = () => (
    <motion.form
      key="payment"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5" // Adjusted spacing
      onSubmit={(e) => {
        e.preventDefault();
        handleNext(); // Will trigger handleSubmit inside
      }}
    >
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
        <div className="flex items-start gap-3">
          <BanknoteIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 mb-1">Bank Details for Your Compensation</h3>
            <p className="text-xs text-amber-700">
              We collect your bank details solely to transfer your compensation payment when the claim is successful. Your financial information is encrypted and protected in accordance with financial security standards. We never store card details or use your bank information for any other purpose.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="bankName" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <Building className="w-4 h-4 mr-2 text-gray-400" /> {/* Changed Icon */}
            Bank Name
          </label>
          <Input
            id="bankName"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            placeholder="e.g., Monzo, Barclays, etc."
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="bankHolder" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <User className="w-4 h-4 mr-2 text-gray-400" /> {/* Changed Icon */}
            Account Holder Name
          </label>
          <Input
            id="bankHolder"
            name="bankHolder"
            value={formData.bankHolder}
            onChange={handleInputChange}
            placeholder="Full name on the account"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="bankAccount" className="flex items-center text-sm font-medium text-[#333] mb-1">
            <BanknoteIcon className="w-4 h-4 mr-2 text-gray-400" /> {/* Changed Icon */}
            IBAN / Account Number
          </label>
          <Input
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
            placeholder="Enter IBAN or Account Number & Sort Code"
            className="h-11 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            required
          />
        </div>
      </div>

      {/* Navigation Buttons - Updated Style */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 rounded-lg order-1 sm:order-none border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="gradient"
          className="flex-1 h-12 rounded-lg"
        >
          Submit Claim
        </Button>
      </div>
    </motion.form>
  );

  // Success Screen - Refined Styling
  const renderSuccess = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "backOut" }}
      className="text-center py-8 space-y-5" // Added padding
    >
      <motion.div
         initial={{ scale: 0 }} 
         animate={{ scale: 1 }} 
         transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
         className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg"
      >
        <CheckCircle2 className="w-9 h-9 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-800">Claim Submitted Successfully!</h3>
      <p className="text-sm text-gray-600 max-w-sm mx-auto">
        Thank you! We've received your claim details and documents. Our team will review everything and keep you updated via email.
      </p>
      <div className="pt-4">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="gradient"
          className="rounded-lg h-11 px-6 text-sm"
        >
          Go to My Dashboard
        </Button>
      </div>
    </motion.div>
  );

  // Main Component Return - Updated Container Style
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-md border border-gray-200/50">
        {renderStepIndicator()}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === 'personal' && renderPersonalDetails()}
            {step === 'documents' && renderDocumentUpload()}
            {step === 'payment' && renderPaymentDetails()}
            {step === 'success' && renderSuccess()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}