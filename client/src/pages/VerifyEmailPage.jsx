import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  RefreshCw,
  ArrowRight,
  MailCheck,
} from 'lucide-react';
import { verifyEmail as apiVerifyEmail } from '../services/authService';
import Logo from '../components/Logo';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing email verification token.');
        return;
      }

      try {
        const response = await apiVerifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        setUserInfo(response.data);
      } catch (err) {
        setStatus('error');
        setMessage(
          err.message || 'Invalid or expired verification link. Please request a new one.'
        );
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo size="lg" />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200/90 py-8 px-6 shadow-xs rounded-xl sm:px-10 text-center">
          {status === 'loading' && (
            <div className="space-y-3 py-4">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-700 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900">Verifying Email Address</h3>
              <p className="text-xs text-slate-500">
                Please wait while we validate your verification token...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Email Verified</h3>
                <p className="text-xs text-slate-600 mt-1">{message}</p>
                {userInfo && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    {userInfo.email} ({userInfo.employeeId})
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  state={{ message: 'Email verified successfully! You may now sign in.' }}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs"
                >
                  Proceed to Login
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Verification Failed</h3>
                <p className="text-xs text-rose-600 mt-1">{message}</p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
