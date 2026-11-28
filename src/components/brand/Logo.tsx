import React from 'react';
import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';

interface LogoProps {
  variant?: 'main' | 'compact' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'main',
  className = '',
  size = 'md',
  withLink = true,
}) => {
  const iconBoxSize = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const isWhiteVariant = variant === 'white';

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {/* Inline Obsidian Ember Shield + Play Emblem */}
      <svg
        viewBox="0 0 80 80"
        className={`${iconBoxSize} shrink-0 drop-shadow-md`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="prozEmblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E54" />
            <stop offset="55%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="76" height="76" rx="18" fill="#111218" stroke="#2A2D3A" strokeWidth="2.5" />
        <rect x="5" y="5" width="70" height="70" rx="15" fill="none" stroke="url(#prozEmblemGrad)" strokeWidth="1.5" opacity="0.7" />
        <path
          d="M 24 18 L 48 18 C 60 18, 64 26, 64 36 C 64 46, 58 52, 48 52 L 34 52 L 34 62 L 24 62 Z"
          fill="url(#prozEmblemGrad)"
        />
        <path d="M 36 28 L 36 44 L 50 36 Z" fill="#07070A" />
        <path d="M 38.5 31 L 38.5 41 L 47 36 Z" fill="#F59E0B" />
      </svg>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5 tracking-tight font-black">
            <span className={`${titleSize} ${isWhiteVariant ? 'text-white keep-white' : 'text-proz-white'}`}>
              PROZ
            </span>
            {variant !== 'compact' && (
              <span className="hidden xl:inline text-[11px] font-extrabold tracking-widest bg-gradient-to-r from-proz-purple to-proz-cyan bg-clip-text text-transparent">
                ENTERTAINMENT
              </span>
            )}
          </div>
          {variant === 'main' && (
            <span className="text-[8px] font-bold tracking-[0.2em] text-proz-grey uppercase mt-0.5 hidden sm:block">
              {brandConfig.version}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        href="/"
        aria-label={`${brandConfig.name} Home`}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-proz-cyan/50 rounded-lg shrink-0"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
