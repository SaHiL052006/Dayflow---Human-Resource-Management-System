import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Users,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { getAdminAttendance } from '../services/attendanceService';
import { getEmployees } from '../services/adminService';

export const AdminAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [range, setRange] = useState('daily'); // 'daily' | 'weekly' | 'all'
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, empRes] = await Promise.all([
        getAdminAttendance({
          range,
          employeeId: selectedEmployee || undefined,
        }),
        getEmployees(),
      ]);

      setRecords(attRes.data?.records || []);
      setStats(attRes.data?.stats || null);
      setEmployees(empRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load workforce attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range, selectedEmployee]);

  // Client-side search filtering
  const filteredRecords = records.filter((rec) => {
    return (
      rec.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Attendance Header */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <CalendarCheck2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Workforce Attendance Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workforce Attendance & Punch Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Monitor real-time employee clock-ins, daily attendance rates, timesheet durations, and shift compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.totalWorkforce ?? employees.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered employees</p>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.presentCount ?? 0}
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{stats?.attendanceRate ?? '90%'} attendance rate</span>
            </p>
          </div>
        </div>

        {/* Half-Days */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Half-Day Shifts</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.halfDayCount ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">&lt; 4 hours shift</p>
          </div>
        </div>

        {/* Logged Shifts Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filtered Logs</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {records.length}
            </div>
            <p className="text-xs text-slate-600 mt-1">Punch entries</p>
          </div>
        </div>
      </div>

      {/* Workforce Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Workforce Attendance Logs
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                GET /api/attendance/admin
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live punch logs fetched from MongoDB with check-in timestamps and durations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee / ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Employee Filter */}
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>

            {/* Range Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70">
              {[
                { id: 'daily', label: 'Today' },
                { id: 'weekly', label: 'Weekly (7 Days)' },
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
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
            <p className="text-xs font-medium">Loading workforce attendance logs...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No attendance records match your filter criteria for {range === 'daily' ? 'today' : 'this week'}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center">
                          {rec.name ? rec.name[0].toUpperCase() : 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{rec.name}</p>
                          <p className="text-[10px] text-slate-400">{rec.designation}</p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {rec.employeeId}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600">
                      {rec.department}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {rec.date}
                    </td>

                    {/* Check-In */}
                    <td className="py-3 px-4 font-mono">
                      {formatTimestamp(rec.checkInTime)}
                    </td>

                    {/* Check-Out */}
                    <td className="py-3 px-4 font-mono">
                      {formatTimestamp(rec.checkOutTime)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {rec.workDurationMinutes > 0
                        ? `${Math.floor(rec.workDurationMinutes / 60)}h ${rec.workDurationMinutes % 60}m`
                        : '--'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendancePage;
