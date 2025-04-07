import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllClaims, updateClaimStatus } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle2, AlertTriangle, BanknoteIcon, FileText, Search, Filter, Mail, Settings, Download, ChevronUp, ChevronDown } from 'lucide-react';
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

const statusDisplayMap: Record<ClaimStatus, { label: string; colorClasses: string; icon: React.ElementType }> = {
    [CLAIM_STATUS.PENDING]: { label: 'Pending', colorClasses: 'text-amber-700 bg-amber-100 border border-amber-200', icon: Clock },
    [CLAIM_STATUS.IN_REVIEW]: { label: 'In Review', colorClasses: 'text-purple-700 bg-purple-100 border border-purple-200', icon: Filter },
    [CLAIM_STATUS.APPROVED]: { label: 'Approved', colorClasses: 'text-blue-700 bg-blue-100 border border-blue-200', icon: CheckCircle2 },
    [CLAIM_STATUS.PAID]: { label: 'Paid', colorClasses: 'text-emerald-700 bg-emerald-100 border border-emerald-200', icon: BanknoteIcon },
    rejected: { label: 'Rejected', colorClasses: 'text-red-700 bg-red-100 border border-red-200', icon: AlertTriangle },
    archived: { label: 'Archived', colorClasses: 'text-gray-700 bg-gray-100 border border-gray-200', icon: FileText },
};

const allowedTransitions: Record<ClaimStatus, ClaimStatus[]> = {
    [CLAIM_STATUS.PENDING]: [CLAIM_STATUS.IN_REVIEW, 'rejected'],
    [CLAIM_STATUS.IN_REVIEW]: [CLAIM_STATUS.APPROVED, 'rejected', CLAIM_STATUS.PENDING],
    [CLAIM_STATUS.APPROVED]: [CLAIM_STATUS.PAID, 'rejected', CLAIM_STATUS.IN_REVIEW],
    [CLAIM_STATUS.PAID]: ['archived'],
    rejected: ['archived'],
    archived: []
};

