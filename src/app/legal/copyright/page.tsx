import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: 'Copyright & DMCA Policy — PROZ Entertainment',
  description: 'Copyright protection, intellectual property ownership, and Digital Millennium Copyright Act compliance procedures.',
};

export default function CopyrightPage() {
  return (
    <LegalLayout title="Copyright & DMCA Compliance Policy" lastUpdated="November 2026">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-proz-white">1. Statement of Principle</h2>
        <p>
          {brandConfig.name} strictly respects the intellectual property rights of copyright holders, studios, producers, and creators worldwide. We distribute content solely pursuant to valid, verified commercial licensing contracts or authorized open distribution frameworks.
        </p>

        <h2 className="text-base font-bold text-proz-white">2. TMDB Metadata Attribution</h2>
        <p>
          This product uses the TMDB API for metadata enrichment but is not endorsed or certified by TMDB. Metadata, promotional poster art, and public promotional trailers provided by TMDB do not grant streaming rights or video distribution licenses.
        </p>

        <h2 className="text-base font-bold text-proz-white">3. DMCA Takedown Notices</h2>
        <p>
          If you believe that your copyrighted audio-visual work has been infringed on the {brandConfig.name} network, please dispatch a formal written DMCA notice to our designated Copyright Agent at <span className="text-proz-cyan">dmca@prozmovie.com</span> or via our expedited Content Removal Request form.
        </p>

        <h2 className="text-base font-bold text-proz-white">4. Required Notice Elements</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-proz-grey">
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Exact URL or Content ID of the allegedly infringing material on our network.</li>
          <li>Your legal contact information (name, address, telephone, email).</li>
          <li>A statement of good-faith belief that the disputed use is unauthorized.</li>
          <li>A statement under penalty of perjury that the notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
        </ul>
      </div>
    </LegalLayout>
  );
}
