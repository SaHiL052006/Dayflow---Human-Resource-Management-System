import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Calendar,
  Building,
  Briefcase,
  Edit3,
  Save,
  DollarSign,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import { getEmployeeById, updateEmployee } from '../services/adminService';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'job' | 'salary' | 'attendance' | 'leaves'
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Full editable admin form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    isEmailVerified: true,
    phone: '',
    address: '',
    profilePictureUrl: '',
    jobDetails: {
      designation: '',
      department: '',
      joiningDate: '',
    },
    salaryStructure: {
      basic: 50000,
      hra: 20000,
      allowances: 10000,
      deductions: 5000,
    },
  });

  const fetchEmployee = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await getEmployeeById(id);
      const data = response.data;
      setEmployee(data);
      setEditForm({
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'employee',
        isEmailVerified: Boolean(data.isEmailVerified),
        phone: data.phone || '',
        address: data.address || '',
        profilePictureUrl: data.profilePictureUrl || '',
        jobDetails: {
          designation: data.jobDetails?.designation || 'Software Engineer',
          department: data.jobDetails?.department || 'Engineering',
          joiningDate: data.jobDetails?.joiningDate ? data.jobDetails.joiningDate.split('T')[0] : '',
        },
        salaryStructure: {
          basic: data.salaryStructure?.basic ?? 50000,
          hra: data.salaryStructure?.hra ?? 20000,
          allowances: data.salaryStructure?.allowances ?? 10000,
          deductions: data.salaryStructure?.deductions ?? 5000,
        },
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load employee details.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleAdminSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await updateEmployee(id, editForm);
      setEmployee(response.data);
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: `Employee record for ${editForm.name} updated successfully.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update employee record.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
        <p className="text-xs font-medium text-slate-500">Loading employee profile & history...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 max-w-md mx-auto text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900">Employee Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{statusMessage.text || 'Unable to retrieve employee data.'}</p>
        <div className="mt-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Salary calculations
  const basic = Number(editForm.salaryStructure?.basic) || 0;
  const hra = Number(editForm.salaryStructure?.hra) || 0;
  const allowances = Number(editForm.salaryStructure?.allowances) || 0;
  const deductions = Number(editForm.salaryStructure?.deductions) || 0;
  const gross = basic + hra + allowances;
  const net = gross - deductions;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Context Switch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span className="font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
            Admin Control
          </span>
          <span>
            Managing Record: <strong className="font-semibold text-slate-900">{employee.name}</strong> ({employee.employeeId})
          </span>
        </div>

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Workforce Directory
        </Link>
      </div>

      {/* Status Alerts */}
      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-slate-100 text-slate-800 border border-slate-200'
              : 'bg-slate-100 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Employee Profile Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {employee.profilePictureUrl ? (
            <img
              src={employee.profilePictureUrl}
              alt={employee.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-2xs ${
                employee.role === 'admin' ? 'bg-zinc-900' : 'bg-slate-800'
              }`}
            >
              {employee.name ? employee.name[0].toUpperCase() : 'E'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{employee.name}</h1>
              <span className="font-mono text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {employee.employeeId}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                {employee.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {employee.jobDetails?.designation || 'Software Engineer'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {employee.jobDetails?.department || 'Engineering'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {employee.email}
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isEditing
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit Mode' : 'Edit Employee Profile'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Contact', icon: User },
          { id: 'job', label: 'Job & Department', icon: Briefcase },
          { id: 'salary', label: 'Salary & Compensation', icon: DollarSign },
          { id: 'attendance', label: 'Attendance Logs', icon: Clock },
          { id: 'leaves', label: 'Leave Balances', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form & Tab Content */}
      <form onSubmit={handleAdminSave}>
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          {/* Tab 1: Profile & Contact */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Personal & Contact Information</h3>
                {isEditing && (
                  <span className="text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Admin Editing Mode
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Work Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">System Role</label>
                  {isEditing ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Administrator</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-slate-800 uppercase bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.role}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Residential Address</label>
                  {isEditing ? (
                    <textarea
                      rows="2"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.address || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Job & Department */}
          {activeTab === 'job' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Employment & Organizational Assignment</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Designation / Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.jobDetails.designation}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jobDetails: { ...editForm.jobDetails, designation: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.jobDetails?.designation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Department</label>
                  {isEditing ? (
                    <select
                      value={editForm.jobDetails.department}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jobDetails: { ...editForm.jobDetails, department: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Finance & Operations">Finance & Operations</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {employee.jobDetails?.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Official Joining Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.jobDetails.joiningDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          jobDetails: { ...editForm.jobDetails, joiningDate: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {new Date(employee.jobDetails?.joiningDate || employee.joinedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Salary Structure */}
          {activeTab === 'salary' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Compensation & Payroll Rules</h3>
                  <p className="text-slate-500">Configure basic salary, allowances, and tax deduction rates</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Basic Salary ($)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.salaryStructure.basic}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          salaryStructure: {
                            ...editForm.salaryStructure,
                            basic: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      ${basic.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">HRA ($)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.salaryStructure.hra}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          salaryStructure: {
                            ...editForm.salaryStructure,
                            hra: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      ${hra.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Special Allowances ($)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.salaryStructure.allowances}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          salaryStructure: {
                            ...editForm.salaryStructure,
                            allowances: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      ${allowances.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Deductions ($)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.salaryStructure.deductions}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          salaryStructure: {
                            ...editForm.salaryStructure,
                            deductions: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      -${deductions.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Calculated Net In-Hand Pay</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5">${net.toLocaleString()}</p>
                </div>
                <div className="text-xs text-slate-600 sm:text-right">
                  <p>Gross Monthly CTC: <strong>${gross.toLocaleString()}</strong></p>
                  <p className="text-[11px] text-slate-400">Annual CTC: ${(gross * 12).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Attendance Records */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Attendance Logs & Timestamps</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Check-In</th>
                      <th className="py-2.5 px-4">Check-Out</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {employee.recentAttendance?.map((att, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{att.date}</td>
                        <td className="py-3 px-4 font-mono">{att.checkIn}</td>
                        <td className="py-3 px-4 font-mono">{att.checkOut}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Leave Balances */}
          {activeTab === 'leaves' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Leave Balances</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <p className="text-slate-500">Paid Annual</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employee.leaveBalances?.annualPaid || 14} Days</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <p className="text-slate-500">Sick Leave</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employee.leaveBalances?.sick || 7} Days</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <p className="text-slate-500">Casual Leave</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employee.leaveBalances?.casual || 5} Days</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70">
                  <p className="text-slate-500">Comp Off</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{employee.leaveBalances?.compOff || 1} Day</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Floating Bar for Admin */}
        {isEditing && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-900 text-white shadow-modal border border-slate-800 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-300">
              Admin Mode: Save changes to update MongoDB employee records.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-zinc-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-75"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Record
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EmployeeDetailPage;
