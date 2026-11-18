import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'Privacy Policy — PROZ Entertainment',
  description: 'Learn how PROZ Entertainment collects, protects and handles your personal information and playback data.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="November 2026">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-proz-white">1. Introduction</h2>
        <p>
          At {brandConfig.name} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we are committed to safeguarding your privacy and ensuring the security of your personal information. This Privacy Policy governs your use of the {brandConfig.name} streaming platform, applications, and related media delivery systems.
        </p>

        <h2 className="text-base font-bold text-proz-white">2. Information We Collect</h2>
        <p>
          We collect account registration details (email, full name), encrypted authentication tokens, and playback telemetry necessary for adaptive streaming optimization (bandwidth estimate, device resolution, playback session tokens). We do not sell or monetize personal viewing preferences.
        </p>

        <h2 className="text-base font-bold text-proz-white">3. Row Level Security & Encryption</h2>
        <p>
          All profile data and watch history are partitioned strictly using Supabase PostgreSQL Row Level Security (RLS). Cryptographic session tokens are generated on-the-fly and verified through HMAC-SHA256 signatures to prevent unauthorized credential sharing.
        </p>

        <h2 className="text-base font-bold text-proz-white">4. Payment Information</h2>
        <p>
          All payment card data is processed directly via PCI-DSS certified providers (such as Stripe or LemonSqueezy). {brandConfig.name} does not retain or store raw card numbers, CVCs, or bank authorization details on our application servers.
        </p>

        <h2 className="text-base font-bold text-proz-white">5. Your Data Rights & Deletion</h2>
        <p>
          You have the right to request access to your stored personal data or execute complete account deletion at any time directly through the Account Settings portal or by contacting <span className="text-proz-cyan">{brandConfig.company.supportEmail}</span>.
        </p>
      </div>
    </LegalLayout>
  );
}
