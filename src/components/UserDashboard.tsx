import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserClaims } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, BanknoteIcon, FileText, Plane, ArrowRight, Search, Filter, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Claim, ClaimStatus } from '@/lib/types';
import { CLAIM_STATUS } from '@/lib/constants';

type FilterStatus = ClaimStatus | 'all';

export function UserDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
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
    sum + (claim.status === CLAIM_STATUS.PAID ? claim.compensation_amount : 0), 0);
  const activeClaims = claims.filter(claim => 
    claim.status === CLAIM_STATUS.PENDING || claim.status === CLAIM_STATUS.IN_REVIEW
  ).length;
  const totalClaims = claims.length;

  const chartData = claims
    .filter(claim => claim.status === CLAIM_STATUS.PAID)
    .map(claim => ({
      date: new Date(claim.created_at),
      amount: claim.compensation_amount, 
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(item => ({ ...item, date: item.date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) }));

  const filterClaims = () => {
    return claims.filter(claim => {
      if (selectedStatus !== 'all' && claim.status !== selectedStatus) {
        return false;
      }
      if (searchTerm && !claim.flight_number.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (dateFilter.startDate) {
        const claimDate = new Date(claim.flight_date);
        const startDate = new Date(dateFilter.startDate);
        if (claimDate < startDate) return false;
      }
      if (dateFilter.endDate) {
        const claimDate = new Date(claim.flight_date);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
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
  
  const statusDisplayMap: Record<ClaimStatus, { label: string; colorClasses: string; icon: React.ElementType }> = {
    [CLAIM_STATUS.PENDING]: { label: 'Pending', colorClasses: 'text-amber-700 bg-amber-100 border-amber-200', icon: Clock },
    [CLAIM_STATUS.IN_REVIEW]: { label: 'In Review', colorClasses: 'text-purple-700 bg-purple-100 border-purple-200', icon: Filter },
    [CLAIM_STATUS.APPROVED]: { label: 'Approved', colorClasses: 'text-blue-700 bg-blue-100 border-blue-200', icon: CheckCircle2 },
    [CLAIM_STATUS.PAID]: { label: 'Paid', colorClasses: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: BanknoteIcon },
    rejected: { label: 'Rejected', colorClasses: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle },
    archived: { label: 'Archived', colorClasses: 'text-gray-700 bg-gray-100 border-gray-200', icon: FileText },
  };

  const getStatusDisplay = (status: ClaimStatus) => {
    return statusDisplayMap[status] || { label: status, colorClasses: 'text-gray-700 bg-gray-100 border-gray-200', icon: FileText };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F]">
          Your Dashboard
        </h1>
        <Button
          variant="gradient"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg h-10 px-4 text-sm w-full sm:w-auto"
        >
          <Plane className="w-4 h-4" />
          Check New Flight
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Paid</p>
              <p className="text-xl sm:text-2xl font-semibold text-emerald-600">
                {formatCurrency(totalCompensation)}
              </p>
            </div>
            <div className="bg-emerald-100/70 p-2.5 rounded-lg">
              <BanknoteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Active Claims</p>
              <p className="text-xl sm:text-2xl font-semibold text-amber-600">{activeClaims}</p>
            </div>
            <div className="bg-amber-100/70 p-2.5 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Claims</p>
              <p className="text-xl sm:text-2xl font-semibold text-blue-600">{totalClaims}</p>
            </div>
            <div className="bg-blue-100/70 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200/50">
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by flight no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 text-sm rounded-lg border-gray-300 w-full"
            />
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <select 
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value as FilterStatus)}
              className="h-10 rounded-lg text-sm border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-300 w-full sm:w-auto min-w-[120px] px-3 py-2 appearance-none"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusDisplayMap).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {(selectedStatus !== 'all' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-blue-600 rounded-lg h-10 px-3 text-sm"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Claims Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                {selectedStatus !== 'all' || searchTerm ? 
                  'Try adjusting your search or filter criteria.' : 
                  'You haven\'t submitted any claims yet. Check a flight to get started!'}
              </p>
              {(selectedStatus !== 'all' || searchTerm) ? (
                <Button variant="outline" onClick={handleClearFilters} className="rounded-lg h-9 text-sm">
                  Clear Filters
                </Button>
              ) : (
                <Button variant="gradient" onClick={() => navigate('/')} className="rounded-lg h-10 text-sm">
                  Check Flight Eligibility
                </Button>
              )}
            </div>
          ) : (
            <>
              {filteredClaims.map((claim) => {
                const statusInfo = getStatusDisplay(claim.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-gray-200/80 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white/80"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <h3 className="font-medium text-sm sm:text-base text-gray-800">{claim.flight_number}</h3>
                        <span className="text-xs text-gray-400">({formatDate(claim.flight_date)})</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.colorClasses}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="text-sm mb-2 sm:mb-0">
                        <span className="text-gray-500">Potential: </span>
                        <span className="text-base font-semibold text-gray-700">
                          {formatCurrency(claim.compensation_amount)}
                        </span>
                        {claim.status === CLAIM_STATUS.PAID && <span className="text-xs text-emerald-600 ml-2">(Paid)</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/claim/${claim.id}`)}
                        className="rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50/50 h-8 px-3 text-xs"
                      >
                        View Status <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}