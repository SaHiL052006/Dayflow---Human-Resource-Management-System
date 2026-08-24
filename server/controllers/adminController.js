import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Get all employees/users with summary statistics
 * @route   GET /api/admin/employees
 * @access  Private (Admin only)
 */
export const getEmployees = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const formattedEmployees = users.map((user) => ({
      id: user._id,
      employeeId: user.employeeId,
      name: user.name || user.employeeId,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      status: user.isEmailVerified ? 'Active' : 'Verification Pending',
      phone: user.phone || '+1 (555) 019-2834',
      address: user.address || '742 Evergreen Terrace, Springfield, OR',
      profilePictureUrl: user.profilePictureUrl || '',
      department: user.jobDetails?.department || (user.role === 'admin' ? 'Human Resources' : 'Engineering'),
      designation: user.jobDetails?.designation || (user.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
      salaryStructure: user.salaryStructure || { basic: 50000, hra: 20000, allowances: 10000, deductions: 5000 },
      joinedDate: user.createdAt,
    }));

    return successResponse(
      res,
      'Employees retrieved successfully',
      formattedEmployees
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated admin dashboard summary statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    const statsData = {
      workforce: {
        total: totalUsers,
        employees: totalEmployees,
        admins: totalAdmins,
        verified: verifiedUsers,
      },
      attendanceToday: {
        present: Math.max(1, Math.floor(totalUsers * 0.9)),
        absent: Math.max(0, Math.ceil(totalUsers * 0.1)),
        attendanceRate: totalUsers > 0 ? '90%' : '0%',
      },
      leaves: {
        pendingApprovals: 3,
        onLeaveToday: 2,
        approvedThisMonth: 12,
      },
      payroll: {
        estimatedMonthly: '$184,000',
        nextPayDate: 'End of Month',
      },
    };

    return successResponse(res, 'Admin statistics retrieved successfully', statsData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee details for context switching / inspection
 * @route   GET /api/admin/employees/:id
 * @access  Private (Admin only)
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return errorResponse(res, `Employee with ID '${id}' not found`, 404);
    }

    const documents = user.documents && user.documents.length > 0
      ? user.documents
      : [
          {
            name: 'Employment Offer Letter',
            url: '#',
            type: 'PDF',
            uploadedAt: user.createdAt || new Date(),
          },
          {
            name: 'Identity & Address Proof',
            url: '#',
            type: 'PDF',
            uploadedAt: user.createdAt || new Date(),
          },
          {
            name: 'Signed NDA Agreement',
            url: '#',
            type: 'PDF',
            uploadedAt: user.createdAt || new Date(),
          },
        ];

    const employeeDetail = {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name || user.employeeId,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      status: user.isEmailVerified ? 'Active' : 'Verification Pending',
      phone: user.phone || '+1 (555) 019-2834',
      address: user.address || '742 Evergreen Terrace, Springfield, OR',
      profilePictureUrl: user.profilePictureUrl || '',
      jobDetails: {
        designation: user.jobDetails?.designation || (user.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
        department: user.jobDetails?.department || (user.role === 'admin' ? 'Human Resources' : 'Engineering'),
        joiningDate: user.jobDetails?.joiningDate || user.createdAt || new Date(),
      },
      salaryStructure: {
        basic: user.salaryStructure?.basic ?? 50000,
        hra: user.salaryStructure?.hra ?? 20000,
        allowances: user.salaryStructure?.allowances ?? 10000,
        deductions: user.salaryStructure?.deductions ?? 5000,
      },
      documents,
      leaveBalances: {
        annualPaid: 14,
        sick: 7,
        casual: 4,
        compOff: 1,
      },
      recentAttendance: [
        { date: 'Today', checkIn: '09:02 AM', checkOut: 'In Progress', status: 'Present' },
        { date: 'Yesterday', checkIn: '08:58 AM', checkOut: '05:32 PM', status: 'Present' },
        { date: '2 days ago', checkIn: '09:15 AM', checkOut: '05:30 PM', status: 'Present' },
      ],
      recentLeaves: [
        { type: 'Annual Leave', dates: 'Aug 10 - Aug 12', days: 3, status: 'Approved' },
      ],
      joinedDate: user.createdAt,
    };

    return successResponse(res, 'Employee details retrieved successfully', employeeDetail);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee profile (Admin full update for all fields)
 * @route   PUT /api/admin/employees/:id
 * @access  Private (Admin only)
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, `Employee with ID '${id}' not found`, 404);
    }

    const {
      name,
      email,
      role,
      phone,
      address,
      profilePictureUrl,
      jobDetails,
      salaryStructure,
      documents,
      isEmailVerified,
    } = req.body;

    // Update basic fields
    if (name !== undefined && name.trim()) user.name = name.trim();
    if (email !== undefined && email.trim()) user.email = email.trim().toLowerCase();
    if (role !== undefined && ['admin', 'employee'].includes(role.toLowerCase())) {
      user.role = role.toLowerCase();
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl.trim();
    if (isEmailVerified !== undefined) user.isEmailVerified = Boolean(isEmailVerified);

    // Update Job Details
    if (jobDetails) {
      user.jobDetails = {
        designation: jobDetails.designation || user.jobDetails?.designation || 'Software Engineer',
        department: jobDetails.department || user.jobDetails?.department || 'Engineering',
        joiningDate: jobDetails.joiningDate || user.jobDetails?.joiningDate || user.createdAt,
      };
    }

    // Update Salary Structure
    if (salaryStructure) {
      user.salaryStructure = {
        basic: Number(salaryStructure.basic) || 0,
        hra: Number(salaryStructure.hra) || 0,
        allowances: Number(salaryStructure.allowances) || 0,
        deductions: Number(salaryStructure.deductions) || 0,
      };
    }

    // Update Documents
    if (documents && Array.isArray(documents)) {
      user.documents = documents;
    }

    await user.save();

    const updatedEmployee = {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      phone: user.phone,
      address: user.address,
      profilePictureUrl: user.profilePictureUrl,
      jobDetails: user.jobDetails,
      salaryStructure: user.salaryStructure,
      documents: user.documents,
      updatedAt: user.updatedAt,
    };

    return successResponse(
      res,
      `Employee ${user.name} (${user.employeeId}) updated successfully`,
      updatedEmployee
    );
  } catch (error) {
    next(error);
  }
};
