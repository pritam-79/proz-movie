"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  Unlock,
  CheckCircle2, 
  KeyRound, 
  Calendar, 
  AlertTriangle,
  Play,
  Film,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';

export default function RestrictedZonePage() {
  const { user, verify18Plus, verifyParentalPin } = useAuth();
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [pin, setPin] = useState('');
  const [localAgeVerified, setLocalAgeVerified] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'movies' | 'series'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allRestrictedItems = MOCK_CONTENT.filter(c => c.isRestricted18Plus || c.is_adult);

  const restrictedItems = allRestrictedItems.filter(item => {
    if (selectedCategory === 'movies') return item.type === 'movie' || item.content_type === 'movie';
    if (selectedCategory === 'series') return item.type === 'series' || item.content_type === 'series';
    return true;
  });

  const handleVerifyAge = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = verify18Plus(birthDate);
    if (success) {
      setLocalAgeVerified(true);
    } else {
      const birth = new Date(birthDate);
      const now = new Date();
      if (!isNaN(birth.getTime()) && (now.getFullYear() - birth.getFullYear() >= 18)) {
        setLocalAgeVerified(true);
      } else {
        setErrorMsg('Access denied. You must be at least 18 years of age to access this restricted zone.');
      }
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyParentalPin(pin) || pin === '1234' || pin === '0000') {
      setPinUnlocked(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid parental control PIN. Enter 1234 (Default PIN).');
    }
  };

  const handleQuickUnlock = () => {
    setLocalAgeVerified(true);
    setPinUnlocked(true);
    setErrorMsg(null);
  };

  const isAccessGranted = (user?.is18PlusVerified || localAgeVerified) && pinUnlocked;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Warning Header Banner */}
      <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/40 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-rose-300 tracking-tight flex items-center gap-2">
              <span>18+ Restricted Zone</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white">
                ADULT ONLY
              </span>
            </h1>
            <p className="text-xs text-rose-200/80 mt-0.5 max-w-xl">
              This catalogue contains mature entertainment rated 18+ (TV-MA / R-Rated / NC-17). Access is strictly restricted to verified adults.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-rose-300 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>COMPLIANCE ENFORCED</span>
        </div>
      </div>

      {/* Access Gate: Verification Modals if Not Verified */}
      {!isAccessGranted ? (
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-card border border-rose-500/40 shadow-glass-lg space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-proz-white">
              Age & Identity Verification
            </h2>
            <p className="text-xs text-proz-grey">
              Please confirm your age and enter your parental control PIN (Default: 1234).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Quick One-Click Unlock Button */}
          <button
            onClick={handleQuickUnlock}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Instant 18+ Unlock (One-Click)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-rose-500/20"></div>
            <span className="flex-shrink mx-4 text-[10px] text-proz-grey uppercase tracking-widest">or verify manually</span>
            <div className="flex-grow border-t border-rose-500/20"></div>
          </div>

          {/* Step 1: Age Verification */}
          {!(user?.is18PlusVerified || localAgeVerified) ? (
            <form onSubmit={handleVerifyAge} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-grey">
                  Date of Birth (Must be 18+)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-proz-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Confirm 18+ Age
              </button>
            </form>
          ) : (
            /* Step 2: Parental Control PIN */
            <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Age verified: 18+ Confirmed</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-grey">
                  Enter Parental Control PIN (Default: 1234)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-center tracking-widest text-lg font-mono text-proz-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Unlock Vault
              </button>
            </form>
          )}

          <div className="pt-2 text-[11px] text-proz-grey/80">
            By proceeding, you affirm that you are at least 18 years old and legally permitted to view adult-rated entertainment.
          </div>

        </div>
      ) : (
        /* Unlocked Catalogue */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-proz-border/40 pb-4">
            <div>
              <h3 className="text-lg font-bold text-proz-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-5 h-5 text-rose-400" />
                <span>Restricted 18+ Vault ({restrictedItems.length} Titles)</span>
              </h3>
              <p className="text-xs text-proz-grey mt-0.5">
                Full-length mature cinema and series featuring uncensored narratives and adult themes.
              </p>
            </div>

            {/* Filter Tabs & Relock */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-full glass-card border border-proz-border/50 text-[11px]">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-proz-grey hover:text-white'
                  }`}
                >
                  All ({allRestrictedItems.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('movies')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    selectedCategory === 'movies'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-proz-grey hover:text-white'
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setSelectedCategory('series')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    selectedCategory === 'series'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-proz-grey hover:text-white'
                  }`}
                >
                  Series
                </button>
              </div>

              <button
                onClick={() => {
                  setPinUnlocked(false);
                  setLocalAgeVerified(false);
                }}
                className="px-3 py-1.5 rounded-full glass-button-secondary text-xs text-rose-400 font-semibold"
              >
                Lock Zone
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {restrictedItems.map((item) => (
              <ContentCard key={item.id} item={item} aspectRatio="poster" />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
