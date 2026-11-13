import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'Terms of Service — PROZ MOVIE',
  description: 'Terms and conditions governing the authorized access and use of the PROZ MOVIE streaming platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms and Conditions of Use" lastUpdated="November 2026">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-proz-white">1. Acceptance of Terms</h2>
        <p>
          By creating an account, browsing, or streaming digital content on {brandConfig.name}, you agree to abide by these Terms and Conditions and all applicable municipal, state, national, and international laws.
        </p>

        <h2 className="text-base font-bold text-proz-white">2. Authorized Streaming License</h2>
        <p>
          {brandConfig.name} grants you a non-exclusive, non-transferable, revocable personal streaming license to view audio-visual works for personal, non-commercial entertainment. Content streaming is subject to valid territorial distribution rights and active subscription plan entitlements.
        </p>

        <h2 className="text-base font-bold text-proz-white">3. Prohibited Conduct</h2>
        <p>
          Users may not reverse-engineer, decompile, scrape, rip, circumvent DRM or encryption keys, redistribute signed stream tokens, or bypass territorial geofences. Violation will result in immediate termination of account access and referral to legal authorities.
        </p>

        <h2 className="text-base font-bold text-proz-white">4. Device Limits & Concurrent Streams</h2>
        <p>
          Each subscription tier permits a specified number of simultaneous active playback streams (Free: 1, Basic: 2, Standard: 4, Premium VIP: 6). Excess concurrent sessions will trigger an automated session pause on the earliest stream.
        </p>

        <h2 className="text-base font-bold text-proz-white">5. Governing Law</h2>
        <p>
          These terms are governed by and construed in accordance with the laws of the State of Delaware, USA, without regard to conflict of law principles.
        </p>
      </div>
    </LegalLayout>
  );
}
