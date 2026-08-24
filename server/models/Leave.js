import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      enum: {
        values: ['Paid', 'Sick', 'Unpaid'],
        message: '{VALUE} is not a valid leave type. Allowed: Paid, Sick, Unpaid',
      },
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'],
    },
    daysCount: {
      type: Number,
      default: 1,
      min: [1, 'Leave must be at least 1 day'],
    },
    remarks: {
      type: String,
      required: [true, 'Reason/remarks for leave is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid status. Allowed: Pending, Approved, Rejected',
      },
      default: 'Pending',
    },
    adminComment: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ employee: 1, createdAt: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
