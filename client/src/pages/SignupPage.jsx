import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { signup as apiSignup } from '../services/authService';
import Logo from '../components/Logo';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Live password validation rules
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side rule validation
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet all security criteria.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Create Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiSignup({
        employeeId: formData.employeeId,
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccessInfo(response.data);
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please check the provided information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo size="lg" variant="dark" linkTo="/" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Create an Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200/90 py-8 px-6 shadow-card rounded-xl sm:px-8 space-y-5">
          {/* If Registration is successful, show Email Verification Card */}
          {successInfo ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">Account Registered</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verification link issued for{' '}
                  <strong className="text-slate-800">{successInfo.user.email}</strong>.
                </p>
              </div>

              {/* Simulation Demo Box */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Verification Simulation</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  The SHA-256 verification token was generated and logged to the server console:
                </p>
                <div className="pt-1">
                  <Link
                    to={`/verify-email/${successInfo.verification.token}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify Email Now
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                >
                  Proceed to Login
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-slate-100 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleSubmit}>
                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="employeeId"
                      required
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="e.g. EMP-101 or HR-001"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-700">Full Name</label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="employee@dayflow.com"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Create Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* Password Rules Indicators */}
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Criteria:</p>
                    <div className="grid grid-cols-1 gap-0.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>Minimum 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasUppercase ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>At least 1 uppercase letter (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                        <span>At least 1 number (0-9)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    {formData.confirmPassword && (
                      <span className={`text-[10px] font-medium flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {passwordsMatch ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Passwords match
                          </>
                        ) : (
                          'Passwords do not match'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`block w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 transition-all ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-slate-900 focus:border-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  >
                    <option value="employee">Employee (Self-Service)</option>
                    <option value="admin">Administrator / HR (Governance)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !isPasswordValid ||
                      !passwordsMatch ||
                      !formData.employeeId ||
                      !formData.email
                    }
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Link to="/" className="hover:text-slate-900 transition-colors">
                  ← Landing Page
                </Link>
                <Link to="/login" className="font-semibold text-slate-800 hover:text-slate-950">
                  Sign In →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
