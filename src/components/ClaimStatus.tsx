import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, BanknoteIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getClaimStatus } from '@/lib/api';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

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
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const data = await getClaimStatus(id!);
        setClaim(data);
      } catch (error) {
        toast.error('Failed to fetch claim status');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
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
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
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
          <div className="mt-4 space-y-1">
            <p className="text-slate-600">
              Flight: {claim.flight_number}
            </p>
            <p className="text-slate-600">
              Estimated compensation: €{claim.compensation_amount}
            </p>
            <p className="text-slate-500 text-sm">
              Expected processing time: {claim.status === 'pending' ? '14 days' : '7 days'}
            </p>
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
      </div>
    </motion.div>
  );
}