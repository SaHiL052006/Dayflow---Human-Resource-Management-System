import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Stylish Typographic Wordmark Logo for Dayflow HRMS
 * "Dayflow" itself acts as the distinctive symbol and brand mark
 * with modern geometric letterforms, dual-weight styling, and subtle accent.
 */
export const Logo = ({
  size = 'md',
  variant = 'dark', // 'dark' | 'light'
  showBadge = true,
  subtitle = null,
  linkTo = null,
  className = '',
}) => {
  const sizeMap = {
    xs: { text: 'text-sm', dot: 'w-1 h-1', badge: 'text-[8px] px-1 py-0.2', sub: 'text-[9px]' },
    sm: { text: 'text-base', dot: 'w-1 h-1', badge: 'text-[9px] px-1.5 py-0.2', sub: 'text-[10px]' },
    md: { text: 'text-lg', dot: 'w-1.5 h-1.5', badge: 'text-[10px] px-1.5 py-0.5', sub: 'text-[11px]' },
    lg: { text: 'text-2xl', dot: 'w-2 h-2', badge: 'text-xs px-2 py-0.5', sub: 'text-xs' },
    xl: { text: 'text-3xl', dot: 'w-2.5 h-2.5', badge: 'text-xs px-2 py-0.5', sub: 'text-xs' },
    hero: { text: 'text-4xl sm:text-5xl', dot: 'w-3 h-3', badge: 'text-xs px-2.5 py-0.5', sub: 'text-sm' },
  };

  const { text, dot, badge, sub } = sizeMap[size] || sizeMap.md;
  const isLight = variant === 'light';

  const content = (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* Stylish Typographic Wordmark Symbol */}
      <div className="flex items-center tracking-tight">
        <span
          className={`${text} font-black transition-colors ${
            isLight ? 'text-white' : 'text-slate-900'
          }`}
        >
          Day
        </span>
        <span
          className={`${text} font-light italic transition-colors ${
            isLight ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          flow
        </span>
        <span
          className={`${dot} rounded-full ml-0.5 bg-emerald-500 inline-block align-middle transition-transform group-hover:scale-125`}
        />
      </div>

      {/* HRMS Badge */}
      {showBadge && (
        <span
          className={`${badge} font-mono font-medium uppercase tracking-wider rounded border ${
            isLight
              ? 'bg-white/10 text-slate-300 border-white/15'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          HRMS
        </span>
      )}

      {subtitle && (
        <span className={`${sub} block mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          {subtitle}
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
