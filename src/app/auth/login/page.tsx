"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Smartphone, Chrome, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, supabaseConfigured } = useAuth();

  const [authTab, setAuthTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('alex.proz@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'user' | 'admin'>('admin');

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      await login(email, role, password);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setNotice(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.ok) setError(res.message || 'Google Sign-In unavailable.');
      else if (res.message) setNotice(res.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(phone);
      if (res.ok) {
        setOtpSent(true);
        setNotice(res.message || 'OTP sent.');
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await verifyPhoneOtp(phone, otpCode);
      if (res.ok) router.push('/');
      else setError(res.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-proz-midnight text-proz-white">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl cinema-card border border-proz-border/70 shadow-glass-lg space-y-5">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="main" size="md" />
          </div>
          <h1 className="text-2xl font-black text-proz-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-proz-grey">
            Sign in with Email, Google, or Phone OTP to sync your watchlist and history.
          </p>
        </div>

        {/* Auth Method Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-proz-elevated border border-proz-border">
          <button
            type="button"
            onClick={() => {
              setAuthTab('email');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              authTab === 'email' ? 'glass-button-primary' : 'text-proz-grey hover:text-proz-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('phone');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              authTab === 'phone' ? 'glass-button-primary' : 'text-proz-grey hover:text-proz-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}
        {notice && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs text-center">
            {notice}
          </div>
        )}

        {authTab === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-grey">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-proz-grey">Password</label>
                <Link href="/auth/forgot-password" className="text-[11px] text-proz-cyan hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>
            </div>

            {!supabaseConfigured && (
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-proz-grey">Account Tier Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === 'admin'
                        ? 'bg-proz-purple/25 border-proz-purple text-proz-white shadow-purple-glow'
                        : 'bg-proz-elevated border-proz-border text-proz-grey'
                    }`}
                  >
                    Admin Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === 'user'
                        ? 'bg-proz-cyan/20 border-proz-cyan text-proz-white shadow-cyan-glow'
                        : 'bg-proz-elevated border-proz-border text-proz-grey'
                    }`}
                  >
                    Standard User
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold shadow-purple-glow flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-grey">Phone Number (E.164)</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14155551234"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-grey">6-Digit SMS Code</label>
              <input
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-mono tracking-widest text-center"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold"
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 rounded-full bg-proz-elevated hover:bg-proz-border/70 border border-proz-border text-proz-white text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Chrome className="w-4 h-4 text-proz-cyan" />
          <span>Continue with Google</span>
        </button>

        {!supabaseConfigured && (
          <div className="p-3 rounded-xl bg-proz-elevated/60 border border-proz-border text-[11px] text-proz-grey flex items-start gap-2">
            <Info className="w-4 h-4 text-proz-cyan shrink-0 mt-0.5" />
            <span>
              Supabase Auth keys (NEXT_PUBLIC_SUPABASE_URL &amp; NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set in env; Email login uses local evaluation fallback while Google/Phone OAuth activate once configured in your deployment dashboard.
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-proz-border/40 text-center space-y-2">
          <p className="text-xs text-proz-grey">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-proz-cyan font-bold hover:underline">
              Create Free Account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Session &amp; Protected Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
