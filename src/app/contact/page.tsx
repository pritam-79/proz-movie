"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, HelpCircle, Send, CheckCircle2, Globe, Clock, ShieldCheck } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const FAQS = [
    {
      q: "How does 4K Ultra HD and Dolby Atmos streaming work?",
      a: "Our Shaka Player streaming engine dynamically detects your network bandwidth and hardware decode capabilities, automatically delivering adaptive multi-bitrate streams with zero buffering up to 4K 60fps."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel with a single click in your Account Settings. You will retain VIP access until the end of your billing cycle."
    },
    {
      q: "How do I activate parental controls for my family?",
      a: "Navigate to Account Settings, select your sub-profiles, and assign a 4-digit master PIN to lock TV-MA and 18+ content."
    },
    {
      q: "What devices are supported by PROZ MOVIE?",
      a: "PROZ MOVIE is accessible on all modern web browsers (Chrome, Safari, Firefox, Edge), iOS & Android smartphones/tablets, smart TVs, Apple TV, and streaming sticks."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-proz-cyan/20 text-proz-cyan border border-proz-cyan/30">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-proz-white tracking-tight">
          How Can We Help You?
        </h1>
        <p className="text-xs sm:text-sm text-proz-grey">
          Our global entertainment support team is on standby 24/7 to assist with streaming, account billing, and device setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-card border border-proz-border/50 shadow-glass space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-proz-white">Send Us a Direct Message</h2>
            <p className="text-xs text-proz-grey">Fill out the form below and we will respond within 4 hours.</p>
          </div>

          {sent ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-proz-white">Message Dispatched!</h3>
              <p className="text-xs text-proz-grey">
                Thank you, <span className="text-proz-cyan">{name}</span>. Ticket #PROZ-{Date.now().toString().slice(-5)} has been logged. Our concierge will email you shortly at <span className="text-proz-white">{email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-proz-grey">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-proz-grey">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Topic Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input bg-proz-navy text-white"
                >
                  <option value="technical">Technical Playback & Video Quality</option>
                  <option value="billing">Subscription & Billing Questions</option>
                  <option value="licensing">Content Licensing & Distribution</option>
                  <option value="general">General Feedback & Suggestions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-proz-grey">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-full glass-button-primary font-bold shadow-cyan-glow flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-proz-white pb-2 border-b border-proz-border/40">
              Direct Contact
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 text-proz-grey">
                <Mail className="w-4 h-4 text-proz-cyan shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-proz-white block">Email Support</span>
                  <a href={`mailto:${brandConfig.company.supportEmail}`} className="text-proz-cyan hover:underline">
                    {brandConfig.company.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-proz-grey">
                <Clock className="w-4 h-4 text-proz-purple shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-proz-white block">Service Hours</span>
                  <span>24 hours / 7 days a week</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-proz-grey">
                <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-proz-white block">Headquarters</span>
                  <span>{brandConfig.company.legalName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-proz-border/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Global CDN Network Status</span>
            </div>
            <p className="text-xs text-proz-grey leading-relaxed">
              All 14 edge CDN playback clusters are operating normally with ultra-low latency playback delivery.
            </p>
          </div>

        </div>

      </div>

      {/* Frequently Asked Questions Section */}
      <div id="faq" className="pt-6 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-proz-purple" />
          <h2 className="text-xl sm:text-2xl font-bold text-proz-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl glass-card border border-proz-border/40 space-y-2">
              <h3 className="text-sm font-bold text-proz-white">{faq.q}</h3>
              <p className="text-xs text-proz-grey leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
