import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Generate signed JWT token
 */
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'dayflow_default_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    jwtSecret,
    { expiresIn }
  );
};

/**
 * @desc    Register new user & send email verification token
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role } = req.body;

    // Validate required fields
    if (!employeeId || !email || !password) {
      return errorResponse(res, 'Please provide Employee ID, Email, and Password', 400);
    }

    // Enforce Password Rules: min 8 chars, at least 1 number, at least 1 uppercase
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return errorResponse(
        res,
        'Password must be at least 8 characters long and contain at least one uppercase letter and one number',
        400,
        {
          rules: [
            'Minimum 8 characters',
            'At least 1 uppercase letter (A-Z)',
            'At least 1 number (0-9)',
          ],
        }
      );
    }

    // Validate Role if provided
    const validRole = role && ['admin', 'employee'].includes(role.toLowerCase())
      ? role.toLowerCase()
      : 'employee';

    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if Employee ID already exists
    const existingEmployee = await User.findOne({ employeeId: normalizedEmployeeId });
    if (existingEmployee) {
      return errorResponse(res, `Employee ID '${normalizedEmployeeId}' is already registered`, 400);
    }

    // Check if Email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return errorResponse(res, `Email '${normalizedEmail}' is already registered`, 400);
    }

    // Instantiate User
    const user = new User({
      employeeId: normalizedEmployeeId,
      name: name?.trim() || normalizedEmployeeId,
      email: normalizedEmail,
      password,
      role: validRole,
      isEmailVerified: false,
    });

    // Generate plain verification token & hash for database
    const rawVerificationToken = user.generateVerificationToken();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email/${rawVerificationToken}`;

    // Demo/Hackathon simulation: Output verification email link to server console
    console.log(`\n================== [DEMO EMAIL VERIFICATION] ==================`);
    console.log(`✉️  Recipient: ${user.email} (${user.name} - ${user.employeeId})`);
    console.log(`🔗  Verification URL: ${verificationUrl}`);
    console.log(`🔑  Token: ${rawVerificationToken}`);
    console.log(`================================================================\n`);

    return successResponse(
      res,
      'Registration successful! A verification email has been simulated. Please verify your email.',
      {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
        verification: {
          token: rawVerificationToken,
          verificationUrl,
          expiresIn: '24 hours',
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email using token
 * @route   GET /api/auth/verify/:token
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return errorResponse(res, 'Verification token is required', 400);
    }

    // Hash the incoming plain token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(
        res,
        'Invalid or expired verification token. Please request a new verification link.',
        400
      );
    }

    // Mark as verified and clear token fields
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log(`[Auth] Email verified successfully for user: ${user.email} (${user.employeeId})`);

    return successResponse(res, 'Email verified successfully! You can now log in.', {
      employeeId: user.employeeId,
      email: user.email,
      isEmailVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide both email and password', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user including hidden password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate JWT token with embedded role
    const token = generateToken(user);

    return successResponse(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  return successResponse(res, 'User profile retrieved', {
    user: req.user,
  });
};

/**
 * @desc    Logout user / clear token
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully');
};
