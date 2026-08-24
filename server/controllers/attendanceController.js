import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Helper to format Date into YYYY-MM-DD string
export const formatDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Employee Check-in (punch in)
 * @route   POST /api/attendance/checkin
 * @access  Private (Employee / Authenticated User)
 */
export const checkIn = async (req, res, next) => {
  try {
    const today = formatDateString();
    const user = req.user;

    let record = await Attendance.findOne({
      employee: user._id,
      date: today,
    });

    if (record && record.checkInTime) {
      return successResponse(res, 'You have already checked in for today', {
        record,
        alreadyCheckedIn: true,
      });
    }

    if (!record) {
      record = new Attendance({
        employee: user._id,
        employeeId: user.employeeId,
        employeeName: user.name || user.employeeId,
        department: user.jobDetails?.department || (user.role === 'admin' ? 'Human Resources' : 'Engineering'),
        date: today,
        checkInTime: new Date(),
        status: 'Present',
      });
    } else {
      record.checkInTime = new Date();
      record.status = 'Present';
    }

    await record.save();

    return successResponse(res, 'Check-in successful! Have a productive workday.', {
      record,
      alreadyCheckedIn: false,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee Check-out (punch out)
 * @route   POST /api/attendance/checkout
 * @access  Private (Employee / Authenticated User)
 */
export const checkOut = async (req, res, next) => {
  try {
    const today = formatDateString();
    const user = req.user;

    const record = await Attendance.findOne({
      employee: user._id,
      date: today,
    });

    if (!record || !record.checkInTime) {
      return errorResponse(res, 'No check-in record found for today. Please check in first.', 400);
    }

    if (record.checkOutTime) {
      return successResponse(res, 'You have already checked out for today', {
        record,
        alreadyCheckedOut: true,
      });
    }

    record.checkOutTime = new Date();

    // Calculate duration in minutes
    const durationMs = record.checkOutTime.getTime() - record.checkInTime.getTime();
    record.workDurationMinutes = Math.max(1, Math.round(durationMs / 60000));

    // If working time is less than 4 hours (240 mins), classify as Half-day
    if (record.workDurationMinutes < 240 && record.status === 'Present') {
      record.status = 'Half-day';
    }

    await record.save();

    const hours = Math.floor(record.workDurationMinutes / 60);
    const mins = record.workDurationMinutes % 60;

    return successResponse(res, `Check-out recorded. Total shift time: ${hours}h ${mins}m.`, {
      record,
      durationFormatted: `${hours}h ${mins}m`,
      alreadyCheckedOut: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's attendance status for today
 * @route   GET /api/attendance/today-status
 * @access  Private (Authenticated User)
 */
export const getTodayStatus = async (req, res, next) => {
  try {
    const today = formatDateString();
    const record = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    const isCheckedIn = Boolean(record && record.checkInTime);
    const isCheckedOut = Boolean(record && record.checkOutTime);

    return successResponse(res, "Today's attendance status retrieved", {
      date: today,
      isCheckedIn,
      isCheckedOut,
      record: record || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in employee's attendance records (with on-the-fly Absent computation)
 * @route   GET /api/attendance/me
 * @access  Private (Authenticated User)
 */
export const getMyAttendance = async (req, res, next) => {
  try {
    const { range = 'weekly' } = req.query; // 'daily' | 'weekly' | 'monthly'
    const today = new Date();
    const todayStr = formatDateString(today);

    let daysToFetch = 7;
    if (range === 'daily') daysToFetch = 1;
    else if (range === 'monthly') daysToFetch = 30;

    // Generate date array for requested range (from today going back daysToFetch - 1 days)
    const dateList = [];
    for (let i = 0; i < daysToFetch; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dateList.push(formatDateString(d));
    }

    // Fetch existing records from MongoDB
    const existingRecords = await Attendance.find({
      employee: req.user._id,
      date: { $in: dateList },
    }).sort({ date: -1 });

    const recordMap = new Map();
    existingRecords.forEach((r) => recordMap.set(r.date, r));

    // Synthesize full attendance list with On-The-Fly Absent computation
    const fullAttendanceList = dateList.map((dateStr) => {
      if (recordMap.has(dateStr)) {
        const rec = recordMap.get(dateStr);
        const hours = (rec.workDurationMinutes / 60).toFixed(1);
        return {
          id: rec._id,
          date: dateStr,
          checkInTime: rec.checkInTime,
          checkOutTime: rec.checkOutTime,
          workDurationMinutes: rec.workDurationMinutes,
          workHours: hours,
          status: rec.status,
          isSynthetic: false,
        };
      }

      // If no record exists in MongoDB:
      const recordDate = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = recordDate.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = dateStr < todayStr;

      let computedStatus = 'Absent';
      if (isWeekend) {
        computedStatus = 'Leave'; // Weekend / Off
      } else if (dateStr === todayStr) {
        computedStatus = 'Absent'; // Not checked in yet
      } else if (isPast) {
        computedStatus = 'Absent'; // Missed past workday
      }

      return {
        id: `synth-${dateStr}`,
        date: dateStr,
        checkInTime: null,
        checkOutTime: null,
        workDurationMinutes: 0,
        workHours: '0.0',
        status: computedStatus,
        isSynthetic: true,
      };
    });

    // Summary calculation
    const presentCount = fullAttendanceList.filter((r) => r.status === 'Present').length;
    const halfDayCount = fullAttendanceList.filter((r) => r.status === 'Half-day').length;
    const absentCount = fullAttendanceList.filter((r) => r.status === 'Absent').length;
    const leaveCount = fullAttendanceList.filter((r) => r.status === 'Leave').length;
    const totalWorkingMinutes = fullAttendanceList.reduce(
      (acc, r) => acc + (r.workDurationMinutes || 0),
      0
    );

    const todayRecord = fullAttendanceList.find((r) => r.date === todayStr);

    return successResponse(res, 'Employee attendance history retrieved successfully', {
      range,
      todayStatus: {
        date: todayStr,
        isCheckedIn: Boolean(todayRecord && !todayRecord.isSynthetic && todayRecord.checkInTime),
        isCheckedOut: Boolean(todayRecord && !todayRecord.isSynthetic && todayRecord.checkOutTime),
        currentStatus: todayRecord ? todayRecord.status : 'Absent',
      },
      summary: {
        totalDays: dateList.length,
        presentCount,
        halfDayCount,
        absentCount,
        leaveCount,
        attendanceRate: `${Math.round(((presentCount + halfDayCount * 0.5) / Math.max(1, dateList.length)) * 100)}%`,
        totalHoursWorked: (totalWorkingMinutes / 60).toFixed(1),
      },
      records: fullAttendanceList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees' attendance for admin monitoring
 * @route   GET /api/attendance/admin
 * @access  Private (Admin only)
 */
export const getAdminAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, range = 'daily' } = req.query;
    const query = {};

    if (employeeId && employeeId.trim()) {
      query.employeeId = employeeId.trim().toUpperCase();
    }

    if (date && date.trim()) {
      query.date = date.trim();
    } else if (range === 'daily') {
      query.date = formatDateString();
    } else if (range === 'weekly') {
      // Last 7 days
      const dateList = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        dateList.push(formatDateString(d));
      }
      query.date = { $in: dateList };
    } else if (range === 'all') {
      // No date filter - return all records
    }

    const records = await Attendance.find(query)
      .populate('employee', 'name email employeeId jobDetails role')
      .sort({ date: -1, createdAt: -1 });

    const totalUsers = await User.countDocuments({ role: 'employee' });
    const presentToday = records.filter((r) => r.status === 'Present').length;
    const halfDayToday = records.filter((r) => r.status === 'Half-day').length;

    const formattedRecords = records.map((r) => ({
      id: r._id,
      employeeId: r.employeeId,
      name: r.employee?.name || r.employeeName || r.employeeId,
      email: r.employee?.email || '',
      department: r.department || r.employee?.jobDetails?.department || 'Engineering',
      designation: r.employee?.jobDetails?.designation || 'Software Engineer',
      date: r.date,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      workDurationMinutes: r.workDurationMinutes,
      workHours: (r.workDurationMinutes / 60).toFixed(1),
      status: r.status,
    }));

    return successResponse(res, 'Workforce attendance logs retrieved successfully', {
      querySummary: {
        filterDate: query.date || 'All dates',
        filterEmployee: employeeId || 'All employees',
        totalRecords: formattedRecords.length,
      },
      stats: {
        totalWorkforce: totalUsers,
        presentCount: presentToday,
        halfDayCount: halfDayToday,
        attendanceRate: totalUsers > 0 ? `${Math.round(((presentToday + halfDayToday * 0.5) / totalUsers) * 100)}%` : '100%',
      },
      records: formattedRecords,
    });
  } catch (error) {
    next(error);
  }
};
