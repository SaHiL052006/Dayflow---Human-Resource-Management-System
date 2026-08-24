import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  CalendarCheck,
  CalendarX,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { applyLeave, getMyLeaves } from '../services/leaveService';
import { useAuth } from '../hooks/useAuth';

export const EmployeeLeavePage = () => {
  const { user } = useAuth();

  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    remarks: '',
  });

  const loadLeaveData = async () => {
    setLoading(true);
    try {
      const response = await getMyLeaves();
      setLeaveData(response.data);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load leave history.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  // Compute calculated days in form
  const getCalculatedDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate + 'T00:00:00');
    const end = new Date(formData.endDate + 'T00:00:00');
    if (start > end) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculatedDays = getCalculatedDays();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      setStatusMessage({
        type: 'error',
        text: 'End date must be after or equal to start date.',
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        remarks: formData.remarks,
      });

      setStatusMessage({
        type: 'success',
        text: response.message || 'Leave application submitted successfully!',
      });

      // Reset form
      setFormData({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        remarks: '',
      });

      // Refetch latest records
      await loadLeaveData();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to submit leave application.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const balances = leaveData?.balances;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-700" />
            Leave Management & Allowances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit new leave requests, check your annual balance, and track manager approval statuses.
          </p>
        </div>

        <button
          onClick={loadLeaveData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Requests
        </button>
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

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Paid Annual Leave */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Paid Annual</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {balances?.paid?.remaining ?? 14} <span className="text-xs font-normal text-slate-400">/ 14 Days</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {balances?.paid?.used ?? 0} days used
            </p>
          </div>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sick Leave</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {balances?.sick?.remaining ?? 7} <span className="text-xs font-normal text-slate-400">/ 7 Days</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {balances?.sick?.used ?? 0} days used
            </p>
          </div>
        </div>

        {/* Unpaid Leave */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unpaid Leave</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {balances?.unpaid?.used ?? 0} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Loss of pay leaves
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {balances?.pendingRequests ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting admin review</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Form + History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leave Application Form */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-slate-700" />
              Apply for Leave
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your dates and reason for HR/Admin approval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Leave Type */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="Paid">Paid Annual Leave ({balances?.paid?.remaining ?? 14} days left)</option>
                <option value="Sick">Sick Leave ({balances?.sick?.remaining ?? 7} days left)</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Days Indicator Badge */}
            {calculatedDays > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-900">
                <span className="font-medium">Total Duration:</span>
                <span className="font-semibold text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                  {calculatedDays} Day{calculatedDays > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Reason / Remarks */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Reason / Remarks</label>
              <textarea
                rows="3"
                required
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Please state the reason for leave..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Leave Request History Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                My Leave Request History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Past and current leave applications with live manager review status and feedback.
              </p>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
                <p className="text-xs font-medium">Loading your leave requests...</p>
              </div>
            ) : !leaveData?.leaves || leaveData.leaves.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No leave requests found. Use the application form to submit your first request.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Date Range</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason / Remarks</th>
                      <th className="py-3 px-4">Admin Feedback</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {leaveData.leaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                        {/* Type */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {leave.leaveType} Leave
                        </td>

                        {/* Date Range */}
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {leave.startDate} to {leave.endDate}
                        </td>

                        {/* Days */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            {leave.daysCount}d
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-4 max-w-[180px] truncate text-slate-600" title={leave.remarks}>
                          {leave.remarks}
                        </td>

                        {/* Admin Feedback */}
                        <td className="py-3 px-4 max-w-[160px] truncate text-slate-500">
                          {leave.adminComment ? (
                            <span className="flex items-center gap-1 text-slate-700" title={leave.adminComment}>
                              <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                              {leave.adminComment}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">--</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-right">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeavePage;
