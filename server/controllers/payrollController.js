import User from '../models/User.js';
import { createNotificationHelper } from './notificationController.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Helper to compute gross and net salary breakdown
 */
export const computeSalaryBreakdown = (salaryStructure = {}) => {
  const basic = Number(salaryStructure?.basic) || 0;
  const hra = Number(salaryStructure?.hra) || 0;
  const allowances = Number(salaryStructure?.allowances) || 0;
  const deductions = Number(salaryStructure?.deductions) || 0;

  const grossSalary = basic + hra + allowances;
  const netSalary = Math.max(0, grossSalary - deductions);
  const annualGross = grossSalary * 12;
  const annualNet = netSalary * 12;

  return {
    basic,
    hra,
    allowances,
    deductions,
    grossSalary,
    netSalary,
    annualGross,
    annualNet,
  };
};

/**
 * @desc    Get logged-in employee's own payroll & salary structure breakdown
 * @route   GET /api/payroll/me
 * @access  Private (Employee / Authenticated User)
 */
export const getMyPayroll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    const breakdown = computeSalaryBreakdown(user.salaryStructure);

    // Generate recent 3 months payslips summary
    const months = ['August 2026', 'July 2026', 'June 2026'];
    const payslips = months.map((month, idx) => ({
      id: `payslip-${idx + 1}`,
      period: month,
      payDate: `2026-${String(8 - idx).padStart(2, '0')}-01`,
      grossSalary: breakdown.grossSalary,
      deductions: breakdown.deductions,
      netSalary: breakdown.netSalary,
      status: 'Paid',
      paymentMethod: 'Direct Bank Transfer',
    }));

    return successResponse(res, 'Personal payroll breakdown retrieved successfully', {
      employee: {
        id: user._id,
        name: user.name || 'Employee',
        employeeId: user.employeeId,
        email: user.email,
        department: user.jobDetails?.department || 'Engineering',
        designation: user.jobDetails?.designation || 'Software Engineer',
        joiningDate: user.jobDetails?.joiningDate || '2024-01-15',
      },
      salaryBreakdown: breakdown,
      earnings: [
        { name: 'Basic Salary', amount: breakdown.basic, frequency: 'Monthly', percent: breakdown.grossSalary > 0 ? Math.round((breakdown.basic / breakdown.grossSalary) * 100) : 50 },
        { name: 'House Rent Allowance (HRA)', amount: breakdown.hra, frequency: 'Monthly', percent: breakdown.grossSalary > 0 ? Math.round((breakdown.hra / breakdown.grossSalary) * 100) : 30 },
        { name: 'Special Allowances & Benefits', amount: breakdown.allowances, frequency: 'Monthly', percent: breakdown.grossSalary > 0 ? Math.round((breakdown.allowances / breakdown.grossSalary) * 100) : 20 },
      ],
      deductionsList: [
        { name: 'Provident Fund (PF)', amount: Math.round(breakdown.deductions * 0.5), type: 'Statutory' },
        { name: 'Income Tax (TDS / Professional Tax)', amount: Math.round(breakdown.deductions * 0.5), type: 'Tax' },
      ],
      payslips,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees' payroll for admin oversight
 * @route   GET /api/payroll/admin
 * @access  Private (Admin only)
 */
export const getAdminPayroll = async (req, res, next) => {
  try {
    const employees = await User.find().sort({ createdAt: -1 });

    let totalMonthlyGross = 0;
    let totalMonthlyNet = 0;
    let totalMonthlyDeductions = 0;

    const payrollList = employees.map((emp) => {
      const breakdown = computeSalaryBreakdown(emp.salaryStructure);
      totalMonthlyGross += breakdown.grossSalary;
      totalMonthlyNet += breakdown.netSalary;
      totalMonthlyDeductions += breakdown.deductions;

      return {
        id: emp._id,
        name: emp.name || emp.employeeId,
        email: emp.email,
        employeeId: emp.employeeId,
        role: emp.role,
        department: emp.jobDetails?.department || (emp.role === 'admin' ? 'Executive Management' : 'Engineering'),
        designation: emp.jobDetails?.designation || (emp.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
        salaryStructure: emp.salaryStructure || { basic: 0, hra: 0, allowances: 0, deductions: 0 },
        breakdown,
      };
    });

    const averageNet = employees.length > 0 ? Math.round(totalMonthlyNet / employees.length) : 0;

    return successResponse(res, 'Workforce payroll summary retrieved successfully', {
      stats: {
        totalEmployees: employees.length,
        totalMonthlyGross,
        totalMonthlyNet,
        totalMonthlyDeductions,
        totalAnnualOutlay: totalMonthlyGross * 12,
        averageNetSalary: averageNet,
      },
      payroll: payrollList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update an employee's salary structure
 * @route   PUT /api/payroll/admin/:id
 * @access  Private (Admin only)
 */
export const updateEmployeePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { basic, hra, allowances, deductions } = req.body;

    const employee = await User.findById(id);
    if (!employee) {
      return errorResponse(res, `Employee with ID '${id}' not found`, 404);
    }

    employee.salaryStructure = {
      basic: basic !== undefined ? Number(basic) : (employee.salaryStructure?.basic || 0),
      hra: hra !== undefined ? Number(hra) : (employee.salaryStructure?.hra || 0),
      allowances: allowances !== undefined ? Number(allowances) : (employee.salaryStructure?.allowances || 0),
      deductions: deductions !== undefined ? Number(deductions) : (employee.salaryStructure?.deductions || 0),
    };

    await employee.save();

    const updatedBreakdown = computeSalaryBreakdown(employee.salaryStructure);

    // Dispatch in-app notification to the employee
    await createNotificationHelper(employee._id, {
      title: 'Salary Structure Revised',
      message: `Your compensation package has been updated by HR. Net Monthly Take-Home: $${updatedBreakdown.netSalary.toLocaleString()} (Gross: $${updatedBreakdown.grossSalary.toLocaleString()}).`,
      type: 'payroll',
      link: '/employee/payroll',
    });

    // Console simulation of email notification
    console.log(`[Email Dispatch Simulation] Sent salary revision notification to ${employee.email} (Net: $${updatedBreakdown.netSalary})`);

    return successResponse(res, `Salary structure for ${employee.name || employee.employeeId} updated successfully!`, {
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        salaryStructure: employee.salaryStructure,
        breakdown: updatedBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
