import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  CalendarX,
  History,
  Timer,
  FileSpreadsheet,
} from 'lucide-react';
import {
  checkIn,
  checkOut,
  getMyAttendance,
} from '../services/attendanceService';
import { useAuth } from '../hooks/useAuth';

export const EmployeeAttendancePage = () => {
  const { user } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [range, setRange] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async (selectedRange = range) => {
    setLoading(true);
    try {
      const response = await getMyAttendance(selectedRange);
      setAttendanceData(response.data);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load attendance logs.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(range);
  }, [range]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await checkIn();
      setStatusMessage({
        type: 'success',
        text: response.message || 'Checked in successfully. Have a great workday!',
      });
      await loadAttendance(range);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Check-in failed. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await checkOut();
      setStatusMessage({
        type: 'success',
        text: response.message || 'Check-out recorded. Total hours updated.',
      });
      await loadAttendance(range);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Check-out failed. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const todayStatus = attendanceData?.todayStatus;
  const isCheckedIn = todayStatus?.isCheckedIn;
  const isCheckedOut = todayStatus?.isCheckedOut;
  const summary = attendanceData?.summary;

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            Attendance & Work Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily work sessions, punch in/out timestamps, and view your weekly attendance history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAttendance(range)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Status Messages */}
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
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Punch Clock & Today Status Card - Sleek Dark Theme */}
      <div className="bg-[#111827] border border-slate-800 text-white rounded-xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Live Clock & Date */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
            <Timer className="w-3.5 h-3.5 text-emerald-400" />
            Real-Time Punch Station
          </div>

          <div className="space-y-0.5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </div>
            <p className="text-slate-400 text-xs font-medium">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Employee ID: <strong className="text-white font-mono">{user?.employeeId}</strong></span>
            <span>•</span>
            <span>Shift: <strong className="text-white">General (9:00 AM - 6:00 PM)</strong></span>
          </div>
        </div>

        {/* Right: Punch Actions & State */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="text-left space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Today's Punch Status</p>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCheckedOut
                    ? 'bg-slate-400'
                    : isCheckedIn
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-xs text-white">
                {isCheckedOut
                  ? 'Shift Completed Today'
                  : isCheckedIn
                  ? 'Checked In (Active Shift)'
                  : 'Not Checked In'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isCheckedOut
                ? 'Working hours for today are finalized.'
                : isCheckedIn
                ? 'Session timer is active. Punch out before leaving.'
                : 'Click Check In to start recording shift.'}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-all disabled:opacity-70 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {actionLoading ? 'Checking In...' : 'Check In Shift'}
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-lg shadow-xs transition-all disabled:opacity-70 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                {actionLoading ? 'Recording...' : 'Check Out Shift'}
              </button>
            ) : (
              <div className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Shift Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Present Days */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present Days</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {summary?.presentCount ?? 0}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {summary?.attendanceRate ?? '100%'} Attendance
            </p>
          </div>
        </div>

        {/* Half Days */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Half-Days</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {summary?.halfDayCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">&lt; 4 hours logged</p>
          </div>
        </div>

        {/* Absences */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Absences</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {summary?.absentCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Missed workdays</p>
          </div>
        </div>

        {/* Total Working Hours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Hours</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {summary?.totalHoursWorked ?? '0.0'} hrs
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Logged work time</p>
          </div>
        </div>
      </div>

      {/* Attendance History Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Controls & Range Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              Attendance Record History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily punch records with automatic absence calculations for missed working days.
            </p>
          </div>

          {/* Range Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70">
            {[
              { id: 'daily', label: 'Today' },
              { id: 'weekly', label: 'Last 7 Days' },
              { id: 'monthly', label: 'Last 30 Days' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setRange(btn.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === btn.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Data */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
            <p className="text-xs font-medium">Loading attendance records...</p>
          </div>
        ) : !attendanceData?.records || attendanceData.records.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No attendance records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendanceData.records.map((rec) => {
                  const recordDate = new Date(rec.date + 'T00:00:00');
                  const weekday = recordDate.toLocaleDateString(undefined, { weekday: 'short' });

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{rec.date}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                            {weekday}
                          </span>
                        </div>
                      </td>

                      {/* Check-In */}
                      <td className="py-3 px-4 font-mono">
                        {rec.checkInTime ? formatTimestamp(rec.checkInTime) : '--:--'}
                      </td>

                      {/* Check-Out */}
                      <td className="py-3 px-4 font-mono">
                        {rec.checkOutTime ? formatTimestamp(rec.checkOutTime) : '--:--'}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {rec.workDurationMinutes > 0
                            ? `${Math.floor(rec.workDurationMinutes / 60)}h ${rec.workDurationMinutes % 60}m`
                            : '--'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === 'Present'
                                ? 'bg-emerald-500'
                                : rec.status === 'Half-day'
                                ? 'bg-amber-500'
                                : rec.status === 'Leave'
                                ? 'bg-indigo-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {rec.status}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {rec.isSynthetic ? 'Auto-computed absent' : 'Punch verified'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendancePage;
