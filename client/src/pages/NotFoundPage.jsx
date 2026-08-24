import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Logo from '../components/Logo';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-4">
      <div className="mb-6">
        <Logo size="md" />
      </div>
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl mx-auto flex items-center justify-center mb-3">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">404</h1>
        <p className="text-sm font-semibold text-slate-800 mt-1">Page Not Found</p>
        <p className="text-xs text-slate-500 mt-1.5">
          The requested page could not be located.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
