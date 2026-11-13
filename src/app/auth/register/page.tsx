"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setIsLoading(true);
    try {
      await signup(email, name);
      router.push('/subscription');
    } catch (err) {
      console.error(err);
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
            Create Your Account
          </h1>
          <p className="text-xs text-proz-grey">
            Start streaming unlimited entertainment across all your devices
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-proz-grey">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-proz-grey">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-proz-grey">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 text-xs text-proz-grey">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded accent-proz-cyan"
            />
            <label htmlFor="terms">
              I agree to the{' '}
              <Link href="/legal/terms" className="text-proz-cyan hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge the{' '}
              <Link href="/legal/privacy" className="text-proz-cyan hover:underline">
                Privacy Policy
              </Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !agreeTerms}
            className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold shadow-cyan-glow flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating Account...' : 'Continue to Plans'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-proz-grey pt-2">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-proz-cyan font-semibold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
