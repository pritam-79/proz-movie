"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Crown, 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  Trash2, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { brandConfig } from '@/config/brand.config';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [email, setEmail] = useState(user?.email || 'alex.proz@example.com');
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-proz-white">Sign In Required</h2>
        <p className="text-xs text-proz-grey">Please sign in to manage your account and subscription preferences.</p>
        <Link href="/auth/login" className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-proz-border/40 pb-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-proz-white tracking-tight flex items-center gap-3">
          <User className="w-7 h-7 text-proz-cyan" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-proz-grey mt-1">
          Manage your personal profile, subscription tier, and connected devices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column Profile Card */}
        <div className="p-6 rounded-3xl glass-card border border-proz-border/50 text-center space-y-4 h-fit">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover ring-4 ring-proz-purple/60"
            />
            <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white ring-2 ring-proz-midnight">
              <Check className="w-3 h-3" />
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-proz-white">{user.name}</h3>
            <p className="text-xs text-proz-grey">{user.email}</p>
          </div>

          <div className="p-3 rounded-2xl bg-proz-navy/70 border border-proz-border/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-proz-grey">Active Tier</span>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
              <Crown className="w-4 h-4 fill-amber-400" />
              <span>{user.subscription.planId.replace('plan_', '').toUpperCase()} VIP</span>
            </div>
            <p className="text-[11px] text-proz-cyan">{user.subscription.videoQuality}</p>
          </div>

          <div className="pt-2">
            <Link
              href="/subscription"
              className="block w-full py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-cyan-glow"
            >
              Change Subscription Plan
            </Link>
          </div>
        </div>

        {/* Right Columns: Edit Form & Security */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Edit Form */}
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-5">
            <h3 className="text-base font-bold text-proz-white">Personal Information</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-grey">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-grey">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full glass-button-primary text-xs font-bold"
                >
                  Save Profile Changes
                </button>
                {isSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Changes Saved
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Quick Links: Devices & 18+ Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Devices Link */}
            <Link
              href="/account/devices"
              className="p-5 rounded-3xl glass-card border border-proz-border/50 hover:border-proz-cyan/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-proz-navy/70 border border-proz-border/40 text-proz-cyan group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-proz-white">Device Manager</h4>
                  <p className="text-xs text-proz-grey">3 Active Devices</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-proz-grey group-hover:text-proz-cyan transition-colors" />
            </Link>

            {/* 18+ Verification Status */}
            <Link
              href="/restricted"
              className="p-5 rounded-3xl glass-card border border-proz-border/50 hover:border-proz-cyan/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border text-proz-purple group-hover:scale-110 transition-transform ${
                  user.is18PlusVerified 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-proz-navy/70 border-proz-border/40'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-proz-white">Age Verification</h4>
                  <p className={`text-xs ${user.is18PlusVerified ? 'text-emerald-400 font-medium' : 'text-proz-grey'}`}>
                    {user.is18PlusVerified ? '18+ Verified' : 'Unverified (Restricted)'}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-proz-grey group-hover:text-proz-cyan transition-colors" />
            </Link>

          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 rounded-3xl glass-card border border-rose-500/30 space-y-3">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Danger Zone</span>
            </h4>
            <p className="text-xs text-proz-grey leading-relaxed">
              Permanently delete your PROZ MOVIE account, viewing history, and active subscriptions. This action cannot be reversed.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold"
            >
              Request Account Deletion
            </button>
          </div>

        </div>

      </div>

      {/* Delete Modal Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-proz-midnight/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border border-rose-500/50 shadow-glass-lg space-y-4">
            <h3 className="text-lg font-bold text-proz-white">Confirm Account Deletion</h3>
            <p className="text-xs text-proz-grey leading-relaxed">
              Are you sure you want to delete your PROZ MOVIE profile? All saved items, continuous playback marks, and active subscriptions will be erased.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl glass-button-secondary text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDeleteModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
