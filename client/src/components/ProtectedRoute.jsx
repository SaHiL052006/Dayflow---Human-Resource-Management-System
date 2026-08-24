import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Route guard component for authentication and role-based permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Optional list of allowed roles (e.g. ['admin'])
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login while saving the intended route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const defaultDashboard = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-rose-200 shadow-xl shadow-rose-500/5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider mt-1">
            403 Forbidden - Role Mismatch
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Your current role (<strong className="font-semibold text-slate-800 uppercase">{role}</strong>)
            does not have permission to access this area. Required:{' '}
            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
              {allowedRoles.join(', ')}
            </span>
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={defaultDashboard}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
