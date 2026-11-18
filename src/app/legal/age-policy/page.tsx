import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'Age-Restriction & Parental Controls Policy — PROZ Entertainment',
  description: 'Maturity ratings, parental controls PIN enforcement, and age verification standards on PROZ Entertainment.',
};

export default function AgePolicyPage() {
  return (
    <LegalLayout title="Age-Restriction & Parental Control Standards" lastUpdated="November 2026">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-proz-white">1. Maturity Rating System</h2>
        <p>
          {brandConfig.name} classifies all media according to international industry content standards:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-proz-grey">
          <li><strong className="text-proz-white">G / TV-Y:</strong> Suitable for general audiences of all ages.</li>
          <li><strong className="text-proz-white">PG / TV-PG:</strong> Parental guidance suggested; some material may not be suitable for young children.</li>
          <li><strong className="text-proz-white">PG-13 / TV-14:</strong> Parents strongly cautioned; suitable for viewers aged 13 and older.</li>
          <li><strong className="text-proz-white">TV-MA:</strong> Mature audience only; may contain intense violence, strong language, or mature themes.</li>
          <li><strong className="text-rose-400 font-bold">18+ Restricted Zone:</strong> Adult content strictly prohibited to individuals under 18 years of age.</li>
        </ul>

        <h2 className="text-base font-bold text-proz-white">2. Parental PIN Protection</h2>
        <p>
          Account holders can establish a 4-digit master parental PIN to restrict child sub-profiles from accessing TV-MA or 18+ content. The PIN is required whenever an adult-rated stream is initiated.
        </p>

        <h2 className="text-base font-bold text-proz-white">3. Mandatory Identity Verification</h2>
        <p>
          In jurisdictions where legal compliance requires age authentication for adult-rated entertainment, {brandConfig.name} enforces date-of-birth confirmation and server-side authorization tokens prior to issuing video playback manifests.
        </p>
      </div>
    </LegalLayout>
  );
}
