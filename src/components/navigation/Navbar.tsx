"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bookmark, 
  User, 
  Menu, 
  X, 
  Crown, 
  ShieldCheck, 
  Settings, 
  History, 
  LogOut, 
  Film,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { brandConfig } from '@/config/brand.config';
import { useAuth } from '@/context/AuthContext';
import SearchModal from '@/components/search/SearchModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, watchlist, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-proz-midnight/80 backdrop-blur-xl border-b border-proz-border/40 shadow-glass py-3' 
            : 'bg-gradient-to-b from-proz-midnight/90 via-proz-midnight/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Logo variant="main" size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {brandConfig.navigation.mainNav.map((item) => {
                const isActive = pathname === item.href;
                const isRestricted = item.href === '/restricted';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-proz-white bg-proz-navy/70 border border-proz-cyan/30 shadow-cyan-glow'
                        : isRestricted
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/20'
                        : 'text-proz-grey hover:text-proz-white hover:bg-proz-navy/40'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isRestricted 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-proz-purple/20 text-proz-purple border border-proz-purple/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-input text-xs text-proz-grey hover:text-proz-white transition-all hover:border-proz-cyan/40"
              aria-label="Search entertainment"
            >
              <Search className="w-3.5 h-3.5 text-proz-cyan" />
              <span className="hidden sm:inline">Search movies, series...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-proz-midnight/70 rounded border border-proz-border/50 text-proz-grey">
                ⌘K
              </kbd>
            </button>

            {/* Watchlist Quick Button */}
            <Link
              href="/watchlist"
              className="relative p-2 rounded-full glass-button-secondary hover:text-proz-cyan transition-colors"
              aria-label="My Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-proz-purple text-proz-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-purple-glow">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* User Account or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full glass-card border border-proz-border/50 hover:border-proz-cyan/40 transition-all focus:outline-none"
                  aria-label="User profile menu"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-proz-purple/60"
                  />
                  <span className="hidden lg:inline text-xs font-medium text-proz-white max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-proz-purple/30 text-proz-cyan uppercase">
                    {user.subscription.planId.replace('plan_', '')}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border border-proz-border/60 shadow-glass-lg p-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-proz-border/40">
                      <p className="font-semibold text-proz-white truncate">{user.name}</p>
                      <p className="text-xs text-proz-grey truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-proz-cyan">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="capitalize">{user.subscription.videoQuality}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white/90 hover:bg-proz-navy/70 hover:text-proz-cyan transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Account Overview</span>
                      </Link>

                      <Link
                        href="/watchlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white/90 hover:bg-proz-navy/70 hover:text-proz-cyan transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>My Watchlist ({watchlist.length})</span>
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white/90 hover:bg-proz-navy/70 hover:text-proz-cyan transition-colors"
                      >
                        <History className="w-4 h-4" />
                        <span>Continue Watching</span>
                      </Link>

                      <Link
                        href="/subscription"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white/90 hover:bg-proz-navy/70 hover:text-proz-cyan transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-proz-purple" />
                        <span>Subscription Plans</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-300 hover:bg-amber-950/30 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-proz-border/40">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-proz-white hover:text-proz-cyan transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold glass-button-primary"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass-button-secondary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-card border-b border-proz-border/60 px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-200">
            {brandConfig.navigation.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-proz-purple/20 text-proz-cyan border border-proz-cyan/30'
                    : 'text-proz-grey hover:text-proz-white hover:bg-proz-navy/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-proz-purple/30 text-proz-purple">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            <div className="pt-3 border-t border-proz-border/40 grid grid-cols-2 gap-2">
              <Link
                href="/subscription"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 rounded-xl text-xs font-semibold glass-button-secondary"
              >
                Plans & Pricing
              </Link>
              {user?.role === 'admin' ? (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                >
                  Admin Portal
                </Link>
              ) : (
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-semibold glass-button-secondary"
                >
                  Account
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
