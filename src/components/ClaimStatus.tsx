import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, BanknoteIcon, Copy, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getClaimStatus } from '@/lib/api';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Claim, ClaimStatus as ClaimStatusType } from '@/lib/types';

type Status = 'pending' | 'in-review' | 'approved' | 'paid';

interface StatusStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: Status;
}

const statusSteps: StatusStep[] = [
  {
    title: 'Claim Submitted',
    description: 'Your claim has been received and is pending review',
    icon: <Clock className="w-6 h-6" />,
    status: 'pending',
  },
  {
    title: 'Under Review',
    description: 'Airline is reviewing your claim',
    icon: <AlertCircle className="w-6 h-6" />,
    status: 'in-review',
  },
  {
    title: 'Claim Approved',
    description: 'Your compensation has been approved',
    icon: <CheckCircle2 className="w-6 h-6" />,
    status: 'approved',
  },
  {
    title: 'Payment Sent',
    description: 'Compensation has been transferred to your account',
    icon: <BanknoteIcon className="w-6 h-6" />,
    status: 'paid',
  },
];

export function ClaimStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format claim id for display
  const formattedClaimId = id ? `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}` : '';

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        if (!id) {
          setError('No claim ID provided');
          setLoading(false);
          return;
        }
        
        const data = await getClaimStatus(id);
        
        if (!data) {
          setError('Claim not found');
          setLoading(false);
          return;
        }
        
        setClaim(data);
      } catch (error) {
        console.error('Error fetching claim:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch claim status');
        toast.error('Failed to fetch claim status');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id, navigate]);
  
  const copyClaimIdToClipboard = () => {
    if (id) {
      navigator.clipboard.writeText(id)
        .then(() => toast.success('Claim ID copied to clipboard'))
        .catch(() => toast.error('Failed to copy claim ID'));
    }
  };
  
  // Handle retry functionality
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Reload the page to trigger a fresh API call
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-slate-600">Loading claim details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto px-4 sm:px-0"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-red-50 rounded-full p-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Error Loading Claim
            </h2>
            <p className="text-slate-600 mb-6">
              {error}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={handleRetry}
                className="flex-1"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!claim) {
    return null;
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.status === claim.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-white/20">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Claim Status
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
          </div>
          
          <div className="mt-6 bg-slate-50 rounded-xl p-4 space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Claim Reference</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{formattedClaimId}</span>
                <button 
                  onClick={copyClaimIdToClipboard}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Copy claim ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Submitted On</span>
              <span className="font-semibold text-slate-900">{formatDate(claim.created_at)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Flight</span>
              <span className="font-semibold text-slate-900">{claim.flight_number}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Flight Date</span>
              <span className="font-semibold text-slate-900">{formatDate(claim.flight_date)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Compensation</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(claim.compensation_amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Processing Time</span>
              <span className="font-semibold text-slate-900">
                {claim.status === 'pending' ? '14 days' : '7 days'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.status}
                className={`flex items-start gap-4 ${
                  isCompleted ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-grow pt-1">
                  <h3
                    className={`font-semibold ${
                      isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {step.description}
                  </p>
                  {isCurrent && (
                    <div className="mt-3">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {claim.status === 'in-review' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
            <p className="flex items-start gap-2">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                Your claim is currently being reviewed by the airline. This process typically takes 
                7-10 business days. We'll update you via email when there's any progress.
              </span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}