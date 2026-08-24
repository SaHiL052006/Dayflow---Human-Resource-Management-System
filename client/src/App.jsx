import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import EmployeeLeavePage from './pages/EmployeeLeavePage';
import AdminLeaveApprovalsPage from './pages/AdminLeaveApprovalsPage';
import EmployeePayrollPage from './pages/EmployeePayrollPage';
import AdminPayrollPage from './pages/AdminPayrollPage';
import AdminReportsPage from './pages/AdminReportsPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Smart Root / Entry Point: Show Landing Page if logged-out, Dashboard if logged-in
const RootRedirector = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <DashboardRedirector />;
  }

  return <LandingPage />;
};

// Smart Dashboard Redirector component based on authenticated role
const DashboardRedirector = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
};

// Smart Attendance Redirector component based on authenticated role
const AttendanceRedirector = () => {
  const { role } = useAuth();
  if (role === 'admin') {
    return <Navigate to="/admin/attendance" replace />;
  }
  return <Navigate to="/employee/attendance" replace />;
};

// Smart Leave Redirector component based on authenticated role
const LeaveRedirector = () => {
  const { role } = useAuth();
  if (role === 'admin') {
    return <Navigate to="/admin/leaves" replace />;
  }
  return <Navigate to="/employee/leave" replace />;
};

// Smart Payroll Redirector component based on authenticated role
const PayrollRedirector = () => {
  const { role } = useAuth();
  if (role === 'admin') {
    return <Navigate to="/admin/payroll" replace />;
  }
  return <Navigate to="/employee/payroll" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing Page / Root */}
        <Route path="/" element={<RootRedirector />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Smart root redirects */}
        <Route path="/dashboard" element={<DashboardRedirector />} />
        <Route path="/attendance" element={<AttendanceRedirector />} />
        <Route path="/leaves" element={<LeaveRedirector />} />
        <Route path="/payroll" element={<PayrollRedirector />} />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Role-Protected Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Admin Employee Detail / Context Inspection */}
        <Route
          path="/admin/employees/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <EmployeeDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Admin Attendance Operations */}
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminAttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Admin Leave Approvals */}
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminLeaveApprovalsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Admin Payroll & Compensation Engine */}
        <Route
          path="/admin/payroll"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminPayrollPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Admin Analytics & Reports */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Employee Dashboard */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Layout>
                <EmployeeDashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Employee Attendance */}
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <Layout>
                <EmployeeAttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Employee Leave Management */}
        <Route
          path="/employee/leave"
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <Layout>
                <EmployeeLeavePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Role-Protected Employee Payroll & Payslips */}
        <Route
          path="/employee/payroll"
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <Layout>
                <EmployeePayrollPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Employee Profile Page (All authenticated employees & users) */}
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <Layout>
                <EmployeeProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-800">Organization Settings</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Company profile, working hours, role permissions, and security policies.
                  </p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
