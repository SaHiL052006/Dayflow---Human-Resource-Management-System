import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Download,
  Lock,
  Info,
  DollarSign,
} from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

export const EmployeeProfilePage = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Edit form state (limited to allowed employee fields)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    profilePictureUrl: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await getMyProfile();
      const data = response.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        profilePictureUrl: data.profilePictureUrl || '',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load user profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage({
          type: 'error',
          text: 'Image file size must be less than 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePictureUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await updateMyProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        profilePictureUrl: formData.profilePictureUrl,
      });

      setProfile(response.data);
      updateUser({
        name: response.data.name,
        phone: response.data.phone,
        address: response.data.address,
      });

      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: 'Your profile has been updated successfully.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
        <p className="text-xs font-medium text-slate-500">Loading your profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-md mx-auto text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-900">Profile Not Available</h3>
        <p className="text-xs text-slate-500 mt-1">{statusMessage.text || 'Unable to retrieve profile.'}</p>
        <button
          onClick={loadProfile}
          className="mt-3 px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Salary calculations
  const basic = profile.salaryStructure?.basic || 50000;
  const hra = profile.salaryStructure?.hra || 20000;
  const allowances = profile.salaryStructure?.allowances || 10000;
  const deductions = profile.salaryStructure?.deductions || 5000;
  const grossSalary = basic + hra + allowances;
  const netSalary = grossSalary - deductions;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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

      {/* Main Profile Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            {formData.profilePictureUrl || profile.profilePictureUrl ? (
              <img
                src={formData.profilePictureUrl || profile.profilePictureUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-2xs ${
                  profile.role === 'admin' ? 'bg-zinc-900' : 'bg-slate-800'
                }`}
              >
                {profile.name ? profile.name[0].toUpperCase() : 'E'}
              </div>
            )}

            {isEditing && (
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-900/60 text-white rounded-xl flex flex-col items-center justify-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-semibold">Change</span>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Identity & Basic Info */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
              <span className="font-mono text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {profile.employeeId}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                {profile.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {profile.jobDetails?.designation || 'Software Engineer'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {profile.jobDetails?.department || 'Engineering'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {new Date(profile.jobDetails?.joiningDate || profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Contact Info
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profile.name || '',
                  phone: profile.phone || '',
                  address: profile.address || '',
                  profilePictureUrl: profile.profilePictureUrl || '',
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode Notice */}
      {isEditing && (
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Info className="w-3.5 h-3.5" />
            <span>Employee Self-Service Policy</span>
          </div>
          <p className="text-slate-600">
            You can update your display name, phone number, address, and profile photo. Job title, department, and salary structures require administrator authorization.
          </p>
        </div>
      )}

      {/* Profile Form / View Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Personal & Contact Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                Personal & Contact Details
              </h2>
              {isEditing && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                  Editable Fields
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                ) : (
                  <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    {profile.name}
                  </p>
                )}
              </div>

              {/* Work Email (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-medium">Work Email</label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <p className="font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Residential Address</label>
                {isEditing ? (
                  <textarea
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, State, ZIP"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                ) : (
                  <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    {profile.address || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Job & Organization Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-700" />
                Job & Employment Details
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> HR Managed
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium uppercase text-[10px]">Employee ID</label>
                  <p className="font-mono font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1">
                    {profile.employeeId}
                  </p>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium uppercase text-[10px]">System Role</label>
                  <p className="font-semibold text-slate-900 uppercase bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1">
                    {profile.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium uppercase text-[10px]">Designation</label>
                  <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1">
                    {profile.jobDetails?.designation || 'Software Engineer'}
                  </p>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium uppercase text-[10px]">Department</label>
                  <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1">
                    {profile.jobDetails?.department || 'Engineering'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium uppercase text-[10px]">Official Joining Date</label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(profile.jobDetails?.joiningDate || profile.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Employment Status:</span> Full-Time Regular • Standard 40 Hours/Week.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Salary Structure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-700" />
                Compensation & Salary Structure
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official payroll breakdown and monthly compensation calculation (Read-Only)
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              Active Pay Scale
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">Basic Salary</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">${basic.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">50% of CTC</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">House Rent Allowance</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">${hra.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tax-exempt allowance</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">Special Allowances</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">${allowances.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Discretionary perk</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-500 font-medium">Standard Deductions</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">-${deductions.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tax, PF, Insurance</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estimated Monthly Take-Home (Net Pay)</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">${netSalary.toLocaleString()} / mo</p>
            </div>
            <div className="text-xs text-slate-600 sm:text-right">
              <p>Gross Pay: <strong>${grossSalary.toLocaleString()}</strong> / month</p>
              <p className="text-[11px] text-slate-400">Total Annual CTC: ${(grossSalary * 12).toLocaleString()} / year</p>
            </div>
          </div>
        </div>

        {/* Card 4: Documents Vault */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                Employee Documents Vault
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official verified records and onboarding contracts
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {profile.documents?.length || 3} Files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profile.documents?.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{doc.type || 'PDF'}</p>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Simulated download for: ${doc.name}`);
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors shrink-0"
                  title="Download Document"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar when in Edit Mode */}
        {isEditing && (
          <div className="sticky bottom-6 p-4 rounded-xl bg-zinc-900 text-white shadow-modal border border-slate-800 flex items-center justify-between gap-4 z-20">
            <p className="text-xs text-slate-300">
              You have unsaved profile changes. Click save to persist to MongoDB.
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
                    <Save className="w-3.5 h-3.5" /> Save Changes
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

export default EmployeeProfilePage;
