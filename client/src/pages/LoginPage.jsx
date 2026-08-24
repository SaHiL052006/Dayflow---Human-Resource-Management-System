import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../services/authService';
import Logo from '../components/Logo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ''
  );

  const demoAccounts = [
    { label: 'Sarah Jenkins (HR)', email: 'admin@dayflow.com', pass: 'Admin@1234', role: 'admin' },
    { label: 'Chloe Bennett (Employee)', email: 'chloe.bennett@dayflow.com', pass: 'Employee@1234', role: 'employee' },
    { label: 'Ethan Vance (Engineer)', email: 'employee@dayflow.com', pass: 'Employee@1234', role: 'employee' },
    { label: 'Maya Patel (Designer)', email: 'maya.patel@dayflow.com', pass: 'Employee@1234', role: 'employee' },
    { label: 'David Kim (DevOps)', email: 'david.kim@dayflow.com', pass: 'Employee@1234', role: 'employee' },
    { label: 'Marcus Hayes (Operations)', email: 'marcus.hayes@dayflow.com', pass: 'Employee@1234', role: 'employee' },
    { label: 'Alex Mercer (HR)', email: 'hr.alex@dayflow.com', pass: 'Admin@1234', role: 'admin' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await apiLogin({ email, password });
      const { token, user } = response.data;

      // Update global auth context & localStorage
      login(user, token);

      // Redirect based on role or intended route
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (acc) => {
    setErrorMessage('');
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <Logo size="lg" variant="dark" linkTo="/" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your corporate credentials or pick a demo user below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200/90 py-8 px-6 shadow-card rounded-xl sm:px-8 space-y-5">
          {/* Quick Demo Switcher */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                1-Click Demo Accounts:
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition-all active:scale-95 ${
                    email === acc.email
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {acc.role === 'admin' ? '🛡️ ' : '👤 '}
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Success / Info Alert */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-slate-100 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700">Work Email</label>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@dayflow.com"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700">Password</label>
              </div>
              <div className="mt-1 relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
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
            <Link to="/signup" className="font-semibold text-slate-800 hover:text-slate-950">
              Create Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
