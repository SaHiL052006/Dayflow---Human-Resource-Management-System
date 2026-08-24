import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  RefreshCw,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';
import { getAdminPayroll, updateEmployeePayroll } from '../services/payrollService';

export const AdminPayrollPage = () => {
  const [payrollList, setPayrollList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    employee: null,
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
    saving: false,
  });

  const loadPayroll = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await getAdminPayroll();
      setPayrollList(response.data?.payroll || []);
      setStats(response.data?.stats || null);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load workforce payroll records.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const handleOpenEdit = (emp) => {
    setEditModal({
      isOpen: true,
      employee: emp,
      basic: emp.salaryStructure?.basic || 0,
      hra: emp.salaryStructure?.hra || 0,
      allowances: emp.salaryStructure?.allowances || 0,
      deductions: emp.salaryStructure?.deductions || 0,
      saving: false,
    });
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!editModal.employee) return;

    setEditModal((prev) => ({ ...prev, saving: true }));
    try {
      const response = await updateEmployeePayroll(editModal.employee.id, {
        basic: editModal.basic,
        hra: editModal.hra,
        allowances: editModal.allowances,
        deductions: editModal.deductions,
      });

      setStatusMessage({
        type: 'success',
        text: response.message || `Salary structure for ${editModal.employee.name} updated successfully. Notification dispatched.`,
      });

      setEditModal({ isOpen: false, employee: null, basic: 0, hra: 0, allowances: 0, deductions: 0, saving: false });
      await loadPayroll();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update employee salary structure.',
      });
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Compute live preview inside modal
  const modalGross = Number(editModal.basic || 0) + Number(editModal.hra || 0) + Number(editModal.allowances || 0);
  const modalNet = Math.max(0, modalGross - Number(editModal.deductions || 0));

  // Filter employees
  const filteredList = payrollList.filter((emp) => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      deptFilter === 'all' || emp.department?.toLowerCase() === deptFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-700" />
            <span>Workforce Payroll & Compensation Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workforce Compensation & Payroll
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Administer employee salary structures, review gross/net salary disbursements, and automatically notify employees of compensation adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPayroll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Payroll'}
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

      {/* Executive Payroll KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Outlay */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Gross Outlay</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${stats?.totalMonthlyGross?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Annual: ${stats?.totalAnnualOutlay?.toLocaleString() ?? 0}
            </p>
          </div>
        </div>

        {/* Total Net Take-Home */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Net Disbursed</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${stats?.totalMonthlyNet?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Disbursed on 1st of month
            </p>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statutory Deductions</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              -${stats?.totalMonthlyDeductions?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">PF & TDS withholdings</p>
          </div>
        </div>

        {/* Average Net Salary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Net Salary</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${stats?.averageNetSalary?.toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">{stats?.totalEmployees ?? 0} active employees</p>
          </div>
        </div>
      </div>

      {/* Workforce Compensation Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Workforce Compensation Directory
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                GET /api/payroll/admin
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Edit Salary" to adjust basic pay, HRA, allowances, or tax deductions with live recalculation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee / ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
            <p className="text-xs font-medium">Loading workforce compensation records...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No employee records match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">HRA</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Gross Pay</th>
                  <th className="py-3 px-4">Net Take-Home</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    {/* Employee */}
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
                          <p className="font-semibold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {emp.employeeId} • {emp.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Basic */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      ${emp.breakdown?.basic?.toLocaleString()}
                    </td>

                    {/* HRA */}
                    <td className="py-3 px-4 text-slate-600">
                      ${emp.breakdown?.hra?.toLocaleString()}
                    </td>

                    {/* Allowances */}
                    <td className="py-3 px-4 text-slate-600">
                      ${emp.breakdown?.allowances?.toLocaleString()}
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-4 text-slate-600">
                      -${emp.breakdown?.deductions?.toLocaleString()}
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      ${emp.breakdown?.grossSalary?.toLocaleString()}
                    </td>

                    {/* Net Take Home */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">
                        ${emp.breakdown?.netSalary?.toLocaleString()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <Edit className="w-3 h-3" /> Edit Salary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Structure Editing Modal */}
      {editModal.isOpen && editModal.employee && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-modal border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  Edit Salary Structure
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editModal.employee.name} ({editModal.employee.employeeId}) • {editModal.employee.designation}
                </p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: false, employee: null, basic: 0, hra: 0, allowances: 0, deductions: 0, saving: false })}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Basic Salary ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editModal.basic}
                    onChange={(e) => setEditModal({ ...editModal, basic: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">HRA Allowance ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editModal.hra}
                    onChange={(e) => setEditModal({ ...editModal, hra: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Special Allowances ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editModal.allowances}
                    onChange={(e) => setEditModal({ ...editModal, allowances: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Statutory Deductions (PF/Tax)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editModal.deductions}
                    onChange={(e) => setEditModal({ ...editModal, deductions: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Live Calculation Preview</p>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Gross Monthly Salary:</span>
                  <span>${modalGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Total Deductions:</span>
                  <span>-${Number(editModal.deductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 text-xs font-bold text-slate-900">
                  <span>Net In-Hand Salary:</span>
                  <span>${modalNet.toLocaleString()} / mo</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, employee: null, basic: 0, hra: 0, allowances: 0, deductions: 0, saving: false })}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-75"
                >
                  {editModal.saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Structure
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

export default AdminPayrollPage;
