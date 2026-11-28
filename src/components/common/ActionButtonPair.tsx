'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid, RefreshCw } from 'lucide-react';

interface ActionButtonPairProps {
  onMoreClick?: () => void;
  onChangeClick?: () => void;
  moreHref?: string;
  className?: string;
}

export const ActionButtonPair: React.FC<ActionButtonPairProps> = ({
  onMoreClick,
  onChangeClick,
  moreHref = '/explore',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 py-6 px-4 ${className}`}>
      {/* Button 1: [More Wonderful] */}
      {moreHref ? (
        <Link
          href={moreHref}
          className="flex-1 max-w-[220px] flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl cinema-card hover:border-proz-purple/60 active:scale-98 text-proz-white font-semibold text-xs sm:text-sm transition-all duration-200 group"
        >
          <LayoutGrid className="w-4 h-4 text-proz-purple group-hover:scale-110 transition-transform" />
          <span>More Wonderful</span>
        </Link>
      ) : (
        <button
          onClick={onMoreClick}
          className="flex-1 max-w-[220px] flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl cinema-card hover:border-proz-purple/60 active:scale-98 text-proz-white font-semibold text-xs sm:text-sm transition-all duration-200 group"
        >
          <LayoutGrid className="w-4 h-4 text-proz-purple group-hover:scale-110 transition-transform" />
          <span>More Wonderful</span>
        </button>
      )}

      {/* Button 2: [Change] (Refresh recommendations) */}
      <button
        onClick={onChangeClick}
        className="flex-1 max-w-[220px] flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl cinema-card hover:border-proz-cyan/60 active:scale-98 text-proz-white font-semibold text-xs sm:text-sm transition-all duration-200 group"
      >
        <RefreshCw className="w-4 h-4 text-proz-cyan group-hover:rotate-180 transition-transform duration-500" />
        <span>Change</span>
      </button>
    </div>
  );
};

export default ActionButtonPair;
