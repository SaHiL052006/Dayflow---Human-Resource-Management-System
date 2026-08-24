import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Get current authenticated user's full profile
 * @route   GET /api/profile/me
 * @access  Private (All authenticated users)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    // Ensure documents array has starter sample items if empty
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
            name: 'Company NDA Agreement',
            url: '#',
            type: 'PDF',
            uploadedAt: user.createdAt || new Date(),
          },
        ];

    const profileData = {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(res, 'Profile retrieved successfully', profileData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile (Restricted: ONLY phone, address, profilePictureUrl, name)
 * @route   PUT /api/profile/me
 * @access  Private (Employee / Authenticated User)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    const { phone, address, profilePictureUrl, name } = req.body;

    // Apply allowed employee updates only
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl.trim();
    if (name !== undefined && name.trim()) user.name = name.trim();

    // Guard against employee attempts to change restricted fields
    // (role, salaryStructure, jobDetails, employeeId, email are not updated here)

    await user.save();

    const updatedProfile = {
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

    return successResponse(res, 'Profile updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};
