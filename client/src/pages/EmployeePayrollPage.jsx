import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Printer,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { getMyPayroll } from '../services/payrollService';

export const EmployeePayrollPage = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const loadPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyPayroll();
      setPayrollData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load compensation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const b = payrollData?.salaryBreakdown;
  const emp = payrollData?.employee;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-7 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-700" />
            <span>Personal Compensation & Salary Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Salary & Compensation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Detailed breakdown of your basic earnings, allowances, statutory deductions, and monthly salary slips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPayroll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Payroll
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
          <p className="text-xs font-medium">Loading your salary structure...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-slate-100 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* 4 Summary KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Net In-Hand Salary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Take-Home Pay</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  ${b?.netSalary?.toLocaleString() ?? 0}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Direct ACH disbursement
                </p>
              </div>
            </div>

            {/* 2. Monthly Gross Earnings */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Pay</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  ${b?.grossSalary?.toLocaleString() ?? 0}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Basic + HRA + Allowances</p>
              </div>
            </div>

            {/* 3. Monthly Deductions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Deductions</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  -${b?.deductions?.toLocaleString() ?? 0}
                  <span className="text-xs font-normal text-slate-400"> / mo</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">PF & Tax withholdings</p>
              </div>
            </div>

            {/* 4. Annual CTC */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Annual CTC</span>
                <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  ${b?.annualGross?.toLocaleString() ?? 0}
                  <span className="text-xs font-normal text-slate-400"> / yr</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Net: ${b?.annualNet?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid: Earnings vs Deductions Breakdown + Payslips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Itemized Earnings and Deductions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Earnings Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                    Earnings Breakdown
                  </h3>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    Gross: ${b?.grossSalary?.toLocaleString() ?? 0}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {payrollData.earnings?.map((item) => (
                    <div
                      key={item.name}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.frequency} disbursement</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-xs">${item.amount?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">{item.percent}% of gross</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-slate-700" />
                    Statutory & Tax Deductions
                  </h3>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    Total: -${b?.deductions?.toLocaleString() ?? 0}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {payrollData.deductionsList?.map((item) => (
                    <div
                      key={item.name}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.type} contribution</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-xs">-${item.amount?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">Monthly withholding</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Recent Monthly Payslips */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    Monthly Salary Slips
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official payslips generated at the end of each billing cycle.
                  </p>
                </div>

                <div className="mt-3 space-y-2.5">
                  {payrollData.payslips?.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{slip.period}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Paid on {slip.payDate}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-700 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          {slip.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          ${slip.netSalary?.toLocaleString()}
                        </p>
                        <button
                          onClick={() => setSelectedPayslip(slip)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-800 hover:text-slate-950 underline"
                        >
                          <Eye className="w-3 h-3" /> View Slip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Bank Transfer Badge */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Salaries deposited directly via ACH / Wire Transfer.</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Printable Payslip Modal */}
      {selectedPayslip && emp && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-slate-200 space-y-4 text-slate-800">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    DF
                  </div>
                  <span className="font-bold text-sm text-slate-900">Dayflow HRMS Inc.</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Official Statement of Earnings</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {selectedPayslip.period}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Date: {selectedPayslip.payDate}</p>
              </div>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Employee Name</p>
                <p className="font-semibold text-slate-900">{emp.name}</p>
                <p className="text-slate-500 text-[11px]">{emp.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Employee ID & Dept</p>
                <p className="font-semibold text-slate-900">{emp.employeeId}</p>
                <p className="text-slate-500 text-[11px]">{emp.department} • {emp.designation}</p>
              </div>
            </div>

            {/* Pay Table */}
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-medium text-slate-900">${b?.basic?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-medium text-slate-900">${b?.hra?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Special Allowances</span>
                <span className="font-medium text-slate-900">${b?.allowances?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Statutory Deductions (PF + TDS)</span>
                <span className="font-medium">-${b?.deductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-100 px-3 rounded-md font-semibold text-slate-900 text-xs mt-2">
                <span>Net In-Hand Salary</span>
                <span>${selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" /> Print Statement
              </button>

              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold"
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

export default EmployeePayrollPage;
