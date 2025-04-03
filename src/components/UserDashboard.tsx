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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{startDate: string; endDate: string}>({
    startDate: '',
    endDate: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data } = await getUserClaims();
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const totalCompensation = claims.reduce((sum, claim) => 
    sum + (claim.status === 'paid' ? claim.compensation_amount : 0), 0);
  const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
  const approvedClaims = claims.filter(claim => claim.status === 'approved').length;

  const chartData = claims.map(claim => ({
    date: new Date(claim.created_at).toLocaleDateString(),
    amount: claim.compensation_amount,
  }));

  const filterClaims = () => {
    return claims.filter(claim => {
      // Filter by status
      if (selectedStatus !== 'all' && claim.status !== selectedStatus) {
        return false;
      }
      
      // Filter by search term (flight number or passenger name)
      if (searchTerm && !claim.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !claim.passenger_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (dateFilter.startDate) {
        const claimDate = new Date(claim.flight_date);
        const startDate = new Date(dateFilter.startDate);
        if (claimDate < startDate) return false;
      }
      
      if (dateFilter.endDate) {
        const claimDate = new Date(claim.flight_date);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (claimDate > endDate) return false;
      }
      
      return true;
    });
  };

  const filteredClaims = filterClaims();
  
  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
  };
  
  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'in-review': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'approved': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

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
          {claims.length > 0 ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">No compensation data yet</p>
              <p className="text-sm text-slate-400 max-w-xs mt-2">
                Submit your first claim to track your compensation history
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <h2 className="text-xl font-semibold">Your Claims</h2>
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
            
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by flight number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              
              {(selectedStatus !== 'all' || searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No claims found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {selectedStatus !== 'all' || searchTerm || dateFilter.startDate || dateFilter.endDate ? 
                    'Try adjusting your filters to see more results.' : 
                    'You haven\'t submitted any claims yet. Start by checking if your flight is eligible for compensation.'}
                </p>
                {(selectedStatus !== 'all' || searchTerm || dateFilter.startDate || dateFilter.endDate) ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button variant="gradient" onClick={() => navigate('/')}>
                    Check Flight Eligibility
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filteredClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{claim.flight_number}</h3>
                        <p className="text-sm text-slate-500">{formatDate(claim.flight_date)}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm">
                        <span className="text-lg font-semibold">
                          {formatCurrency(claim.compensation_amount)}
                        </span>
                        {claim.status === 'paid' && <span className="text-xs text-emerald-600 ml-2">Paid</span>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/claims/${claim.id}`)}
                        className="text-blue-600"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}