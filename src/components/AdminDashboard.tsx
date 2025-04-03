import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllClaims, updateClaimStatus } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, BanknoteIcon, FileText, Search, Filter, Mail, Settings, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import type { Claim, ClaimStatus, PaginatedResponse, ClaimFilters } from '@/lib/types';
import { CLAIM_STATUS } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

interface ClaimStats {
  totalValue: number;
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'analytics' | 'emails'>('claims');
  const [stats, setStats] = useState<ClaimStats>({
    totalValue: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState<{startDate: string; endDate: string}>({
    startDate: '',
    endDate: '',
  });
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<{field: string; direction: 'asc' | 'desc'}>({
    field: 'created_at',
    direction: 'desc',
  });

  useEffect(() => {
    fetchClaims();
  }, [currentPage, pageSize, statusFilter, dateFilter, sortBy]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters as ClaimFilters type
      const filterParams: ClaimFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.length > 2 ? searchTerm : undefined,
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined,
        sortBy: sortBy.field,
        sortDirection: sortBy.direction,
      };
      
      const result = await getAllClaims(currentPage, pageSize, filterParams);
      
      if (!result || !result.data) {
        throw new Error('Invalid response from server');
      }

      setClaims(result.data || []);
      
      // Calculate total pages
      if (result.count) {
        setTotalPages(Math.ceil(result.count / pageSize));
      }
      
      calculateStats(result.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (claimData: Claim[]) => {
    const stats = claimData.reduce((acc, claim) => ({
      totalValue: acc.totalValue + (claim.status === 'paid' ? claim.compensation_amount : 0),
      pendingCount: acc.pendingCount + (claim.status === 'pending' ? 1 : 0),
      approvedCount: acc.approvedCount + (claim.status === 'approved' ? 1 : 0),
      totalCount: acc.totalCount + 1,
    }), {
      totalValue: 0,
      pendingCount: 0,
      approvedCount: 0,
      totalCount: 0,
    });

    setStats(stats);
  };

  const handleStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      const loadingToast = toast.loading(`Updating claim status to ${newStatus}...`);
      
      const claim = claims.find(c => c.id === claimId);
      if (!claim) {
        toast.dismiss(loadingToast);
        toast.error('Claim not found');
        return;
      }
      
      const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
        'pending': ['in-review'],
        'in-review': ['approved', 'pending'],
        'approved': ['paid', 'in-review'],
        'paid': ['approved']
      };
      
      if (!validTransitions[claim.status].includes(newStatus)) {
        toast.dismiss(loadingToast);
        toast.error(`Cannot transition from ${claim.status} to ${newStatus}`);
        return;
      }
      
      await updateClaimStatus(claimId, newStatus);
      setClaims(claims.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ));
      
      toast.dismiss(loadingToast);
      toast.success(`Claim status updated to ${newStatus}`);
      
      calculateStats(claims.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchClaims();
  };
  
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
    setCurrentPage(1);
  };
  
  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const chartData = claims.map(claim => ({
    date: new Date(claim.created_at).toLocaleDateString(),
    amount: claim.compensation_amount,
  }));

  const filteredClaims = claims.filter(claim => 
    (selectedStatus === 'all' || claim.status === selectedStatus) &&
    (searchTerm === '' || 
      claim.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportClaimsReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('Claims Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Total Claims: ${stats.totalCount}`, 20, 40);
      doc.text(`Pending Claims: ${stats.pendingCount}`, 20, 50);
      doc.text(`Total Compensation: ${formatCurrency(stats.totalValue)}`, 20, 60);
      
      const tableData = filteredClaims.map(claim => [
        claim.id.slice(0, 8),
        claim.flight_number,
        claim.passenger_name,
        formatDate(claim.flight_date),
        formatCurrency(claim.compensation_amount),
        claim.status,
      ]);
      
      (doc as any).autoTable({
        head: [['ID', 'Flight', 'Passenger', 'Date', 'Amount', 'Status']],
        body: tableData,
        startY: 80,
      });
      
      doc.save('claims-report.pdf');
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
    }
  };
  
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">
          Showing {claims.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, stats.totalCount)} of {stats.totalCount} claims
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = currentPage > 3 && totalPages > 5
              ? currentPage - 3 + i + (totalPages - currentPage < 2 ? totalPages - currentPage - 2 : 0)
              : i + 1;
              