const getStatusDisplay = (status: ClaimStatus) => {
    return statusDisplayMap[status] || { label: status, colorClasses: 'text-gray-700 bg-gray-100 border border-gray-200', icon: FileText };
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [totalClaimsCount, setTotalClaimsCount] = useState(0);
  const [dateFilter, setDateFilter] = useState<{startDate: string; endDate: string}>({
    startDate: '',
    endDate: '',
  });
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<{field: string; direction: 'asc' | 'desc'}>({
    field: 'created_at',
    direction: 'desc',
  });

  const totalPages = Math.ceil(totalClaimsCount / pageSize);

  useEffect(() => {
    fetchClaims();
  }, [currentPage, pageSize, statusFilter, dateFilter, sortBy, searchTerm]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const filterParams: ClaimFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.length >= 3 ? searchTerm : undefined,
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined,
        sortBy: sortBy.field,
        sortDirection: sortBy.direction,
      };
      
      const result: PaginatedResponse<Claim> = await getAllClaims(currentPage, pageSize, filterParams);
      
      setClaims(result.data || []);
      setTotalClaimsCount(result.count || 0);
      
      setStats(prev => ({ ...prev, totalCount: result.count || 0 }));
      calculateStatsBasedOnFetchedData(result.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsBasedOnFetchedData = (claimData: Claim[]) => {
    const statsSummary = claimData.reduce((acc, claim) => {
       const isPaid = claim.status === CLAIM_STATUS.PAID;
       const isPending = claim.status === CLAIM_STATUS.PENDING || claim.status === CLAIM_STATUS.IN_REVIEW;
       const isApproved = claim.status === CLAIM_STATUS.APPROVED;

       return {
         totalValue: acc.totalValue + (isPaid ? claim.compensation_amount : 0),
         pendingCount: acc.pendingCount + (isPending ? 1 : 0),
         approvedCount: acc.approvedCount + (isApproved ? 1 : 0),
       };
     }, { totalValue: 0, pendingCount: 0, approvedCount: 0 });
 
    setStats(prev => ({ ...prev, ...statsSummary }));
  };

  const handleStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (!currentClaim) {
        toast.error("Claim not found.");
        return;
    }
    const currentStatus = currentClaim.status;

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
        toast.error(`Cannot change status from '${currentStatus}' to '${newStatus}'.`);
        return;
    }

    const loadingToastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await updateClaimStatus(claimId, newStatus);
      await fetchClaims();
      toast.success(`Claim status updated`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      toast.dismiss(loadingToastId);
    }
  };
  
  const handleFilterApply = () => {
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length >= 3) {
       setCurrentPage(1);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFilterApply();
    }
  };
  
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
    setSortBy({ field: 'created_at', direction: 'desc' });
    setCurrentPage(1);
  };
  
  const handleSort = (field: string) => {
    const newDirection = sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc';
    setSortBy({ field, direction: newDirection });
    setCurrentPage(1);
  };

  const chartData = claims.map(claim => ({
    date: new Date(claim.created_at).toLocaleDateString(),
    amount: claim.compensation_amount,
  }));

  const filteredClaims = claims.filter(claim => 
    (statusFilter === 'all' || claim.status === statusFilter) &&
    (searchTerm === '' || 
      claim.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportClaimsReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Claims Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      
      const tableColumn = ["ID", "Passenger", "Flight No", "Flight Date", "Amount", "Status"];
      const tableRows = claims.map(claim => [
        claim.id.substring(0, 8) + '...',
        claim.passenger_name,
        claim.flight_number,
        formatDate(claim.flight_date),
        formatCurrency(claim.compensation_amount),
        getStatusDisplay(claim.status).label
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 } }
      });
      
      doc.save(`claims-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report');
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg h-8 px-2.5"
          >
            Previous
          </Button>

          {startPage > 1 && (
            <span className="px-2">...</span>
          )}

          {pageNumbers.map(pageNum => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? 'default' : 'outline'}
              size="icon"
              onClick={() => setCurrentPage(pageNum)}
              className={`rounded-lg h-8 w-8 text-xs ${pageNum === currentPage ? '' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {pageNum}
            </Button>
          ))}

           {endPage < totalPages && (
            <span className="px-2">...</span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg h-8 px-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
         <span>
          {totalClaimsCount} Total Claims
        </span>
      </div>
    );
  };

  const renderSortArrow = (field: string) => {
    if (sortBy.field !== field) return null;
    return sortBy.direction === 'asc' ? 
      <ChevronUp className="w-3 h-3 ml-1 text-gray-500" /> : 
      <ChevronDown className="w-3 h-3 ml-1 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F]">
          Admin Dashboard
        </h1>
        <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50/50 w-full sm:w-auto">
          {[ { id: 'claims', label: 'Claims', icon: FileText }, 
            { id: 'analytics', label: 'Analytics', icon: Settings }, 
            { id: 'emails', label: 'Emails', icon: Mail } ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none rounded-lg h-9 px-3 text-sm ${activeTab === tab.id ? 'shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}
            >
              <tab.icon className={`w-4 h-4 mr-1.5 ${activeTab === tab.id ? '' : 'text-gray-400'}`} />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === 'claims' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="bg-white/70 backdrop-blur-lg rounded-xl p-4 shadow-sm border border-gray-200/50 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-1 lg:col-span-2">
                <label htmlFor="admin-search" className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                   <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="admin-search"
                    type="text"
                    placeholder="Flight No, Passenger... (3+ chars)"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    className="h-9 pl-8 text-sm rounded-lg border-gray-300 w-full"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select 
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                  className="h-9 rounded-lg text-sm border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-300 w-full px-3 py-1 appearance-none"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusDisplayMap).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                 <label htmlFor="start-date" className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                 <Input id="start-date" type="date" name="startDate" value={dateFilter.startDate} onChange={handleDateFilterChange} className="h-9 text-sm rounded-lg border-gray-300 w-full"/>
              </div>
              <div>
                 <label htmlFor="end-date" className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                 <Input id="end-date" type="date" name="endDate" value={dateFilter.endDate} onChange={handleDateFilterChange} className="h-9 text-sm rounded-lg border-gray-300 w-full"/>
              </div>
              <div className="flex gap-2 justify-end md:col-span-3 lg:col-span-1">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-lg h-9 px-3 text-xs text-gray-600 hover:text-blue-600">Clear</Button>
                  <Button variant="default" size="sm" onClick={handleFilterApply} className="rounded-lg h-9 px-3 text-xs">Apply</Button>
                   <Button variant="outline" size="sm" onClick={exportClaimsReport} className="rounded-lg h-9 px-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Download className="w-3.5 h-3.5 mr-1" /> Export
                   </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
                <motion.div initial={{ opacity: 0, y:15 }} animate={{ opacity: 1, y:0 }} transition={{delay: 0.1}} className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Paid Value (This Page)</p>
                        <p className="text-xl sm:text-2xl font-semibold text-emerald-600">{formatCurrency(stats.totalValue)}</p>
                        </div>
                        <div className="bg-emerald-100/70 p-2.5 rounded-lg"><BanknoteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" /></div>
                    </div>
                </motion.div>
                 <motion.div initial={{ opacity: 0, y:15 }} animate={{ opacity: 1, y:0 }} transition={{delay: 0.2}} className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50">
                     <div className="flex items-center justify-between">
                         <div>
                         <p className="text-xs sm:text-sm text-gray-500 mb-1">Pending/Review (This Page)</p>
                         <p className="text-xl sm:text-2xl font-semibold text-amber-600">{stats.pendingCount}</p>
                         </div>
                         <div className="bg-amber-100/70 p-2.5 rounded-lg"><Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /></div>
                     </div>
                 </motion.div>
                 <motion.div initial={{ opacity: 0, y:15 }} animate={{ opacity: 1, y:0 }} transition={{delay: 0.3}} className="bg-white/70 backdrop-blur-lg rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Claims (Filtered)</p>
                        <p className="text-xl sm:text-2xl font-semibold text-blue-600">{totalClaimsCount}</p>
                        </div>
                        <div className="bg-blue-100/70 p-2.5 rounded-lg"><FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /></div>
                    </div>
                </motion.div>
            </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
             <h2 className="text-lg font-semibold p-4 border-b border-gray-200/60">Claims Management</h2>
             {loading ? (
               <div className="flex items-center justify-center h-64">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
               </div>
             ) : claims.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <div className="mx-auto bg-gray-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                        <FileText className="text-gray-400 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Claims Found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                        {searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate ? 
                        'Try adjusting your filters or search term.' : 
                        'There are no claims matching the current criteria.'}
                    </p>
                    {(searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate) && (
                        <Button variant="outline" onClick={clearFilters} className="rounded-lg h-9 text-sm">Clear Filters</Button>
                    )}
                </div>
             ) : (
               <>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-200">
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('id')}>ID {renderSortArrow('id')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('passenger_name')}>Passenger {renderSortArrow('passenger_name')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('flight_number')}>Flight {renderSortArrow('flight_number')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('flight_date')}>Date {renderSortArrow('flight_date')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('compensation_amount')}>Amount {renderSortArrow('compensation_amount')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 cursor-pointer hover:bg-gray-100/80" onClick={() => handleSort('status')}>Status {renderSortArrow('status')}</th>
                           <th className="px-3 py-2.5 font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                      </thead>
                     <tbody>
                       {claims.map((claim) => {
                         const statusInfo = getStatusDisplay(claim.status);
                         const StatusIcon = statusInfo.icon;
                         const nextStatuses = allowedTransitions[claim.status] || [];
                         return (
                            <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="px-3 py-2 text-gray-700 font-mono text-xs">{claim.id.slice(0, 8)}...</td>
                              <td className="px-3 py-2 text-gray-800 truncate max-w-[150px]">{claim.passenger_name}</td>
                              <td className="px-3 py-2 text-gray-700">{claim.flight_number}</td>
                              <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{formatDate(claim.flight_date)}</td>
                              <td className="px-3 py-2 font-medium text-emerald-700 whitespace-nowrap">
                                {formatCurrency(claim.compensation_amount)}
                              </td>
                              <td className="px-3 py-2">
                                 <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.colorClasses}`}>
                                   <StatusIcon className="w-3 h-3" />
                                   {statusInfo.label}
                                 </span>
                               </td>
                              <td className="px-3 py-2 text-right">
                                <select 
                                   className="h-7 rounded-md text-xs border-gray-300 w-auto px-2 py-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-300 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                   value=""
                                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { if(e.target.value) handleStatusUpdate(claim.id, e.target.value as ClaimStatus); }}
                                   disabled={nextStatuses.length === 0}
                                >
                                    <option value="" disabled>Update...</option>
                                    {nextStatuses.map((nextStatus: ClaimStatus) => (
                                       <option key={nextStatus} value={nextStatus}>
                                          {statusDisplayMap[nextStatus]?.label || nextStatus} 
                                       </option>
                                    ))}
                                </select>
                              </td>
                            </tr>
                        );
                       })}
                     </tbody>
                   </table>
                 </div>
                 {renderPagination()} 
               </>
             )}
           </div>
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200/50">
               <h2 className="text-lg font-semibold mb-4 text-gray-700">Claims Value Over Time</h2>
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
             </div>
             <div className="bg-white/70 backdrop-blur-lg rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200/50">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Claims by Status</h2>
                <div className="h-64">
                  <p className="text-center text-gray-400 pt-16">Status Breakdown Placeholder</p>
                </div>
             </div>
           </div>
        </motion.div>
      )}

      {activeTab === 'emails' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
             <EmailTemplateEditor />
          </motion.div>
      )}
    </motion.div>
  );
}