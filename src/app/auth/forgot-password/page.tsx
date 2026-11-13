"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl glass-card border border-proz-border/60 shadow-glass-lg space-y-6">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="main" size="md" />
          </div>
          <h1 className="text-2xl font-black text-proz-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-proz-grey">
            Enter your email to receive secure recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl glass-card border border-emerald-500/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-proz-white">Recovery Link Dispatched</h3>
            <p className="text-xs text-proz-grey">
              We have sent a password reset email to <span className="text-proz-cyan">{email}</span>. Please check your inbox and spam folders.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-2 px-5 py-2 rounded-full glass-button-primary text-xs font-semibold"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-grey">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-proz-grey absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full glass-button-primary text-sm font-bold shadow-cyan-glow"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-proz-grey hover:text-proz-cyan transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
