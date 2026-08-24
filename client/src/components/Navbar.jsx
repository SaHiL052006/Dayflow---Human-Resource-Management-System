import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  Menu,
  Shield,
  LogOut,
  CheckCheck,
  CreditCard,
  FileSpreadsheet,
  Clock,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService';
import Logo from './Logo';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getMyNotifications();
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Handled
      }
    }
    if (notif.link) {
      setShowNotifications(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Handled
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'payroll':
        return <CreditCard className="w-3.5 h-3.5 text-slate-700" />;
      case 'leave':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />;
      case 'attendance':
        return <Clock className="w-3.5 h-3.5 text-slate-700" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Left Section: Toggle Menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center">
          <Logo size="xs" showBadge={false} variant="dark" linkTo="/" />
        </div>

        <div className="relative hidden sm:block w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Right Section: Role, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Minimal Role Badge */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {isAdmin ? (
              <Shield className="w-3 h-3 text-slate-700" />
            ) : (
              <User className="w-3 h-3 text-slate-700" />
            )}
            <span className="capitalize">{user?.role}</span>
          </div>
        )}

        {/* Minimal Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="min-w-3.5 h-3.5 px-1 bg-zinc-900 text-white font-bold text-[9px] rounded-full absolute top-1 right-1 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-slate-200 py-1 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 text-xs ${
                        !notif.isRead ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-100 text-slate-700 shrink-0">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-slate-900 text-[11px] truncate">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile & Sign Out */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to="/employee/profile"
              className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline font-medium truncate max-w-[120px]">
                {user?.name || user?.email}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
