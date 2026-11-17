import React from 'react';
import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import { Film, Shield, Zap, Globe, Users, Heart } from 'lucide-react';

export const metadata = {
  title: `About — ${brandConfig.websiteTitle}`,
  description: 'Learn about PROZ MOVIE — a premium entertainment streaming platform built for the world.',
};

const values = [
  { icon: Film, title: 'Premium Entertainment', desc: 'Curated cinema from Hollywood, Bollywood, Anime, K-Drama and beyond — all in one place.' },
  { icon: Shield, title: 'Licensed & Legal', desc: 'Every title on PROZ MOVIE is properly licensed. We respect creators, rights holders and distributors.' },
  { icon: Zap, title: 'Cutting-Edge Streaming', desc: 'Adaptive bitrate HLS delivery, Shaka Player, DRM protection, and 4K HDR where licensed.' },
  { icon: Globe, title: 'Global Entertainment', desc: 'Content in English, Hindi, Korean, Japanese, Chinese, Tamil, Telugu, Bengali and more.' },
  { icon: Users, title: 'Multi-Profile Support', desc: 'Create up to 4 profiles per account with individual watchlists, preferences and history.' },
  { icon: Heart, title: 'Built With Care', desc: 'PROZ MOVIE is an independent platform built to deliver a cinema-grade experience to every screen.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#080B12] pt-24 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-radial from-[#8B5CF6]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-medium mb-6">
            <Film className="w-4 h-4" />
            About PROZ MOVIE
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#F8FAFC] mb-6 leading-tight">
            YOUR WORLD.{' '}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
              YOUR ENTERTAINMENT.
            </span>
          </h1>
          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            PROZ MOVIE is a premium entertainment streaming platform delivering cinema-grade experiences 
            across movies, web series, anime, dramas and more — built on a foundation of authorized content 
            and cutting-edge streaming technology.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">Our Mission</h2>
          <p className="text-lg text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
            To build a world-class streaming platform that respects creators, honors licensing agreements, 
            delivers exceptional viewing experiences, and brings global entertainment to every screen — 
            without compromise.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#F8FAFC] text-center mb-12">What Makes Us Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#111827]/80 backdrop-blur-md border border-[#334155]/60 rounded-2xl p-6 hover:border-[#8B5CF6]/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{title}</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">Ready to Stream?</h2>
        <p className="text-[#94A3B8] mb-8">
          Join PROZ MOVIE today and experience entertainment like never before.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-semibold hover:from-[#7C3AED] hover:to-[#6D28D9] transition-all duration-300"
          >
            Create Free Account
          </Link>
          <Link
            href="/subscription"
            className="px-8 py-3 rounded-xl bg-[#111827]/80 border border-[#334155]/60 text-[#F8FAFC] font-semibold hover:border-[#8B5CF6]/40 transition-all duration-300"
          >
            View Plans
          </Link>
        </div>
      </section>
    </main>
  );
}
