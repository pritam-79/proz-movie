import React from 'react';
import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';
import { Film, Shield, Zap, Globe, Users, Heart } from 'lucide-react';

export const metadata = {
  title: `About — ${brandConfig.websiteTitle}`,
  description: 'Learn about PROZ Entertainment — a premium entertainment streaming platform built for the world.',
};

const values = [
  { icon: Film, title: 'Premium Entertainment', desc: 'Curated cinema from Hollywood, Bollywood, Anime, K-Drama and beyond — all in one place.' },
  { icon: Shield, title: 'Licensed & Legal', desc: 'Every title on PROZ Entertainment is properly licensed. We respect creators, rights holders and distributors.' },
  { icon: Zap, title: 'Cutting-Edge Streaming', desc: 'Adaptive bitrate HLS delivery, Shaka Player, DRM protection, and 4K HDR where licensed.' },
  { icon: Globe, title: 'Global Entertainment', desc: 'Content in English, Hindi, Korean, Japanese, Chinese, Tamil, Telugu, Bengali and more.' },
  { icon: Users, title: 'Multi-Profile Support', desc: 'Create up to 4 profiles per account with individual watchlists, preferences and history.' },
  { icon: Heart, title: 'Built With Care', desc: 'PROZ Entertainment is an independent platform built to deliver a cinema-grade experience to every screen.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-proz-midnight text-proz-white pt-6 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-radial from-proz-purple/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-proz-purple/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-proz-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-proz-purple/10 border border-proz-purple/30 text-proz-purple text-sm font-medium mb-6">
            <Film className="w-4 h-4" />
            PROZ Entertainment {brandConfig.version}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-proz-white mb-6 leading-tight">
            YOUR WORLD.{' '}
            <span className="bg-gradient-to-r from-proz-purple to-proz-cyan bg-clip-text text-transparent">
              YOUR ENTERTAINMENT.
            </span>
          </h1>
          <p className="text-xl text-proz-grey max-w-2xl mx-auto leading-relaxed">
            PROZ Entertainment is a premium entertainment streaming platform delivering cinema-grade experiences 
            across movies, web series, anime, dramas and more — built on a foundation of authorized content 
            and cutting-edge streaming technology.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="cinema-card rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-proz-white mb-4">Our Mission</h2>
          <p className="text-lg text-proz-grey max-w-3xl mx-auto leading-relaxed">
            To build a world-class streaming platform that respects creators, honors licensing agreements, 
            delivers exceptional viewing experiences, and brings global entertainment to every screen — 
            without compromise.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-proz-white text-center mb-12">What Makes Us Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="cinema-card rounded-2xl p-6 hover:border-proz-purple/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-proz-purple/10 border border-proz-purple/25 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-proz-purple" />
              </div>
              <h3 className="text-lg font-semibold text-proz-white mb-2">{title}</h3>
              <p className="text-proz-grey text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold text-proz-white mb-4">Ready to Stream?</h2>
        <p className="text-proz-grey mb-8">
          Join PROZ Entertainment today and experience entertainment like never before.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-xl glass-button-primary font-semibold transition-all duration-300"
          >
            Create Free Account
          </Link>
          <Link
            href="/settings"
            className="px-8 py-3 rounded-xl bg-proz-navy border border-proz-border text-proz-white font-semibold hover:border-proz-purple/50 transition-all duration-300"
          >
            Settings &amp; Health
          </Link>
          <Link
            href="/subscription"
            className="px-8 py-3 rounded-xl bg-proz-navy border border-proz-border text-proz-white font-semibold hover:border-proz-purple/50 transition-all duration-300"
          >
            View Plans
          </Link>
        </div>
      </section>
    </main>
  );
}
