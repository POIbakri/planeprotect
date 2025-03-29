import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, AlertTriangle, Clock, Cloud, PenTool as Tool, Users, Shield, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { formatFlightNumber } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkFlightEligibility } from '@/lib/api';
import { FlightCheckResults } from './FlightCheckResults';
import toast from 'react-hot-toast';
import type { DisruptionDetails, DisruptionReason, FlightCheckResponse } from '@/lib/types';

// Extended type for our local state that includes the disruption
interface CheckResultState extends FlightCheckResponse {
  disruption?: DisruptionDetails;
}

const disruptionReasons = [
  { id: 'technical_issue', label: 'Technical Issue', icon: Tool },
  { id: 'weather', label: 'Bad Weather', icon: Cloud },
  { id: 'air_traffic_control', label: 'Air Traffic Control', icon: Shield },
  { id: 'security', label: 'Security Issue', icon: Shield },
  { id: 'staff_shortage', label: 'Staff Shortage', icon: Users },
  { id: 'strike', label: 'Strike', icon: Users },
  { id: 'other_airline_fault', label: 'Other Airline Fault', icon: AlertTriangle },
  { id: 'other', label: 'Other Reason', icon: XCircle },
];

export function FlightCheck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [step, setStep] = useState<'initial' | 'disruption' | 'results'>('initial');
  const [checkResult, setCheckResult] = useState<CheckResultState | null>(null);
  const [disruption, setDisruption] = useState<DisruptionDetails>({
    type: 'delay',
  });

  // Calculate date limits
  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 6);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      const result = await checkFlightEligibility(flightNumber, flightDate);
      setCheckResult(result);
      setStep('disruption');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check flight eligibility');
    } finally {
      setIsChecking(false);
    }
  };

  const handleDisruptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disruption.type === 'delay' && !disruption.delayDuration) {
      toast.error('Please enter the delay duration');
      return;
    }
    if (!disruption.reason) {
      toast.error('Please select a reason for the disruption');
      return;
    }

    if (!checkResult) return;

    setCheckResult((prev: CheckResultState | null) => {
      if (!prev) return null;
      return {
        ...prev,
        disruption,
      };
    });
    setStep('results');
  };

  const handleReset = () => {
    setFlightNumber('');
    setFlightDate('');
    setCheckResult(null);
    setStep('initial');
    setDisruption({ type: 'delay' });
  };

  const handleContinue = () => {
    if (!checkResult) return;
    
    if (!user) {
      navigate('/login', { 
        state: { from: '/claim' }
      });
    } else {
      navigate('/claim', {
        state: {
          flightNumber,
          flightDate,
          compensation: checkResult.compensation,
          disruption: checkResult.disruption,
        }
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'initial' && (
        <motion.div
          key="check"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mx-auto px-4 sm:px-0"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Check Your Flight
              </h2>
            </div>

            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="flightNumber" className="block text-sm font-medium text-slate-700">
                  Flight Number
                </label>
                <Input
                  id="flightNumber"
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(formatFlightNumber(e.target.value))}
                  placeholder="Enter flight number (e.g., BA1234)"
                  className="h-12"
                  required
                  pattern="^[A-Z]{2}\d{1,4}$"
                  title="Please enter a valid flight number (e.g., BA1234)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="flightDate" className="block text-sm font-medium text-slate-700">
                  Flight Date
                </label>
                <Input
                  id="flightDate"
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="h-12"
                  required
                  min={minDateStr}
                  max={maxDate}
                />
                <p className="text-sm text-slate-500">
                  Claims can be made for flights within the last 6 years
                </p>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12"
                disabled={isChecking}
              >
                {isChecking ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </motion.div>
                ) : (
                  'Check Compensation'
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600 text-center">
              Get up to €600 in compensation for delayed or cancelled flights.
              <br />
              <span className="text-slate-500">No win, no fee. It's that simple.</span>
            </p>
          </div>
        </motion.div>
      )}

      {step === 'disruption' && (
        <motion.div
          key="disruption"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-lg mx-auto px-4 sm:px-0"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flight Disruption Details
              </h2>
            </div>

            <form onSubmit={handleDisruptionSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Type of Disruption
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={disruption.type === 'delay' ? 'gradient' : 'outline'}
                      onClick={() => setDisruption({ ...disruption, type: 'delay' })}
                      className="flex-1"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Delay
                    </Button>
                    <Button
                      type="button"
                      variant={disruption.type === 'cancellation' ? 'gradient' : 'outline'}
                      onClick={() => setDisruption({ ...disruption, type: 'cancellation' })}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancellation
                    </Button>
                  </div>
                </div>

                {disruption.type === 'delay' && (
                  <div className="space-y-2">
                    <label htmlFor="delayDuration" className="text-sm font-medium text-slate-700">
                      How long was the delay? (hours)
                    </label>
                    <Input
                      id="delayDuration"
                      type="number"
                      min="1"
                      max="72"
                      value={disruption.delayDuration || ''}
                      onChange={(e) => setDisruption({
                        ...disruption,
                        delayDuration: parseInt(e.target.value),
                      })}
                      className="h-12"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    What was the reason?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {disruptionReasons.map(({ id, label, icon: Icon }) => (
                      <Button
                        key={id}
                        type="button"
                        variant={disruption.reason === id ? 'gradient' : 'outline'}
                        onClick={() => setDisruption({ 
                          ...disruption, 
                          reason: id as DisruptionReason 
                        })}
                        className="justify-start h-auto py-3"
                      >
                        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {step === 'results' && checkResult && (
        <FlightCheckResults
          flightNumber={flightNumber}
          flightDate={flightDate}
          checkResult={checkResult as FlightCheckResponse}
          onReset={handleReset}
          onContinue={handleContinue}
        />
      )}
    </AnimatePresence>
  );
}