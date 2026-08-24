import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react';
import { fetchHealthStatus } from '../services/healthService';

export const DashboardPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const response = await fetchHealthStatus();
      setHealthData(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setHealthError(err.message || 'Failed to reach backend server');
      setHealthData(null);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const stats = [
    { title: 'Total Employees', value: '128', change: '+4 this month', icon: Users, color: 'brand' },
    { title: 'Present Today', value: '116', change: '90.6% attendance', icon: UserCheck, color: 'emerald' },
    { title: 'Pending Leaves', value: '8', change: 'Requires approval', icon: Clock, color: 'amber' },
    { title: 'Upcoming Holidays', value: '2', change: 'Next: Labor Day', icon: CalendarCheck, color: 'violet' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-6 sm:p-8 rounded-2xl text-white shadow-xl shadow-brand-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold mb-3 backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5" />
            Stage 1: Monorepo & Foundational Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Dayflow HRMS
          </h1>
          <p className="text-brand-200 text-sm mt-1 max-w-xl">
            Modern Human Resource Management System powered by MongoDB, Express, React, and Node.js.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-brand-900 hover:bg-brand-50 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
            {healthLoading ? 'Testing API...' : 'Ping Backend'}
          </button>
        </div>
      </div>

      {/* Live Backend Health Monitor Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Live Backend Health Check
                <span className="text-xs font-mono font-normal text-slate-400">GET /api/health</span>
              </h2>
              <p className="text-xs text-slate-500">
                Live connectivity verification between React client and Express API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {healthLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                Connecting...
              </span>
            ) : healthData ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Backend Operational (200 OK)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Backend Unreachable
              </span>
            )}
            {lastChecked && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Checked at {lastChecked}
              </span>
            )}
          </div>
        </div>

        {/* Health details */}
        {healthData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Server className="w-4 h-4 text-brand-600 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Service</p>
                <p className="text-xs font-semibold text-slate-800">{healthData.service}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Status: {healthData.status}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Database className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Database</p>
                <p className="text-xs font-semibold text-slate-800">
                  {healthData.database.status === 'connected' ? 'MongoDB Connected' : `MongoDB (${healthData.database.status})`}
                </p>
                <p className="text-[11px] text-slate-500 truncate">DB: {healthData.database.name}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Server Uptime</p>
                <p className="text-xs font-semibold text-slate-800">{healthData.uptimeSeconds} seconds</p>
                <p className="text-[11px] text-slate-500">Env: {healthData.environment}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-violet-600 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Memory (Heap)</p>
                <p className="text-xs font-semibold text-slate-800">{healthData.memory.heapUsedMB} MB</p>
                <p className="text-[11px] text-slate-500">RSS: {healthData.memory.rssMB} MB</p>
              </div>
            </div>
          </div>
        ) : healthError ? (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-center justify-between">
            <div>
              <p className="font-semibold">Unable to connect to Express backend at http://localhost:5000/api</p>
              <p className="text-rose-600 mt-0.5">{healthError}. Ensure the server is running (`cd server && npm run dev`).</p>
            </div>
            <button
              onClick={checkHealth}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-medium text-xs hover:bg-rose-700 shrink-0"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{item.title}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-brand-600 flex items-center justify-center border border-slate-100">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  {item.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack & Modules Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monorepo Architecture Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">Dayflow HRMS MERN Stack Architecture</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
              Full Stack Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
              <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm">
                <Server className="w-4 h-4" />
                Backend (`server/`)
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Express.js on Node.js runtime</li>
                <li>MongoDB with Mongoose ODM</li>
                <li>Controllers, Models, Routes & Middleware</li>
                <li>CORS, Morgan logger, Global error handler</li>
                <li>Health check endpoint at <code className="bg-slate-200 px-1 py-0.5 rounded">/api/health</code></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                <Activity className="w-4 h-4" />
                Frontend (`client/`)
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>React 18 powered by Vite</li>
                <li>Tailwind CSS customized enterprise theme</li>
                <li>React Router DOM with routes scaffolding</li>
                <li>Axios HTTP client with request/response interceptors</li>
                <li>Context & custom hooks architecture (`AuthContext`)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300">Next Stage 2</h4>
              <p className="text-sm font-semibold mt-0.5">Authentication & Role-Based Access Control</p>
              <p className="text-xs text-slate-400">JWT auth, bcrypt password hashing, and user models</p>
            </div>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-all shrink-0"
            >
              Test Login Page <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100">
            Quick Navigation
          </h3>

          <div className="space-y-2.5">
            <a
              href="/dashboard"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Dashboard</p>
                  <p className="text-[11px] text-slate-400">System overview & status</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </a>

            <a
              href="/login"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Login Portal</p>
                  <p className="text-[11px] text-slate-400">Employee & Admin login</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </a>

            <a
              href="/signup"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Signup Portal</p>
                  <p className="text-[11px] text-slate-400">Register new organization</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
