import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  CheckCircle2,
  Play,
  Square,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  LogOut,
  Bell,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  Send,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  checkIn,
  checkOut,
  getTodayStatus,
} from '../services/attendanceService';
import {
  getMyLeaves,
  applyLeave,
} from '../services/leaveService';

export const EmployeeDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [punchLoading, setPunchLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [liveLeaves, setLiveLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({
    paidRemaining: 14,
    sickRemaining: 7,
    unpaidUsed: 0,
    pendingCount: 0,
  });
  const [leaveForm, setLeaveForm] = useState({
    type: 'Paid',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Fetch live punch status from MongoDB
  const loadPunchStatus = async () => {
    try {
      const res = await getTodayStatus();
      const data = res.data;
      if (data) {
        setIsClockedIn(Boolean(data.isCheckedIn && !data.isCheckedOut));
        setIsCheckedOut(Boolean(data.isCheckedOut));
        if (data.record?.checkInTime) {
          setClockInTime(
            new Date(data.record.checkInTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          );
          if (!data.isCheckedOut) {
            const elapsed = Math.floor(
              (new Date().getTime() - new Date(data.record.checkInTime).getTime()) / 1000
            );
            setSessionSeconds(Math.max(0, elapsed));
          }
        }
        if (data.record?.checkOutTime) {
          setClockOutTime(
            new Date(data.record.checkOutTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          );
        }
      }
    } catch {
      // Fallback
    }
  };

  // Fetch live leave records and balances
  const loadLeaveData = async () => {
    try {
      const res = await getMyLeaves();
      const data = res.data;
      if (data) {
        setLiveLeaves(data.leaves || []);
        if (data.balances) {
          setLeaveBalances({
            paidRemaining: data.balances.paid?.remaining ?? 14,
            sickRemaining: data.balances.sick?.remaining ?? 7,
            unpaidUsed: data.balances.unpaid?.used ?? 0,
            pendingCount: data.balances.pendingRequests ?? 0,
          });
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadPunchStatus();
    loadLeaveData();
  }, []);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Work session counter
  useEffect(() => {
    let interval;
    if (isClockedIn && !isCheckedOut) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, isCheckedOut]);

  const formatSessionTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleToggleClock = async () => {
    setPunchLoading(true);
    try {
      if (!isClockedIn && !isCheckedOut) {
        await checkIn();
        await loadPunchStatus();
      } else if (isClockedIn && !isCheckedOut) {
        await checkOut();
        await loadPunchStatus();
      }
    } catch {
      // Handled
    } finally {
      setPunchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    try {
      await applyLeave({
        leaveType: leaveForm.type,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        remarks: leaveForm.reason,
      });

      setLeaveSubmitted(true);
      await loadLeaveData();

      setTimeout(() => {
        setLeaveSubmitted(false);
        setShowLeaveModal(false);
        setLeaveForm({ type: 'Paid', startDate: '', endDate: '', reason: '' });
      }, 1200);
    } catch {
      // Handled
    } finally {
      setLeaveLoading(false);
    }
  };

  // Dynamically constructed recent activities feed
  const recentActivities = [
    ...(liveLeaves.length > 0
      ? liveLeaves.slice(0, 2).map((l) => ({
          id: `leave-${l._id}`,
          title: `${l.leaveType} Leave Request ${l.status}`,
          time: new Date(l.createdAt).toLocaleDateString(),
          desc: `${l.daysCount} day(s) (${l.startDate} to ${l.endDate}) • ${l.remarks}${l.adminComment ? ` • Feedback: ${l.adminComment}` : ''}`,
          status: l.status,
          badgeColor:
            l.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : l.status === 'Rejected'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200',
        }))
      : []),
    {
      id: 'att-1',
      title: 'Daily Shift Clock-In',
      time: isClockedIn ? `Today at ${clockInTime}` : 'Today',
      desc: isClockedIn
        ? 'Attendance recorded on time. Session active.'
        : isCheckedOut
        ? 'Daily shift completed.'
        : 'Punch in to start shift.',
      status: isClockedIn ? 'Active' : isCheckedOut ? 'Completed' : 'Pending',
      badgeColor: isClockedIn
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-brand-50 text-brand-700 border-brand-200',
    },
    {
      id: 'sec-1',
      title: 'Email Verified & Account Active',
      time: 'RBAC Active',
      desc: 'Security credentials verified and RBAC token issued.',
      status: 'Verified',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Employee Self-Service Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Employee'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Employee ID: <span className="font-mono font-medium text-slate-800">{user?.employeeId || 'EMP-101'}</span> •{' '}
            <span>{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200 text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Workspace Clock</p>
            <p className="text-base font-mono font-bold text-slate-900">{currentTime}</p>
          </div>
        </div>
      </div>

      {/* 4 Quick-Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Profile Quick Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">My Profile</span>
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Employee'}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{user?.employeeId || 'EMP-101'}</p>
              <p className="text-[11px] text-slate-500 mt-1">Dept: Engineering</p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Status
            </span>
          </div>
        </div>

        {/* 2. Attendance Quick Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Attendance</span>
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500">Today's Shift Duration:</p>
              <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                {isClockedIn ? formatSessionTime(sessionSeconds) : isCheckedOut ? 'Finished' : '00:00:00'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isCheckedOut
                  ? `Shift ended at ${clockOutTime || '05:30 PM'}`
                  : isClockedIn
                  ? `Punched in at ${clockInTime}`
                  : 'Not clocked in yet'}
              </p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100">
            {isCheckedOut ? (
              <div className="w-full py-1.5 px-3 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 text-center flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Shift Completed
              </div>
            ) : (
              <button
                onClick={handleToggleClock}
                disabled={punchLoading}
                className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isClockedIn
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                {punchLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recording...
                  </>
                ) : isClockedIn ? (
                  <>
                    <Square className="w-3.5 h-3.5" /> Clock Out Shift
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Clock In Shift
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 3. Leave Requests Quick Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Leave Balance</span>
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{leaveBalances.paidRemaining}</span>
                <span className="text-xs text-slate-500">Days Available</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Paid: {leaveBalances.paidRemaining} • Sick: {leaveBalances.sickRemaining}</p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="w-full py-1.5 px-3 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center justify-center gap-1"
            >
              Apply for Leave <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Session Quick Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Session</span>
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
              <p className="text-[11px] text-slate-500 mt-1">Role: Employee (RBAC Protected)</p>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full py-1.5 px-3 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Leave Balances + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leave Balances */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                Annual Leave Allowances (2026)
              </h3>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="text-xs font-semibold text-slate-800 hover:text-slate-950 underline"
              >
                + Request Leave
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Paid Annual Leave', remaining: leaveBalances.paidRemaining, total: '14 Days' },
                { title: 'Sick Leave', remaining: leaveBalances.sickRemaining, total: '7 Days' },
                { title: 'Unpaid Leave', remaining: leaveBalances.unpaidUsed, total: 'Days Taken' },
                { title: 'Pending Review', remaining: leaveBalances.pendingCount, total: 'Requests' },
              ].map((leave) => (
                <div
                  key={leave.title}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{leave.title}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{leave.remaining}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Out of {leave.total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Announcement Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 flex items-start gap-3 shadow-2xs">
            <CalendarCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Company Holiday</p>
              <p className="text-xs font-semibold mt-0.5 text-slate-900">Labor Day — Friday, May 1, 2026</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Paid company-wide holiday. All branch offices will remain closed.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Alerts Feed */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              Recent Activity
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900">{activity.title}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activity.status === 'Approved' || activity.status === 'Active' || activity.status === 'Verified'
                          ? 'bg-emerald-500'
                          : activity.status === 'Rejected'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{activity.desc}</p>
                <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-modal border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                Submit Leave Application
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {leaveSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-100 text-slate-800 border border-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-500">
                  Your request has been forwarded to HR/Admin for review.
                </p>
              </div>
            ) : (
              <form className="space-y-3.5" onSubmit={handleApplyLeave}>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Leave Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Paid">Paid Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Reason / Remarks</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief description of the leave reason..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={leaveLoading || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-xs"
                  >
                    {leaveLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboardPage;
