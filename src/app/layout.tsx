import type { Metadata } from 'next';
import './globals.css';
import { brandConfig } from '@/config/brand.config';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/navigation/Navbar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import Footer from '@/components/navigation/Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import InAppUpdater from '@/components/common/InAppUpdater';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: brandConfig.websiteTitle,
  description: brandConfig.description,
  keywords: [
    'PROZ Entertainment',
    'Stream Your World',
    'Movies',
    'Web Series',
    'Anime',
    'Korean Drama',
    '4K Streaming',
    'Liquid Glass',
  ],
  authors: [{ name: brandConfig.name }],
  icons: {
    icon: brandConfig.logos.favicon,
    apple: brandConfig.logos.appIcon,
  },
  openGraph: {
    title: brandConfig.websiteTitle,
    description: brandConfig.tagline,
    url: 'https://prozmovie.com',
    siteName: brandConfig.name,
    images: [
      {
        url: '/brand/logo-main.svg',
        width: 1200,
        height: 630,
        alt: brandConfig.name,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#06080F] text-proz-white min-h-screen flex flex-col font-sans selection:bg-rose-600 selection:text-white relative overflow-x-hidden">
        <AuthProvider>
          {/* Subtle Ambient Background Mesh Lights */}
          <div className="fixed top-0 left-1/4 w-[420px] h-[420px] bg-rose-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-1/3 right-1/4 w-[420px] h-[420px] bg-proz-purple/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 w-full pt-14 sm:pt-16 pb-24 md:pb-10">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>

          {/* Site Footer */}
          <Footer />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* In-App Updater (Web & Android) */}
          <InAppUpdater />
        </AuthProvider>
      </body>
    </html>
  );
}
