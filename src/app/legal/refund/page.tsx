import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'Subscription & Refund Policy — PROZ Entertainment',
  description: 'Understand billing intervals, automatic renewals, trial policies, and refund eligibility on PROZ Entertainment.',
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Subscription & Refund Policy" lastUpdated="November 2026">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-proz-white">1. Subscription Billing Cycles</h2>
        <p>
          {brandConfig.name} subscriptions are billed automatically in advance on either a monthly or yearly cycle, depending on your selected plan. Billing recurs continuously until cancelled by the subscriber.
        </p>

        <h2 className="text-base font-bold text-proz-white">2. Cancellation Policy</h2>
        <p>
          You may cancel your subscription at any time via Account Settings. Upon cancellation, your access to VIP high-definition streams and downloads will persist until the end of your current prepaid billing period.
        </p>

        <h2 className="text-base font-bold text-proz-white">3. Refund Eligibility</h2>
        <p>
          Due to the digital nature of instant streaming services, fees are generally non-refundable. However, we grant full prorated refunds under the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-proz-grey">
          <li>Systemic, sustained service outages exceeding 48 consecutive hours.</li>
          <li>Accidental duplicate billing transactions caused by gateway processing errors.</li>
          <li>Cancellation requested within 48 hours of initial paid activation with zero streaming hours consumed.</li>
        </ul>

        <h2 className="text-base font-bold text-proz-white">4. Refund Inquiries</h2>
        <p>
          To dispute a charge or inquire about refund eligibility, submit your billing receipt to <span className="text-proz-cyan">billing@prozmovie.com</span>.
        </p>
      </div>
    </LegalLayout>
  );
}
