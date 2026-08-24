import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
      default: function () {
        return this.employeeId || 'Employee';
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in query results by default
    },
    role: {
      type: String,
      enum: {
        values: ['employee', 'admin'],
        message: '{VALUE} is not a valid role. Allowed roles: employee, admin',
      },
      default: 'employee',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },

    // Extended Profile Fields (Stage 4)
    phone: {
      type: String,
      trim: true,
      default: '+1 (555) 019-2834',
    },
    address: {
      type: String,
      trim: true,
      default: '742 Evergreen Terrace, Springfield, OR',
    },
    profilePictureUrl: {
      type: String,
      trim: true,
      default: '',
    },
    jobDetails: {
      designation: {
        type: String,
        trim: true,
        default: function () {
          return this.role === 'admin' ? 'HR Administrator' : 'Software Engineer';
        },
      },
      department: {
        type: String,
        trim: true,
        default: function () {
          return this.role === 'admin' ? 'Human Resources' : 'Engineering';
        },
      },
      joiningDate: {
        type: Date,
        default: Date.now,
      },
    },
    salaryStructure: {
      basic: {
        type: Number,
        default: 50000,
      },
      hra: {
        type: Number,
        default: 20000,
      },
      allowances: {
        type: Number,
        default: 10000,
      },
      deductions: {
        type: Number,
        default: 5000,
      },
    },
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          default: 'PDF',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token (random 32 bytes hex)
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
  return token;
};

const User = mongoose.model('User', userSchema);

export default User;
