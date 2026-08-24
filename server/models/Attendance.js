import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    // Normalized date string in YYYY-MM-DD format for fast, unique indexing
    date: {
      type: String,
      required: [true, 'Attendance date string is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    workDurationMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Half-day', 'Leave'],
        message: '{VALUE} is not a valid attendance status. Allowed: Present, Absent, Half-day, Leave',
      },
      default: 'Present',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: Each employee can only have one attendance record per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employeeId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
