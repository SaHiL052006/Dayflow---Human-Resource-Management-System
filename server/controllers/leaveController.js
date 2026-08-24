import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { createNotificationHelper } from './notificationController.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Helper to calculate days count between two YYYY-MM-DD date strings
export const calculateDaysCount = (startStr, endStr) => {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

// Helper to generate array of date strings between start and end dates (inclusive)
export const getDatesInRange = (startStr, endStr) => {
  const dates = [];
  const curr = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');

  while (curr <= end) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee / Authenticated User)
 */
export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;
    const user = req.user;

    if (!leaveType || !startDate || !endDate || !remarks) {
      return errorResponse(res, 'Please provide leaveType, startDate, endDate, and remarks', 400);
    }

    if (startDate > endDate) {
      return errorResponse(res, 'Start date cannot be after end date', 400);
    }

    const daysCount = calculateDaysCount(startDate, endDate);

    const newLeave = new Leave({
      employee: user._id,
      employeeId: user.employeeId,
      employeeName: user.name || user.employeeId,
      department: user.jobDetails?.department || (user.role === 'admin' ? 'Human Resources' : 'Engineering'),
      leaveType,
      startDate,
      endDate,
      daysCount,
      remarks: remarks.trim(),
      status: 'Pending',
    });

    await newLeave.save();

    return successResponse(
      res,
      `Leave application for ${daysCount} day(s) submitted successfully!`,
      newLeave,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's leave requests history and computed balances
 * @route   GET /api/leaves/me
 * @access  Private (Authenticated User)
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });

    // Compute used approved leaves
    let usedPaid = 0;
    let usedSick = 0;
    let usedUnpaid = 0;
    let pendingCount = 0;

    leaves.forEach((l) => {
      if (l.status === 'Approved') {
        if (l.leaveType === 'Paid') usedPaid += l.daysCount;
        else if (l.leaveType === 'Sick') usedSick += l.daysCount;
        else if (l.leaveType === 'Unpaid') usedUnpaid += l.daysCount;
      } else if (l.status === 'Pending') {
        pendingCount += 1;
      }
    });

    const balances = {
      paid: {
        total: 14,
        used: usedPaid,
        remaining: Math.max(0, 14 - usedPaid),
      },
      sick: {
        total: 7,
        used: usedSick,
        remaining: Math.max(0, 7 - usedSick),
      },
      unpaid: {
        used: usedUnpaid,
      },
      pendingRequests: pendingCount,
    };

    return successResponse(res, 'Leave history retrieved successfully', {
      balances,
      totalRequests: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workforce leave requests for admin oversight
 * @route   GET /api/leaves/admin
 * @access  Private (Admin only)
 */
export const getAdminLeaves = async (req, res, next) => {
  try {
    const { status, employeeId } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (employeeId && employeeId.trim()) {
      filter.employeeId = employeeId.trim().toUpperCase();
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'name email employeeId jobDetails role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    // Count stats across all leaves
    const pendingTotal = await Leave.countDocuments({ status: 'Pending' });
    const approvedTotal = await Leave.countDocuments({ status: 'Approved' });
    const rejectedTotal = await Leave.countDocuments({ status: 'Rejected' });

    const formattedLeaves = leaves.map((l) => ({
      id: l._id,
      employeeId: l.employeeId,
      name: l.employee?.name || l.employeeName || l.employeeId,
      email: l.employee?.email || '',
      department: l.department || l.employee?.jobDetails?.department || 'Engineering',
      designation: l.employee?.jobDetails?.designation || 'Software Engineer',
      leaveType: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      daysCount: l.daysCount,
      remarks: l.remarks,
      status: l.status,
      adminComment: l.adminComment || '',
      reviewedBy: l.reviewedBy?.name || null,
      reviewedAt: l.reviewedAt || null,
      createdAt: l.createdAt,
    }));

    return successResponse(res, 'Workforce leave requests retrieved successfully', {
      stats: {
        pendingCount: pendingTotal,
        approvedCount: approvedTotal,
        rejectedCount: rejectedTotal,
        totalCount: pendingTotal + approvedTotal + rejectedTotal,
      },
      leaves: formattedLeaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin approve or reject a leave request (with automatic Attendance sync)
 * @route   PATCH /api/leaves/admin/:id
 * @access  Private (Admin only)
 */
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment = '' } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return errorResponse(res, "Status must be either 'Approved' or 'Rejected'", 400);
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return errorResponse(res, `Leave request with ID '${id}' not found`, 404);
    }

    leave.status = status;
    leave.adminComment = adminComment.trim();
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();

    await leave.save();

    // If Approved, automatically synchronize Attendance records for those dates with status: 'Leave'
    if (status === 'Approved') {
      const datesToMark = getDatesInRange(leave.startDate, leave.endDate);

      for (const dateStr of datesToMark) {
        let attRecord = await Attendance.findOne({
          employee: leave.employee,
          date: dateStr,
        });

        if (!attRecord) {
          attRecord = new Attendance({
            employee: leave.employee,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            department: leave.department,
            date: dateStr,
            status: 'Leave',
            notes: `Leave Approved: ${leave.leaveType} (${leave.remarks})`,
          });
        } else {
          attRecord.status = 'Leave';
          attRecord.notes = `Leave Approved: ${leave.leaveType} (${leave.remarks})`;
        }

        await attRecord.save();
      }
    }

    // Dispatch in-app notification to the applicant employee
    await createNotificationHelper(leave.employee, {
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request (${leave.daysCount} day(s) from ${leave.startDate} to ${leave.endDate}) has been ${status.toLowerCase()} by ${req.user.name || 'HR Admin'}.${adminComment ? ' Remarks: ' + adminComment : ''}`,
      type: 'leave',
      link: '/employee/leave',
    });

    // Console simulation of email notification
    console.log(`[Email Dispatch Simulation] Sent leave ${status.toLowerCase()} email alert to employee for leave ID ${leave._id}`);

    return successResponse(
      res,
      `Leave request ${status.toLowerCase()} successfully! Attendance records synchronized.`,
      leave
    );
  } catch (error) {
    next(error);
  }
};
