import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('dayflow_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('dayflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync / Verify profile on initial app load if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('dayflow_token');
      if (storedToken) {
        try {
          const response = await getCurrentUser();
          if (response?.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('dayflow_user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.warn('[Auth] Stored session invalid or expired. Logging out.');
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('dayflow_token', authToken);
    localStorage.setItem('dayflow_user', JSON.stringify(userData));
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
    }
  }, []);

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('dayflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
