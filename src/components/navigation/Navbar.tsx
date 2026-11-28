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
  Settings,
  History,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Activity,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { brandConfig } from '@/config/brand.config';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import SearchModal from '@/components/search/SearchModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, watchlist, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 flex items-center transition-all duration-300 ${
          isScrolled
            ? 'cinema-nav shadow-2xl'
            : 'bg-proz-midnight/85 backdrop-blur-xl border-b border-proz-border/35'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-3 lg:gap-5 min-w-0">
            <Logo variant="main" size="sm" />

            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {brandConfig.navigation.mainNav.slice(0, 8).map((item) => {
                const isActive = pathname === item.href;
                const isRestricted = item.href === '/restricted';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 flex items-center gap-1 ${
                      isActive
                        ? 'text-white keep-white bg-gradient-to-r from-proz-purple to-orange-600 shadow-purple-glow'
                        : isRestricted
                        ? 'text-proz-purple hover:bg-proz-purple/10'
                        : 'text-proz-grey hover:text-proz-white hover:bg-proz-elevated/70'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          isActive
                            ? 'bg-black/25 text-white keep-white'
                            : isRestricted
                            ? 'bg-proz-purple/15 text-proz-purple border border-proz-purple/30'
                            : 'bg-proz-cyan/15 text-proz-cyan border border-proz-cyan/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-input text-xs text-proz-grey hover:text-proz-white whitespace-nowrap shrink-0 transition-all"
              aria-label="Search entertainment"
            >
              <Search className="w-3.5 h-3.5 text-proz-purple shrink-0" />
              <span className="hidden xl:inline">Search movies, series...</span>
              <span className="hidden sm:inline xl:hidden">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-proz-midnight/80 rounded border border-proz-border/60 text-proz-grey">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle (Dark <-> Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass-button-secondary shrink-0"
              aria-label="Toggle dark/light theme"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-proz-cyan" />
              ) : (
                <Moon className="w-4 h-4 text-proz-purple" />
              )}
            </button>

            {/* Settings & Auto-Diagnostics */}
            <Link
              href="/settings"
              className="hidden sm:flex p-2 rounded-full glass-button-secondary relative shrink-0"
              aria-label="Settings & Diagnostics"
              title="Settings & System Diagnostics"
            >
              <Settings className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-proz-midnight" />
            </Link>

            {/* Watchlist Quick Button */}
            <Link
              href="/watchlist"
              className="relative p-2 rounded-full glass-button-secondary shrink-0"
              aria-label="My Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-proz-purple text-white keep-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-purple-glow">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:pl-1.5 sm:pr-2.5 rounded-full glass-card hover:border-proz-purple/50 transition-all focus:outline-none shrink-0"
                  aria-label="User profile menu"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-proz-purple/70 shrink-0"
                  />
                  <span className="hidden xl:inline text-xs font-semibold text-proz-white max-w-[90px] truncate">
                    {user.name}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-proz-purple/20 text-proz-purple uppercase whitespace-nowrap">
                    {user.subscription?.planId ? user.subscription.planId.replace('plan_', '') : 'FREE'}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl glass-card shadow-glass-lg p-2 z-50 text-sm"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-proz-border/40">
                      <p className="font-bold text-proz-white truncate">{user.name}</p>
                      <p className="text-xs text-proz-grey truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-proz-cyan">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="capitalize">{user.subscription?.videoQuality || '720p HD'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white hover:bg-proz-elevated/80 hover:text-proz-purple transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Account Overview</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white hover:bg-proz-elevated/80 hover:text-proz-purple transition-colors"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Settings &amp; Diagnostics</span>
                      </Link>

                      <Link
                        href="/watchlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white hover:bg-proz-elevated/80 hover:text-proz-purple transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>My Watchlist ({watchlist.length})</span>
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-proz-white hover:bg-proz-elevated/80 hover:text-proz-purple transition-colors"
                      >
                        <History className="w-4 h-4" />
                        <span>Continue Watching</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          window.dispatchEvent(new CustomEvent('proz:check-update'));
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-proz-white hover:bg-proz-elevated/80 hover:text-proz-cyan transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-proz-cyan" />
                          <span>Check for Updates</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-proz-purple/20 text-proz-purple border border-proz-purple/30">
                          {brandConfig.version}
                        </span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-proz-border/40">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
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
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-proz-white hover:text-proz-purple transition-colors"
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-button-secondary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 max-h-[80vh] overflow-y-auto bg-proz-midnight/98 backdrop-blur-2xl border-b border-proz-border/50 px-4 pt-3 pb-6 space-y-1.5 shadow-2xl">
            {brandConfig.navigation.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-proz-purple to-orange-600 text-white keep-white'
                    : 'text-proz-grey hover:text-proz-white hover:bg-proz-elevated/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-proz-purple/20 text-proz-purple">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            <div className="pt-3 border-t border-proz-border/40 grid grid-cols-2 gap-2">
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 rounded-xl text-xs font-semibold glass-button-secondary flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diagnostics</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 rounded-xl text-xs font-semibold glass-button-secondary"
              >
                Account
              </Link>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('proz:check-update'));
                }}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold glass-button-primary flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Check Updates ({brandConfig.version})</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
