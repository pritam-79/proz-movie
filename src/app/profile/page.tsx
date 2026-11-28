"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Crown, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Sparkles,
  ExternalLink,
  Camera,
  LogOut,
  Flame,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { brandConfig } from '@/config/brand.config';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4 pt-28">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400 max-w-sm">Please sign in to access your profile preferences and saved content.</p>
        <Link href="/auth/login" className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setSaveError('');
    updateProfile({ 
      name: name.trim(), 
      email: email.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-proz-midnight text-proz-white pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title Banner */}
        <div className="border-b border-proz-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-proz-white tracking-tight flex items-center gap-3">
              <User className="w-7 h-7 text-proz-cyan" />
              <span>User Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-proz-grey mt-1">
              Customize your profile name, contact info, and streaming preferences.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column Profile Card */}
          <div className="p-6 rounded-3xl cinema-card text-center space-y-4 h-fit">
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={avatarUrl || user.avatarUrl}
                alt={name || user.name}
                className="w-full h-full rounded-full object-cover ring-4 ring-proz-purple/50"
              />
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white keep-white ring-2 ring-proz-midnight">
                <Check className="w-3 h-3" />
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-proz-white">{name || user.name}</h3>
              <p className="text-xs text-proz-grey">{email || user.email}</p>
            </div>

            <div className="p-3 rounded-2xl bg-proz-elevated/60 border border-proz-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-proz-grey">Membership Tier</span>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-proz-cyan">
                <Crown className="w-4 h-4 fill-current" />
                <span>{user.subscription?.planId ? user.subscription.planId.replace('plan_', '').toUpperCase() + ' VIP' : 'FREE'}</span>
              </div>
              <p className="text-[11px] text-proz-cyan">{user.subscription?.videoQuality || '1080p FHD'}</p>
            </div>

            <div className="pt-2">
              <Link
                href="/subscription"
                className="block w-full py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-purple-glow transition text-center"
              >
                Manage Subscription
              </Link>
            </div>
          </div>

          {/* Right Columns: Edit Form & Settings */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Profile Edit Form */}
            <div className="p-6 rounded-3xl cinema-card space-y-5">
              <h3 className="text-base font-bold text-proz-white">Edit Profile Details</h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-proz-grey">Avatar Image URL (Optional)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                {saveError && (
                  <p className="text-xs text-red-400 font-semibold">{saveError}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-purple-glow transition"
                  >
                    Save Changes
                  </button>
                  {isSaved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Profile successfully saved!
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
                className="p-5 rounded-3xl cinema-card hover:border-proz-cyan/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-proz-cyan/15 border border-proz-cyan/30 text-proz-cyan group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-proz-white">Device Manager</h4>
                    <p className="text-xs text-proz-grey">Manage connected sessions</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-proz-grey group-hover:text-proz-cyan transition-colors" />
              </Link>

              {/* 18+ Adult Ecosystem Link */}
              <Link
                href="/restricted"
                className="p-5 rounded-3xl cinema-card hover:border-proz-purple/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border group-hover:scale-110 transition-transform ${
                    user.is18PlusVerified 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">18+ Adult Zone</h4>
                    <p className="text-xs text-slate-400">
                      {user.is18PlusVerified ? 'Verified & Active' : 'Age Gate Locked'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
