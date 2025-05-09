import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserClaims } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, BanknoteIcon, FileText, Plane, ArrowRight, Search, Filter, Calendar, FileSignature, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Claim, ClaimStatus } from '@/lib/types';
import { CLAIM_STATUS } from '@/lib/constants';
import { ContactDialog } from './ContactDialog';

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
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>(undefined);
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

  const openContactDialog = (claimId?: string) => {
    setSelectedClaimId(claimId);
    setIsContactDialogOpen(true);
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
      className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => openContactDialog()}
            className="flex items-center gap-1.5 rounded-lg h-10 px-4 text-sm border-blue-200 text-blue-600 hover:bg-blue-50 transition-all shadow-sm hover:shadow"
          >
            <HelpCircle className="w-4 h-4" />
            Contact Support
          </Button>
          <Button
            variant="gradient"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg h-10 px-4 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plane className="w-4 h-4" />
            Check New Flight
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-emerald-100/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Paid</p>
              <p className="text-xl sm:text-2xl font-semibold text-emerald-600 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {formatCurrency(totalCompensation)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200/50 p-2.5 rounded-lg shadow-sm">
              <BanknoteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-amber-50/30 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-amber-100/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Active Claims</p>
              <p className="text-xl sm:text-2xl font-semibold text-amber-600 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{activeClaims}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-amber-200/50 p-2.5 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-blue-100/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Claims</p>
              <p className="text-xl sm:text-2xl font-semibold text-blue-600 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">{totalClaims}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200/50 p-2.5 rounded-lg shadow-sm">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200/50">
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by flight no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 text-sm rounded-lg border-gray-300 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <select 
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value as FilterStatus)}
              className="h-10 rounded-lg text-sm border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full sm:w-auto min-w-[120px] px-3 py-2 appearance-none shadow-sm transition-all"
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
                className="text-gray-600 hover:text-blue-600 rounded-lg h-10 px-3 text-sm transition-colors"
              >
                Clear
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
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Claims Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                {selectedStatus !== 'all' || searchTerm ? 
                  'Try adjusting your search or filter criteria.' : 
                  'You haven\'t submitted any claims yet. Check a flight to get started!'}
              </p>
              {(selectedStatus !== 'all' || searchTerm) ? (
                <Button variant="outline" onClick={handleClearFilters} className="rounded-lg h-9 text-sm shadow-sm hover:shadow transition-all">
                  Clear Filters
                </Button>
              ) : (
                <Button variant="gradient" onClick={() => navigate('/')} className="rounded-lg h-10 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all">
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
                    className="bg-gradient-to-b from-white/95 to-white/90 p-4 sm:p-5 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
                  >
                    <div 
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openContactDialog(claim.id);
                      }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full bg-blue-50 hover:bg-blue-100 shadow-sm hover:shadow transition-all"
                        title="Contact support about this claim"
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                    <div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      onClick={() => navigate(`/claim/${claim.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block bg-gradient-to-br from-blue-100 to-indigo-100/50 p-2 rounded-lg shadow-sm">
                          <Plane className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-lg font-semibold text-[#1D1D1F]">{claim.flight_number}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.colorClasses} shadow-sm`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                            {claim.assignment_form_signed && (
                              <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-emerald-700 bg-emerald-100 border-emerald-200 shadow-sm">
                                <FileSignature className="w-3 h-3" />
                                Signed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Flight Date: {formatDate(claim.flight_date)}
                          </p>
                          <p className="text-sm text-gray-500">{claim.passenger_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatCurrency(claim.compensation_amount)}
                        </div>
                        <div className="flex items-center mt-1 text-blue-600 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:ml-2 transition-all" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Help & Support Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100/50"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2 flex items-center justify-center md:justify-start">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
              Need Help?
            </h3>
            <p className="text-gray-600 text-sm max-w-md">
              Our support team is here to assist you with any questions or concerns about your claims.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="mailto:support@planeprotect.co.uk" 
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white text-blue-600 border border-blue-200 text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm hover:shadow transition-all"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Button
              variant="gradient"
              onClick={() => openContactDialog()}
              className="flex items-center gap-2 h-10 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Form
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Contact Dialog */}
      <ContactDialog 
        isOpen={isContactDialogOpen} 
        onClose={() => setIsContactDialogOpen(false)}
        claimId={selectedClaimId}
      />
    </motion.div>
  );
}