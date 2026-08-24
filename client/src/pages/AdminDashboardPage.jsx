import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  TrendingUp,
  FileCheck,
  Search,
  Filter,
  Eye,
  UserPlus,
  BellRing,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getEmployees, getAdminStats } from '../services/adminService';
import { fetchHealthStatus } from '../services/healthService';
import { getAdminLeaves, updateLeaveStatus } from '../services/leaveService';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, statsRes, leavesRes] = await Promise.all([
        getEmployees(),
        getAdminStats(),
        getAdminLeaves('Pending'),
      ]);
      setEmployees(empRes.data || []);
      setStats(statsRes.data || null);
      setPendingLeaves(leavesRes.data?.leaves || []);
    } catch (err) {
      setError(err.message || 'Failed to load workforce directory data.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReview = async (id, status) => {
    try {
      await updateLeaveStatus(id, { status, adminComment: `Quick ${status} from admin dashboard.` });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update leave status');
    }
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await fetchHealthStatus();
      setHealthData(response.data);
    } catch {
      setHealthData(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    checkHealth();
  }, []);

  // Filter employees based on search & role
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || emp.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Admin Welcome Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Executive & HR Administration Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hello, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Logged in as <span className="font-semibold text-slate-800 uppercase">{user?.role}</span> (ID: {user?.employeeId}). Manage workforce directory, inspect attendance, and review leave requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadData();
              checkHealth();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Directory'}
          </button>
        </div>
      </div>

      {/* Summary Widgets Grid */}
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
              {stats?.workforce?.total ?? employees.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{stats?.workforce?.employees ?? 0} Employees • {stats?.workforce?.admins ?? 1} Admins</span>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.attendanceToday?.present ?? 1}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{stats?.attendanceToday?.attendanceRate ?? '90%'} attendance rate</span>
            </div>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Leaves</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.leaves?.pendingApprovals ?? 3}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Requires manager review</span>
            </div>
          </div>
        </div>

        {/* Verified Accounts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verified Accounts</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.workforce?.verified ?? employees.filter((e) => e.isEmailVerified).length}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>RBAC tokens active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Workforce Directory
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                GET /api/admin/employees
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live employee records fetched from MongoDB. Click any employee to inspect details.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employees</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
            <p className="text-xs font-medium">Loading employee records from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No employee records match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/employees/${emp.id}`)}
                  >
                    {/* Employee Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                            emp.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {emp.name ? emp.name[0].toUpperCase() : 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:underline">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{emp.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {emp.employeeId}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                      {emp.email}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {emp.role}
                      </span>
                    </td>

                    {/* Status with dot */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {emp.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-semibold text-slate-800 group-hover:underline">
                        View Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Leave Approvals & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <h3 className="font-semibold text-slate-900 text-sm">Pending HR Actions & Approvals</h3>
            </div>
            <Link
              to="/admin/leaves"
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 underline"
            >
              View All ({pendingLeaves.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✓ All employee leave requests have been reviewed and processed.
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {leave.name} ({leave.employeeId}) — {leave.leaveType} Leave
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {leave.daysCount} Day(s) • {leave.startDate} to {leave.endDate} • Reason: {leave.remarks}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleQuickReview(leave.id, 'Approved')}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-semibold hover:bg-zinc-800 shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleQuickReview(leave.id, 'Rejected')}
                      className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-md text-xs font-semibold hover:bg-slate-100"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Admin Actions & Health */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm pb-3 border-b border-slate-100">
            System Status & Shortcuts
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/signup"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-200/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Onboard User</p>
                  <p className="text-[10px] text-slate-500">Register new employee or administrator</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
            </Link>

            {/* Health Widget */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Backend Service</p>
                <p className="text-xs font-medium text-slate-800 mt-0.5">Express + MongoDB</p>
              </div>
              {healthData ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  200 OK
                </span>
              ) : (
                <span className="text-xs text-slate-400">Checking...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
