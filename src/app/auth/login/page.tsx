"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('alex.proz@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'user' | 'admin'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, role);
      router.push('/');
    } catch (err: any) {
      setError('Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-6">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="main" size="md" />
          </div>
          <h1 className="text-2xl font-black text-proz-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-proz-grey">
            Sign in to resume watching in 4K Liquid Glass quality
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

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

          {/* Role selector for demo convenience */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-proz-grey">Account Tier Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  role === 'admin' 
                    ? 'bg-proz-purple/30 border-proz-purple text-proz-white shadow-purple-glow' 
                    : 'glass-card border-proz-border/40 text-proz-grey'
                }`}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  role === 'user' 
                    ? 'bg-proz-cyan/30 border-proz-cyan text-proz-white shadow-cyan-glow' 
                    : 'glass-card border-proz-border/40 text-proz-grey'
                }`}
              >
                Standard Viewer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold shadow-cyan-glow flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-proz-border/40" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-proz-midnight px-2 text-proz-grey">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            login('google.user@prozmovie.com', 'user');
            router.push('/');
          }}
          className="w-full py-3 rounded-xl glass-button-secondary text-xs font-semibold flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-xs text-proz-grey pt-2">
          New to PROZ Entertainment?{' '}
          <Link href="/auth/register" className="text-proz-cyan font-semibold hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}
