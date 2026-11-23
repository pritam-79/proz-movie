import React from 'react';
import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import Logo from '@/components/brand/Logo';
import { Globe, Shield, Tv, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-proz-midnight border-t border-proz-border/40 pt-16 pb-12 overflow-hidden">
      
      {/* Ambient background light gradients */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-proz-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-proz-cyan/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-proz-border/40">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="main" size="lg" />
            <p className="text-sm font-semibold tracking-wider text-proz-cyan">
              {brandConfig.tagline}
            </p>
            <p className="text-xs text-proz-grey max-w-sm leading-relaxed">
              {brandConfig.description}
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs text-proz-grey">
                <Globe className="w-3.5 h-3.5 text-proz-cyan" />
                <span>Global Territory License</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs text-proz-grey">
                <Shield className="w-3.5 h-3.5 text-proz-purple" />
                <span>Authorized DRM</span>
              </div>
            </div>
          </div>

          {/* Entertainment Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-proz-white mb-4 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-proz-cyan" />
              Entertainment
            </h4>
            <ul className="space-y-2.5 text-xs text-proz-grey">
              {brandConfig.navigation.footerNav.categories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-proz-cyan transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Devices */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-proz-white mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-proz-purple" />
              Support & Plans
            </h4>
            <ul className="space-y-2.5 text-xs text-proz-grey">
              {brandConfig.navigation.footerNav.support.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-proz-cyan transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/subscription" className="text-proz-purple font-medium hover:underline">
                  Compare VIP Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal, DMCA & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-proz-white mb-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-proz-grey">
              {brandConfig.navigation.footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-proz-cyan transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-proz-grey">
          <p>{brandConfig.copyright}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for stream lovers worldwide
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Link href="/updates" className="text-emerald-400 font-semibold hover:underline">
                PROZ MOVIE v0.02
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
