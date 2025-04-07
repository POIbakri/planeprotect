import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, BanknoteIcon, Copy, FileText, Hash, CalendarDays, Plane, PiggyBank, Activity } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getClaimStatus } from '@/lib/api';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Claim } from '@/lib/types';

type Status = 'pending' | 'in-review' | 'approved' | 'rejected' | 'paid' | 'archived';

interface StatusStep {
  title: string;
  description: string;
  icon: React.ElementType;
  status: Status;
}

const statusSteps: StatusStep[] = [
  {
    title: 'Claim Submitted',
    description: 'Received and pending review',
    icon: Clock,
    status: 'pending',
  },
  {
    title: 'Under Review',
    description: 'Airline reviewing claim details',
    icon: Activity,
    status: 'in-review',
  },
  {
    title: 'Claim Approved',
    description: 'Compensation amount approved',
    icon: CheckCircle2,
    status: 'approved',
  },
  {
    title: 'Payment Sent',
    description: 'Compensation transferred',
    icon: BanknoteIcon,
    status: 'paid',
  },
];

const getStatusDetails = (status: Status | undefined): StatusStep | undefined => {
  return statusSteps.find(step => step.status === status);
}

export function ClaimStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const formattedClaimId = id ? `${id.slice(0, 4)}-${id.slice(4, 8)}...` : 'N/A';

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) {
        setError('No claim ID provided in URL.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const data = await getClaimStatus(id);
        if (!data) {
          setError('Claim not found or access denied.');
        } else {
          setClaim(data);
        }
      } catch (err) {
        console.error('Error fetching claim:', err);
        const message = err instanceof Error ? err.message : 'Failed to fetch claim status';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);
  
  const copyClaimIdToClipboard = () => {
    if (id) {
      navigator.clipboard.writeText(id)
        .then(() => toast.success('Claim ID copied!'))
        .catch(() => toast.error('Failed to copy ID'));
    }
  };
  
  const handleRetry = () => {
    const fetchClaim = async () => {
      if (!id) {
        setError('No claim ID provided in URL.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const data = await getClaimStatus(id);
        if (!data) {
          setError('Claim not found or access denied.');
        } else {
          setClaim(data);
        }
      } catch (err) {
        console.error('Error fetching claim:', err);
        const message = err instanceof Error ? err.message : 'Failed to fetch claim status';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-4 sm:px-0 mt-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 text-center shadow-md border border-gray-200/50">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Claim
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-lg h-10 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Dashboard
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleRetry}
              className="flex-1 rounded-lg h-10 text-sm"
            >
              Retry
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center text-gray-500 mt-10">Claim data not available.</div>
    );
  }

  const currentStatusDetails = getStatusDetails(claim.status as Status);
  const currentStepIndex = statusSteps.findIndex((step) => step.status === claim.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-md border border-gray-200/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#1D1D1F]"> 
            Claim Status
          </h2>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg h-9 px-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Button>
        </div>
          
        <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200/60 mb-8 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center"><Hash className="w-4 h-4 mr-1.5 text-gray-400"/>Reference</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-800 font-mono text-xs">{formattedClaimId}</span>
              <button 
                onClick={copyClaimIdToClipboard}
                className="text-blue-500 hover:text-blue-700 transition-colors p-0.5 rounded hover:bg-blue-100"
                aria-label="Copy claim ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center"><Plane className="w-4 h-4 mr-1.5 text-gray-400"/>Flight</span>
            <span className="font-medium text-gray-800">{claim.flight_number}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center"><CalendarDays className="w-4 h-4 mr-1.5 text-gray-400"/>Date</span>
            <span className="font-medium text-gray-800">{formatDate(claim.flight_date)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center"><PiggyBank className="w-4 h-4 mr-1.5 text-gray-400"/>Compensation</span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(claim.compensation_amount)}
            </span>
          </div>
        </div>

        <div className="space-y-6 relative pl-5">
          <div className="absolute left-[1.8rem] top-2 bottom-2 w-0.5 bg-gray-200" /> 
          
          {statusSteps.map((step, index) => {
            const stepStatusIndex = statusSteps.findIndex(s => s.status === step.status);
            let stepState: 'completed' | 'current' | 'upcoming' = 'upcoming';
            if (claim.status === 'rejected' || claim.status === 'archived') {
               stepState = step.status === 'pending' ? 'completed' : 'upcoming'; 
            } else {
              if (stepStatusIndex < currentStepIndex) stepState = 'completed';
              else if (step.status === claim.status) stepState = 'current';
            }
             
            const isCompleted = stepState === 'completed';
            const isCurrent = stepState === 'current';
            const IconComponent = step.icon;

            return (
              <div key={step.status} className="flex items-start gap-4 relative z-10">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${ 
                    isCurrent ? 'bg-blue-600 text-white border-blue-700 shadow-lg scale-105'
                    : isCompleted ? 'bg-white text-blue-600 border-blue-300'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <IconComponent className="w-5 h-5" />}
                </div>
                <div className="flex-grow pt-1.5">
                  <h3 className={`font-medium text-sm ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-500'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  {isCurrent && !['paid', 'rejected', 'archived'].includes(claim.status) && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden w-full">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: claim.status === 'pending' ? '20%' : claim.status === 'in-review' ? '50%' : '80%' }}
                          transition={{ duration: 1, ease: 'linear' }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {currentStatusDetails?.status === 'in-review' && (
          <div className="mt-8 p-4 bg-blue-50/80 rounded-xl border border-blue-200/60 text-blue-800 text-xs">
            <p className="flex items-start gap-2">
              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                The airline is reviewing your claim. This usually takes 7-14 business days. We'll notify you of updates via email.
              </span>
            </p>
          </div>
        )}
        {currentStatusDetails?.status === 'approved' && (
           <div className="mt-8 p-4 bg-green-50/80 rounded-xl border border-green-200/60 text-green-800 text-xs">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Great news! Your claim is approved. Payment processing typically takes 3-5 business days.
              </span>
            </p>
          </div>
        )}
         {claim.status === 'rejected' && (
           <div className="mt-8 p-4 bg-red-50/80 rounded-xl border border-red-200/60 text-red-800 text-xs">
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Unfortunately, the airline has rejected this claim. Please check your email for details or contact support if you believe this is incorrect.
              </span>
            </p>
          </div>
        )}
        {claim.status === 'paid' && (
           <div className="mt-8 p-4 bg-purple-50/80 rounded-xl border border-purple-200/60 text-purple-800 text-xs">
            <p className="flex items-start gap-2">
              <BanknoteIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Compensation has been sent! Please allow 1-3 business days for it to reflect in your account. Contact support if you encounter issues.
              </span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}