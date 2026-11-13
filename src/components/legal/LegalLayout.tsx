import React from 'react';
import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="space-y-3 border-b border-proz-border/40 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-proz-grey hover:text-proz-cyan transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-proz-cyan" />
          <h1 className="text-2xl sm:text-4xl font-black text-proz-white tracking-tight">
            {title}
          </h1>
        </div>

        <p className="text-xs text-proz-grey">
          Official Legal Documentation • Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-proz-border/50 shadow-glass space-y-6 text-xs sm:text-sm text-proz-grey leading-relaxed">
        {children}
      </div>

      {/* Cross Links to Other Legal Pages */}
      <div className="p-6 rounded-2xl glass-card border border-proz-border/40 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-proz-white">Other Legal Documents:</span>
        <div className="flex flex-wrap gap-3 text-proz-cyan">
          <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/legal/terms" className="hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/legal/copyright" className="hover:underline">Copyright & DMCA</Link>
          <span>•</span>
          <Link href="/legal/removal-request" className="hover:underline">Removal Request</Link>
          <span>•</span>
          <Link href="/legal/refund" className="hover:underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/legal/age-policy" className="hover:underline">Age Policy</Link>
        </div>
      </div>

    </div>
  );
};

export default LegalLayout;
