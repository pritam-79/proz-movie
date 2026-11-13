"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  KeyRound, 
  Calendar, 
  AlertTriangle,
  Play,
  Film
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CONTENT } from '@/lib/data/mockContent';
import ContentCard from '@/components/content/ContentCard';

export default function RestrictedZonePage() {
  const { user, verify18Plus, verifyParentalPin } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const restrictedItems = MOCK_CONTENT.filter(c => c.isRestricted18Plus);

  const handleVerifyAge = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = verify18Plus(birthDate);
    if (!success) {
      setErrorMsg('Access denied. You must be at least 18 years of age to access this restricted zone.');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyParentalPin(pin)) {
      setPinUnlocked(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid parental control PIN. Please enter the correct 4-digit code (Default: 1234).');
    }
  };

  const isAccessGranted = user?.is18PlusVerified && pinUnlocked;

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
              This catalogue contains legally licensed mature entertainment rated 18+ (TV-MA). Access is strictly restricted to verified adults only.
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
              Federal compliance requires mandatory age confirmation and parental PIN validation before entry.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Age Verification */}
          {!user?.is18PlusVerified ? (
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
                className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Verify 18+ Age
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
                    placeholder="••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-center tracking-widest text-lg font-mono text-proz-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Unlock Restricted Zone
              </button>
            </form>
          )}

          <div className="pt-2 text-[11px] text-proz-grey/80">
            By proceeding, you affirm that you are at least 18 years old and legally permitted to view adult-rated entertainment in your jurisdiction.
          </div>

        </div>
      ) : (
        /* Unlocked Catalogue */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-proz-border/40 pb-3">
            <h3 className="text-sm font-bold text-proz-white uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400" />
              <span>Restricted 18+ Vault ({restrictedItems.length} Titles)</span>
            </h3>

            <button
              onClick={() => {
                setPinUnlocked(false);
              }}
              className="px-3 py-1 rounded-lg glass-button-secondary text-xs text-rose-400"
            >
              Lock Zone
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {restrictedItems.map((item) => (
              <ContentCard key={item.id} item={item} aspectRatio="poster" />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
