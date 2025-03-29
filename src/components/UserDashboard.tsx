import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserClaims } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, BanknoteIcon, FileText, Plane, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Claim, ClaimStatus } from '@/lib/types';

export function UserDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | 'all'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await getUserClaims();
        setClaims(data || []);
      } catch (error) {
        toast.error('Failed to fetch claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const totalCompensation = claims.reduce((sum, claim) => 
    sum + (claim.status === 'paid' ? claim.compensation_amount : 0), 0);
  const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
  const approvedClaims = claims.filter(claim => claim.status === 'approved').length;

  const chartData = claims.map(claim => ({
    date: new Date(claim.created_at).toLocaleDateString(),
    amount: claim.compensation_amount,
  }));

  const filteredClaims = selectedStatus === 'all' 
    ? claims 
    : claims.filter(claim => claim.status === selectedStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <Button
          variant="gradient"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plane className="w-4 h-4" />
          Check New Flight
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Compensation</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalCompensation)}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <BanknoteIcon className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Claims</p>
              <p className="text-2xl font-bold text-amber-600">{pendingClaims}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Approved Claims</p>
              <p className="text-2xl font-bold text-blue-600">{approvedClaims}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-semibold mb-6">Compensation History</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-xl font-semibold">Recent Claims</h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant={selectedStatus === 'all' ? 'gradient' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'gradient' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
                className="flex-1 sm:flex-none"
              >
                Pending
              </Button>
              <Button
                variant={selectedStatus === 'approved' ? 'gradient' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('approved')}
                className="flex-1 sm:flex-none"
              >
                Approved
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No claims found
              </div>
            ) : (
              filteredClaims.slice(0, 5).map((claim) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer gap-4"
                  onClick={() => navigate(`/claim/${claim.id}`)}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`p-2 rounded-lg ${
                      claim.status === 'paid'
                        ? 'bg-emerald-100'
                        : claim.status === 'approved'
                        ? 'bg-blue-100'
                        : 'bg-amber-100'
                    }`}>
                      <Plane className={`w-5 h-5 ${
                        claim.status === 'paid'
                          ? 'text-emerald-500'
                          : claim.status === 'approved'
                          ? 'text-blue-500'
                          : 'text-amber-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {claim.flight_number}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(claim.flight_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div>
                      <p className="text-right font-medium text-slate-900">
                        {formatCurrency(claim.compensation_amount)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        claim.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : claim.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}