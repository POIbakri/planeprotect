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
import type { Claim, ClaimStatus, PaginatedResponse } from '@/lib/types';
import { CLAIM_STATUS } from '@/lib/constants';

interface ClaimStats {
  totalValue: number;
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

export function AdminDashboard() {
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

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await getAllClaims();
      if (error) throw error;

      setClaims(data || []);
      calculateStats(data);
    } catch (error) {
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
      await updateClaimStatus(claimId, newStatus);
      setClaims(claims.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Claims Management</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant={selectedStatus === 'all' ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                  className="flex-1 sm:flex-none"
                >
                  All Claims
                </Button>
                {Object.values(CLAIM_STATUS).map(status => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'gradient' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status)}
                    className="flex-1 sm:flex-none"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-slate-600">Claim ID</th>
                      <th className="text-left p-4 text-slate-600">Flight</th>
                      <th className="text-left p-4 text-slate-600">Passenger</th>
                      <th className="text-left p-4 text-slate-600">Date</th>
                      <th className="text-left p-4 text-slate-600">Amount</th>
                      <th className="text-left p-4 text-slate-600">Status</th>
                      <th className="text-left p-4 text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                          </div>
                        </td>
                      </tr>
                    ) : filteredClaims.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No claims found
                        </td>
                      </tr>
                    ) : (
                      filteredClaims.map((claim) => (
                        <tr key={claim.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-mono text-sm">
                            {claim.id.slice(0, 8)}
                          </td>
                          <td className="p-4">{claim.flight_number}</td>
                          <td className="p-4">{claim.passenger_name}</td>
                          <td className="p-4">{formatDate(claim.flight_date)}</td>
                          <td className="p-4 font-medium">
                            {formatCurrency(claim.compensation_amount)}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              claim.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : claim.status === 'approved'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {claim.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(claim.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              )}
                              {claim.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(claim.id, 'paid')}
                                >
                                  Mark as Paid
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
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