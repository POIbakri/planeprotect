import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CalendarIcon, Download, Pen, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { uploadAssignmentForm } from '@/lib/api/claims';

// Signature pad component
const SignaturePad = ({ onChange }: { onChange: (signature: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    
    // Get the correct position for both mouse and touch events
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the correct position for both mouse and touch events
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    
    onChange(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="border border-gray-300 rounded-md bg-[#FFF9F0] w-full h-24"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      {hasSignature && (
        <button
          onClick={clearSignature}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
          aria-label="Clear signature"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
        <Pen className="w-4 h-4" />
        <span>Sign above</span>
      </div>
    </div>
  );
};

export function AssignmentForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [signature, setSignature] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    bookingReference: '',
    address: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // Prefill form data if passed through location state
    if (location.state?.claimData) {
      const { 
        fullName, 
        bookingReference, 
        flightNumber,
        flightDate,
        email,
        phone,
        bankHolder 
      } = location.state.claimData;
      
      // Set basic form fields
      setFormData(prev => ({
        ...prev,
        fullName: fullName || '',
        bookingReference: bookingReference || flightNumber || '',
        // Don't set address as we want the user to provide their full address
      }));
      
      // If we have no claim data, redirect back to dashboard
      if (!fullName) {
        toast.error('No claim data found. Please start a new claim.');
        navigate('/dashboard');
      }
    }
  }, [location.state, navigate]);

  // Validate form data
  useEffect(() => {
    const { fullName, bookingReference, address } = formData;
    // Check for proper address format - at least 10 chars with numbers and letters
    const isValidAddress = address.length >= 10 && /\d/.test(address) && /[a-zA-Z]/.test(address);
    setIsFormFilled(!!fullName && !!bookingReference && isValidAddress && !!signature);
  }, [formData, signature]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
  };

  const generatePDF = async () => {
    if (!formRef.current || !isFormFilled || formSubmitted) return;

    setFormSubmitted(true); // Prevent double submission
    const loadingToast = toast.loading('Generating assignment form...');
    
    try {
      // Capture the form as an image
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions from canvas
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If the content is longer than one page, add more pages
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft >= pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Get the PDF as a blob
      const pdfBlob = pdf.output('blob');
      const fileName = `Assignment_Form_${formData.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      
      // Generate download link for user
      const url = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.click();
      URL.revokeObjectURL(url);

      // Upload to server if we have a claim ID
      const claimId = location.state?.claimData?.claimId;
      
      if (!claimId) {
        throw new Error('Claim ID not found. Cannot upload assignment form.');
      }
      
      // Upload the assignment form to the server
      const assignmentFormUrl = await uploadAssignmentForm(claimId, pdfBlob, fileName);
      
      toast.dismiss(loadingToast);
      toast.success('Assignment form generated and submitted successfully!');
      
      // Navigate to dashboard
      navigate('/dashboard', { 
        state: { 
          assignmentFormSubmitted: true,
          assignmentFormUrl: assignmentFormUrl
        } 
      });
    } catch (error) {
      setFormSubmitted(false); // Allow resubmission if there was an error
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate assignment form';
      toast.error(errorMessage);
      console.error('PDF generation error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Assignment Form
          </h1>
          <p className="text-slate-600 text-sm">
            Please complete and sign this form to authorize Plane Protect Limited to represent you
          </p>
        </div>
        
        <div className="mt-8">
          <div 
            ref={formRef} 
            className="bg-white p-6 rounded-xl"
          >
            <div className="text-2xl font-medium text-emerald-600 mb-6">Assignment form</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  First name and Last name (the "Client")
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Booking reference
                </label>
                <input
                  type="text"
                  name="bookingReference"
                  value={formData.bookingReference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Booking reference number"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md bg-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.address && formData.address.length < 10 ? 
                    'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your full address including postal code"
                required
              />
              {formData.address && formData.address.length < 10 && (
                <p className="text-xs text-red-500 mt-1">Please enter your complete address including postal code</p>
              )}
            </div>
            
            <div className="text-sm text-gray-700 space-y-4 mb-6">
              <p>
                The Client hereby assigns to Plane Protect Limited full ownership and legal title to his/her Claim pursuant to Regulation 261/04 and the Montreal Convention 1999 in relation to the above operated flight(s) identified by the booking reference pursuant to the T&C.
              </p>
              
              <p>
                The Client authorizes Plane Protect Limited to request the operating carrier not to process his/her personal data in relation to the Claim pursuant to applicable personal data protection laws, except only to verify the Claim.
              </p>
              
              <p>
                The Client understands that this means that he/she cannot accept any direct contact or payment from the operating carrier.
              </p>
              
              <p>
                If the assignment pursuant to this assignment form is declared invalid for any reason, the assignment form shall be considered a power of attorney granted by the Client to Plane Protect Limited, pursuant to which Plane Protect Limited is granted exclusive power, with full substitution right, to:
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>represent the Client legally before third parties in relation to the Claim;</li>
                <li>obtain every type of information required, as well as to initiate information requests with respect to any civil or administrative law proceeding and to initiate complaints with the respective courts or administrative bodies responsible for the enforcement of air passenger rights regulation on behalf of the Client;</li>
                <li>initiate, conduct and undertake every type of negotiations as well as legal - judicial and extrajudicial - measures appropriate to collect Client's Claim from the operating carrier;</li>
                <li>request the operating carrier not to process his/her personal data in relation to the Claim pursuant to applicable personal data protection laws, except only to verify the Claim;</li>
                <li>collect and receive payments in relation to the Claim on the Client's behalf.</li>
              </ul>
              
              <p>
                The Client understands that this means that he/she cannot accept any direct contact or payment from the operating carrier.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Signature
                </label>
                <SignaturePad onChange={handleSignatureChange} />
                {!signature && (
                  <p className="text-xs text-amber-600 mt-1">Please sign by drawing in the box above</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4 mb-4">
              * The defined terms in this Assignment Form shall have the same meaning as provided for in the Terms and Conditions
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 mt-8">
              <div>
                Got questions? Ask here <a href="mailto:support@planeprotect.co.uk" className="text-emerald-600">support@planeprotect.co.uk</a>
              </div>
              <div>
                <a href="https://planeprotect.co.uk" className="text-emerald-600">www.planeprotect.co.uk</a>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              Mailing Address: Plane Protect Limited, 49 Lexington Street, London, W1F 9AP, United Kingdom<br />
              Corporate Address: Plane Protect Limited, 49 Lexington Street, London, W1F 9AP, United Kingdom
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            Go Back
          </Button>
          
          <Button
            variant="gradient"
            onClick={generatePDF}
            disabled={!isFormFilled || formSubmitted}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate & Submit Form
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 