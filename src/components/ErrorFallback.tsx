import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const navigate = useNavigate();

  const handleReset = () => {
    resetErrorBoundary();
  };

  const handleHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="text-center max-w-lg">
        <div className="bg-red-100 rounded-full p-4 mx-auto mb-6 w-fit">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Oops! Something went wrong
        </h2>
        
        <p className="text-slate-600 mb-6">
          We apologize for the inconvenience. Our team has been notified and is
          working to fix the issue.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          
          <Button
            variant="gradient"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 text-left">
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="font-mono text-sm text-slate-700 mb-2">
                {error.message}
              </p>
              <pre className="font-mono text-xs text-slate-600 overflow-auto">
                {error.stack}
              </pre>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}