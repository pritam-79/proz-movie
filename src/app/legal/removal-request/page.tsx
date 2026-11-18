"use client";

import React, { useState } from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { Send, CheckCircle2 } from 'lucide-react';

export default function RemovalRequestPage() {
  const [claimantName, setClaimantName] = useState('');
  const [email, setEmail] = useState('');
  const [titleUrl, setTitleUrl] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <LegalLayout title="Expedited Content Removal Request" lastUpdated="November 2026">
      <div className="space-y-4">
        <p>
          Copyright owners or designated legal representatives may submit formal takedown or licensing conflict notices directly through this verified submission interface. Our compliance team acknowledges and investigates all submissions within 24 business hours.
        </p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-proz-white">Request Dispatched Successfully</h3>
            <p className="text-xs text-proz-grey">
              Case Reference: <span className="text-proz-cyan font-mono">REM-{Date.now().toString().slice(-6)}</span>. Our legal department will verify the submitted evidence and respond directly to <span className="text-proz-white">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-white">Legal Rightsholder / Representative</label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="Studio or Representative Name"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-proz-white">Official Legal Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="legal@rightsholder.com"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-white">Title Name & PROZ Entertainment URL</label>
              <input
                type="text"
                required
                value={titleUrl}
                onChange={(e) => setTitleUrl(e.target.value)}
                placeholder="https://prozmovie.com/title/..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-proz-white">Specific Grounds for Removal / DMCA Declaration</label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State registration numbers, territorial copyright conflicts, or licensing expirations..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full glass-button-primary text-xs font-bold shadow-cyan-glow flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Expedited Removal Notice</span>
            </button>
          </form>
        )}
      </div>
    </LegalLayout>
  );
}
