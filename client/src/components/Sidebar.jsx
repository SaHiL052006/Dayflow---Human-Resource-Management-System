import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  FileSpreadsheet,
  CreditCard,
  BarChart3,
  Settings,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'Workforce Directory', path: '/admin/dashboard', icon: Users },
    { name: 'Workforce Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: FileSpreadsheet },
    { name: 'Payroll Engine', path: '/admin/payroll', icon: CreditCard },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'System Settings', path: '/settings', icon: Settings, badge: 'Config' },
  ];

  const employeeNavItems = [
    { name: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck2 },
    { name: 'My Leaves', path: '/employee/leave', icon: FileSpreadsheet },
    { name: 'My Salary Slips', path: '/employee/payroll', icon: CreditCard },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - Sleek Dark Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#111827] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <Logo size="sm" variant="light" linkTo="/" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Management Portal' : 'Self-Service Portal'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path + item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-2xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                isAdmin ? 'bg-zinc-100 text-zinc-900' : 'bg-slate-700 text-white'
              }`}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Workspace'}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {user?.employeeId || user?.role || 'Guest'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
