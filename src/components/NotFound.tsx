import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center p-4"
    >
      <div className="text-center max-w-lg">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 mx-auto mb-6 w-20 h-20">
          <Search className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            variant="gradient"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}