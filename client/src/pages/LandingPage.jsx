import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import Dayflow3DScene from '../components/Dayflow3DScene';

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-between overflow-hidden selection:bg-slate-900 selection:text-white">
      {/* 1. Ambient Background 3D Scene - Fully visible and interactive backdrop */}
      <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
        <Dayflow3DScene />
      </div>

      {/* 2. Top Header Navigation */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size="md" variant="dark" linkTo="/" />

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-200/50 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* 3. Centered Floating Transparent Hero Section (No solid card box blocking 3D view) */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 sm:py-20 text-center my-auto">
        <div className="space-y-6">
          {/* System Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 backdrop-blur-xs border border-slate-300/80 text-[11px] font-semibold text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Human Resource Operating System</span>
          </div>

          {/* Core Tagline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Every workday, <br />
            <span className="text-slate-500 font-light italic">perfectly aligned.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            A minimal, focused workspace for workforce attendance, synchronized leave management, automated payroll calculations, and role-governed intelligence.
          </p>

          {/* Two Clean CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-7 py-3 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3 rounded-lg text-xs font-semibold bg-white/80 hover:bg-white text-slate-900 border border-slate-300 backdrop-blur-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Minimal Feature Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Shift Punching
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Leave Sync
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Payroll Engine
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Role-Based Access
            </span>
          </div>
        </div>
      </main>

      {/* 4. Minimal Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-200/60">
        <p>© 2026 Dayflow HRMS. Minimal Workspace.</p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-slate-700 transition-colors">
            Portal Log In
          </Link>
          <Link to="/signup" className="hover:text-slate-700 transition-colors">
            Create Account
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
