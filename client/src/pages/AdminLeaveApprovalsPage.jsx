import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  RefreshCw,
  Search,
  MessageSquare,
  CalendarCheck,
  CalendarX,
} from 'lucide-react';
import { getAdminLeaves, updateLeaveStatus } from '../services/leaveService';

export const AdminLeaveApprovalsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Modal review state
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leave: null,
    targetStatus: 'Approved',
    adminComment: '',
  });

  const loadLeaves = async (filter = statusFilter) => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await getAdminLeaves(filter);
      setLeaves(response.data?.leaves || []);
      setStats(response.data?.stats || null);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load leave requests.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves(statusFilter);
  }, [statusFilter]);

  const handleOpenReviewModal = (leave, targetStatus) => {
    setReviewModal({
      isOpen: true,
      leave,
      targetStatus,
      adminComment: '',
    });
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewModal.leave) return;

    setActionLoading(true);
    try {
      const response = await updateLeaveStatus(reviewModal.leave.id, {
        status: reviewModal.targetStatus,
        adminComment: reviewModal.adminComment,
      });

      setStatusMessage({
        type: 'success',
        text: response.message || `Leave request for ${reviewModal.leave.name} ${reviewModal.targetStatus.toLowerCase()} successfully!`,
      });

      setReviewModal({ isOpen: false, leave: null, targetStatus: 'Approved', adminComment: '' });
      await loadLeaves(statusFilter);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update leave status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Client search filter
  const filteredLeaves = leaves.filter((l) => {
    return (
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.remarks?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Leave Approvals Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
            <span>Executive Leave Management & Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workforce Leave Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review submitted employee leave requests, record management feedback, and synchronize approved days with attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLeaves(statusFilter)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-slate-100 text-slate-800 border border-slate-200'
              : 'bg-slate-100 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.pendingCount ?? 0}
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Requires HR review</span>
            </p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.approvedCount ?? 0}
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Attendance synced</span>
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.rejectedCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Declined with remarks</p>
          </div>
        </div>

        {/* Total Processed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.totalCount ?? 0}
            </div>
            <p className="text-xs text-slate-600 mt-1">Cumulative records</p>
          </div>
        </div>
      </div>

      {/* Workforce Leave Requests Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70">
            {[
              { id: 'Pending', label: `Pending (${stats?.pendingCount ?? 0})` },
              { id: 'Approved', label: `Approved (${stats?.approvedCount ?? 0})` },
              { id: 'Rejected', label: `Rejected (${stats?.rejectedCount ?? 0})` },
              { id: 'All', label: 'All Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee / reason..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
            <p className="text-xs font-medium">Loading leave requests from database...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No {statusFilter.toLowerCase()} leave requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration & Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center">
                          {leave.name ? leave.name[0].toUpperCase() : 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{leave.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {leave.employeeId} • {leave.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {leave.leaveType}
                      </span>
                    </td>

                    {/* Duration & Dates */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">
                        {leave.daysCount} Day{leave.daysCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-slate-500 whitespace-nowrap">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-[220px]" title={leave.remarks}>
                      <p className="truncate font-medium text-slate-700">{leave.remarks}</p>
                      {leave.adminComment && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          {leave.adminComment}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-500'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        {leave.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {leave.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'Approved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md font-semibold text-xs shadow-2xs transition-colors"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(leave, 'Rejected')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-semibold text-xs transition-colors"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Reviewed by {leave.reviewedBy || 'Admin'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && reviewModal.leave && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-modal border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                {reviewModal.targetStatus === 'Approved' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                {reviewModal.targetStatus} Leave Request
              </h3>
              <button
                onClick={() =>
                  setReviewModal({ isOpen: false, leave: null, targetStatus: 'Approved', adminComment: '' })
                }
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-900">
                {reviewModal.leave.name} ({reviewModal.leave.employeeId})
              </p>
              <p className="text-slate-600">
                {reviewModal.leave.leaveType} Leave • {reviewModal.leave.daysCount} Day(s) ({reviewModal.leave.startDate} to {reviewModal.leave.endDate})
              </p>
              <p className="text-slate-500 italic mt-1">"{reviewModal.leave.remarks}"</p>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  HR / Admin Remarks (Optional Feedback)
                </label>
                <textarea
                  rows="3"
                  value={reviewModal.adminComment}
                  onChange={(e) => setReviewModal({ ...reviewModal, adminComment: e.target.value })}
                  placeholder="e.g. Approved. Ensure handoff before departure."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {reviewModal.targetStatus === 'Approved' && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                  ✓ Approving will automatically record matching Attendance records for these dates marked as <strong>'Leave'</strong>.
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setReviewModal({ isOpen: false, leave: null, targetStatus: 'Approved', adminComment: '' })
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {reviewModal.targetStatus === 'Approved' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Confirm {reviewModal.targetStatus}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveApprovalsPage;
