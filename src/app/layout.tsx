import type { Metadata, Viewport } from 'next';
import './globals.css';
import { brandConfig } from '@/config/brand.config';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppChrome from '@/components/layout/AppChrome';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#07070A',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: brandConfig.websiteTitle,
  description: brandConfig.description,
  keywords: [
    'PROZ MOVIE',
    'PROZ Entertainment',
    '4K UHD Streaming',
    'Movies',
    'Hot Web Series',
    'Anime',
    'Live Channels',
    '3D VR Player',
  ],
  authors: [{ name: brandConfig.name }],
  icons: {
    icon: brandConfig.logos.favicon,
    apple: brandConfig.logos.appIcon,
  },
  manifest: '/manifest.webmanifest',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-proz-midnight text-proz-white min-h-screen flex flex-col font-sans selection:bg-proz-purple selection:text-white relative overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            {/* Obsidian Ember Ambient Stage Glows */}
            <div className="fixed -top-24 left-1/4 w-[480px] h-[480px] bg-proz-purple/10 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-1/5 w-[440px] h-[440px] bg-proz-cyan/10 rounded-full blur-[160px] pointer-events-none -z-10" />

            <AppChrome>{children}</AppChrome>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