            return pageNum <= totalPages ? (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            ) : null;
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <Button
            variant={activeTab === 'claims' ? 'gradient' : 'outline'}
            onClick={() => setActiveTab('claims')}
            className="flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4 mr-2" />
            Claims
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'gradient' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="flex-1 sm:flex-none"
          >
            <Settings className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === 'emails' ? 'gradient' : 'outline'}
            onClick={() => setActiveTab('emails')}
            className="flex-1 sm:flex-none"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </Button>
        </div>
      </div>

      {activeTab === 'claims' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={exportClaimsReport}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button
                variant="default"
                onClick={handleSearch}
                className="flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Start Date</label>
                <Input
                  type="date"
                  name="startDate"
                  value={dateFilter.startDate}
                  onChange={handleDateFilterChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">End Date</label>
                <Input
                  type="date"
                  name="endDate"
                  value={dateFilter.endDate}
                  onChange={handleDateFilterChange}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mr-2"
                >
                  Clear
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSearch}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
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
                  <p className="text-sm text-slate-600">Total Claims Value</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.totalValue)}
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
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.pendingCount}
                  </p>
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
                  <p className="text-sm text-slate-600">Total Claims</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalCount}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="text-xl font-semibold mb-6">Claims Management</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-slate-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                  <FileText className="text-slate-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No claims found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate ? 
                    'Try adjusting your search filters to find what you\'re looking for.' : 
                    'There are no claims in the system yet.'}
                </p>
                {(searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('id')}>
                          <div className="flex items-center">
                            ID
                            {sortBy.field === 'id' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('passenger_name')}>
                          <div className="flex items-center">
                            Passenger
                            {sortBy.field === 'passenger_name' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('flight_number')}>
                          <div className="flex items-center">
                            Flight
                            {sortBy.field === 'flight_number' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('flight_date')}>
                          <div className="flex items-center">
                            Date
                            {sortBy.field === 'flight_date' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('compensation_amount')}>
                          <div className="flex items-center">
                            Amount
                            {sortBy.field === 'compensation_amount' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium cursor-pointer" onClick={() => handleSort('status')}>
                          <div className="flex items-center">
                            Status
                            {sortBy.field === 'status' && (
                              <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-sm text-slate-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim) => (
                        <tr key={claim.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-800">{claim.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{claim.passenger_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{claim.flight_number}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{formatDate(claim.flight_date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                            {formatCurrency(claim.compensation_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                claim.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : claim.status === 'approved'
                                  ? 'bg-blue-100 text-blue-700'
                                  : claim.status === 'in-review'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <select
                                className="text-sm border border-slate-200 rounded p-1"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusUpdate(claim.id, e.target.value as ClaimStatus);
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Update Status</option>
                                {claim.status === 'pending' && (
                                  <option value="in-review">Move to Review</option>
                                )}
                                {claim.status === 'in-review' && (
                                  <>
                                    <option value="approved">Approve</option>
                                    <option value="pending">Return to Pending</option>
                                  </>
                                )}
                                {claim.status === 'approved' && (
                                  <>
                                    <option value="paid">Mark as Paid</option>
                                    <option value="in-review">Return to Review</option>
                                  </>
                                )}
                                {claim.status === 'paid' && (
                                  <option value="approved">Return to Approved</option>
                                )}
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // View claim details
                                  navigate(`/admin/claims/${claim.id}`);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-semibold mb-6">Claims Value Over Time</h2>
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
            <h2 className="text-xl font-semibold mb-6">Claims by Status</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(
                claims.reduce((acc, claim) => ({
                  ...acc,
                  [claim.status]: (acc[claim.status] || 0) + 1
                }), {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'emails' && (
        <EmailTemplateEditor />
      )}
    </motion.div>
  );
}