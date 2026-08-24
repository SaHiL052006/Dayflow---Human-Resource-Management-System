import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  Printer,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Users,
  Clock,
  FileSpreadsheet,
  DollarSign,
} from 'lucide-react';
import {
  getAttendanceSummary,
  getLeaveSummary,
  getSalarySlip,
} from '../services/reportService';
import { getAdminPayroll } from '../services/payrollService';

export const AdminReportsPage = () => {
  const [attReport, setAttReport] = useState(null);
  const [leaveReport, setLeaveReport] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Salary Slip Generator State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [generatingSlip, setGeneratingSlip] = useState(false);
  const [generatedSlip, setGeneratedSlip] = useState(null);
  const [slipError, setSlipError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, leaveRes, payrollRes] = await Promise.all([
        getAttendanceSummary(),
        getLeaveSummary(),
        getAdminPayroll(),
      ]);

      setAttReport(attRes.data);
      setLeaveReport(leaveRes.data);
      const empList = payrollRes.data?.payroll || [];
      setEmployees(empList);
      if (empList.length > 0 && !selectedEmpId) {
        setSelectedEmpId(empList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workforce analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateSlip = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      setSlipError('Please select an employee');
      return;
    }

    setGeneratingSlip(true);
    setSlipError('');
    try {
      const res = await getSalarySlip(selectedEmpId, selectedMonth);
      setGeneratedSlip(res.data);
    } catch (err) {
      setSlipError(err.message || 'Failed to generate salary slip.');
    } finally {
      setGeneratingSlip(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
            <span>Executive Intelligence & Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workforce Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Company-wide attendance analytics, leave distribution breakdowns, department metrics, and official salary slip export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
          <p className="text-xs font-medium">Computing workforce analytics & reports...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-slate-100 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* 4 Summary Analytics KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Workforce Headcount */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Workforce</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {attReport?.summary?.totalWorkforce || employees.length || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">100% RBAC Registered</p>
              </div>
            </div>

            {/* Overall Attendance Rate */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {attReport?.summary?.overallAttendanceRate || '95%'}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{attReport?.summary?.presentCount || 0} full shifts recorded</span>
                </p>
              </div>
            </div>

            {/* Total Approved Leave Days */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {leaveReport?.summary?.totalApprovedDays || 0} Days
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {leaveReport?.summary?.approvedCount || 0} requests sanctioned
                </p>
              </div>
            </div>

            {/* Leave Approval Rate */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {leaveReport?.summary?.approvalRate || '90%'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {leaveReport?.summary?.pendingCount || 0} pending review
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Charts & Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Attendance Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700" />
                  Attendance Status Distribution
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Company-wide</span>
              </div>

              {/* Visual Bars */}
              <div className="space-y-3 pt-1">
                {attReport?.statusDistribution?.map((item) => (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-slate-900 font-semibold">{item.count} logs ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-slate-800"
                        style={{
                          width: `${Math.max(4, item.percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Department Table Breakdown */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-2">Department Attendance Overview</p>
                <div className="divide-y divide-slate-100 text-xs">
                  {attReport?.departmentStats?.map((dept) => (
                    <div key={dept.department} className="py-2 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">{dept.department}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{dept.presentCount}/{dept.totalCount} active</span>
                        <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.2 rounded font-semibold text-[10px]">
                          {dept.rate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 2: Leave Types & Status Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                  Leave Request Analytics
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Total: {leaveReport?.summary?.totalRequests || 0}</span>
              </div>

              {/* Leave Type Bars */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold text-slate-900">Applications by Category</p>
                {leaveReport?.leaveTypeDistribution?.map((item) => (
                  <div key={item.type} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{item.type}</span>
                      <span className="text-slate-900 font-semibold">{item.count} requests ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-slate-700"
                        style={{
                          width: `${Math.max(4, item.percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Breakdown Grid */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-2">Request Status Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Approved</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{leaveReport?.summary?.approvedCount || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Pending</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{leaveReport?.summary?.pendingCount || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-[10px] uppercase font-semibold text-slate-500">Rejected</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{leaveReport?.summary?.rejectedCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Official Salary Slip Generator & Exporter */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-700" />
                  Generate & Export Official Salary Slip
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an employee and billing cycle to generate a statement with number-to-words net pay and print view.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded w-fit">
                GET /api/admin/reports/salary-slip/:id
              </span>
            </div>

            <form onSubmit={handleGenerateSlip} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId}) — {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Billing Period / Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="August 2026">August 2026 (Current Cycle)</option>
                  <option value="July 2026">July 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="May 2026">May 2026</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={generatingSlip}
                  className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {generatingSlip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating Slip...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" /> Generate Salary Slip
                    </>
                  )}
                </button>
              </div>
            </form>

            {slipError && (
              <div className="p-3 bg-slate-100 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {slipError}
              </div>
            )}
          </div>
        </>
      )}

      {/* Official Generated Salary Slip Modal */}
      {generatedSlip && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-7 shadow-modal border border-slate-200 space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Payslip Header with Company Logo */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    DF
                  </div>
                  <span className="font-bold text-base text-slate-900">
                    {generatedSlip.company?.name || 'Dayflow HRMS Inc.'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  {generatedSlip.company?.address} • {generatedSlip.company?.email}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded">
                  {generatedSlip.period}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Ref: {generatedSlip.slipNumber}
                </p>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Employee Name</p>
                <p className="font-semibold text-slate-900">{generatedSlip.employee?.name}</p>
                <p className="text-slate-500 text-[11px]">{generatedSlip.employee?.email}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Employee ID & Dept</p>
                <p className="font-semibold text-slate-900 font-mono">{generatedSlip.employee?.employeeId}</p>
                <p className="text-slate-500 text-[11px]">{generatedSlip.employee?.department}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Designation & Bank</p>
                <p className="font-semibold text-slate-900">{generatedSlip.employee?.designation}</p>
                <p className="text-slate-500 text-[11px]">{generatedSlip.employee?.bankAccount}</p>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                <p className="font-semibold text-slate-900 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">
                  Earnings
                </p>
                {generatedSlip.earnings?.map((e) => (
                  <div key={e.label} className="flex justify-between text-slate-700">
                    <span>{e.label}</span>
                    <span className="font-medium text-slate-900">${e.amount?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-semibold text-slate-900">
                  <span>Gross Earnings</span>
                  <span>${generatedSlip.totals?.grossSalary?.toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                <p className="font-semibold text-slate-900 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100">
                  Statutory Deductions
                </p>
                {generatedSlip.deductions?.map((d) => (
                  <div key={d.label} className="flex justify-between text-slate-600">
                    <span>{d.label}</span>
                    <span className="font-medium">-${d.amount?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-semibold text-slate-900">
                  <span>Total Deductions</span>
                  <span>-${generatedSlip.totals?.totalDeductions?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Amount Banner */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Take-Home</span>
                <span className="text-lg font-bold text-slate-900">${generatedSlip.totals?.netSalary?.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Amount in Words: <span className="italic font-medium">{generatedSlip.totals?.netSalaryInWords}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>

              <button
                onClick={() => setGeneratedSlip(null)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
