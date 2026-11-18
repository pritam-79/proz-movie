/**
 * PROZ MOVIE - Central Brand Configuration
 * YOUR WORLD. YOUR ENTERTAINMENT.
 * 
 * Never hardcode brand identity throughout individual components.
 * Always import and reference this centralized brand configuration.
 */

export interface BrandConfig {
  name: string;
  tagline: string;
  websiteTitle: string;
  description: string;
  establishedYear: number;
  copyright: string;
  company: {
    legalName: string;
    supportEmail: string;
    contactUrl: string;
  };
  colors: {
    midnight: string;
    glassNavy: string;
    glassBorder: string;
    electricPurple: string;
    neonCyan: string;
    softWhite: string;
    mutedGrey: string;
  };
  personality: string[];
  design: {
    style: string;
    blurAmount: string;
    borderGlowCyan: string;
    borderGlowPurple: string;
  };
  logos: {
    main: string;
    compact: string;
    appIcon: string;
    favicon: string;
    white: string;
    transparentSvg: string;
  };
  navigation: {
    mainNav: Array<{ label: string; href: string; badge?: string }>;
    userNav: Array<{ label: string; href: string }>;
    footerNav: {
      categories: Array<{ label: string; href: string }>;
      support: Array<{ label: string; href: string }>;
      legal: Array<{ label: string; href: string }>;
    };
  };
  playback: {
    defaultProvider: string;
    drmSystem: string;
    defaultQuality: string;
    supportedQualities: string[];
    enableAdaptiveBitrate: boolean;
  };
  plans: {
    free: { id: string; name: string; price: number; quality: string; screens: number };
    basic: { id: string; name: string; price: number; quality: string; screens: number };
    standard: { id: string; name: string; price: number; quality: string; screens: number };
    premium: { id: string; name: string; price: number; quality: string; screens: number };
  };
}

export const brandConfig: BrandConfig = {
  name: "PROZ MOVIE",
  tagline: "YOUR WORLD. YOUR ENTERTAINMENT.",
  websiteTitle: "PROZ MOVIE – Stream Your World",
  description:
    "Experience next-generation entertainment streaming with PROZ MOVIE. Dive into 4K movies, exclusive web series, anime collections, and international dramas with Liquid Glass precision.",
  establishedYear: 2026,
  copyright: "© 2026 PROZ MOVIE. All rights reserved. Your World. Your Entertainment.",
  
  company: {
    legalName: "PROZ Entertainment Technologies Inc.",
    supportEmail: "support@prozmovie.com",
    contactUrl: "/contact",
  },

  colors: {
    midnight: "#080B12",
    glassNavy: "#111827",
    glassBorder: "#334155",
    electricPurple: "#8B5CF6",
    neonCyan: "#22D3EE",
    softWhite: "#F8FAFC",
    mutedGrey: "#94A3B8",
  },

  personality: [
    "Futuristic",
    "Cinematic",
    "Minimal",
    "Premium",
    "Modern",
  ],

  design: {
    style: "Liquid Glass",
    blurAmount: "backdrop-blur-md",
    borderGlowCyan: "rgba(34, 211, 238, 0.4)",
    borderGlowPurple: "rgba(139, 92, 246, 0.4)",
  },

  logos: {
    main: "/brand/logo-main.svg",
    compact: "/brand/logo-compact.svg",
    appIcon: "/brand/app-icon.svg",
    favicon: "/brand/favicon.svg",
    white: "/brand/logo-white.svg",
    transparentSvg: "/brand/logo-transparent.svg",
  },

  navigation: {
    mainNav: [
      { label: "Home", href: "/" },
      { label: "Live TV", href: "/live" },
      { label: "Movies", href: "/movies" },
      { label: "TV Shows", href: "/series" },
      { label: "Anime", href: "/anime" },
      { label: "Asian Dramas", href: "/drama" },
      { label: "All Channels", href: "/channels" },
      { label: "Ranking", href: "/ranking" },
      { label: "Explore", href: "/explore" },
      { label: "18+ Zone", href: "/restricted", badge: "18+" },
    ],
    userNav: [
      { label: "My Watchlist", href: "/watchlist" },
      { label: "Viewing History", href: "/history" },
      { label: "Account Settings", href: "/account" },
      { label: "Subscription Plans", href: "/subscription" },
    ],
    footerNav: {
      categories: [
        { label: "Trending Movies", href: "/movies?sort=trending" },
        { label: "Binge Web Series", href: "/series" },
        { label: "Anime Universe", href: "/anime" },
        { label: "Asian Dramas", href: "/drama" },
        { label: "PROZ Originals", href: "/movies?type=original" },
        { label: "Restricted 18+", href: "/restricted" },
      ],
      support: [
        { label: "Help & FAQ", href: "/contact#faq" },
        { label: "Supported Devices", href: "/account/devices" },
        { label: "Contact Us", href: "/contact" },
        { label: "System Status", href: "/status" },
      ],
      legal: [
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Copyright & DMCA", href: "/legal/copyright" },
        { label: "Content Removal Request", href: "/legal/removal-request" },
        { label: "Subscription Policy", href: "/legal/refund" },
        { label: "Age Restriction Policy", href: "/legal/age-policy" },
      ],
    },
  },

  playback: {
    defaultProvider: "Shaka Stream Engine / Authorized DRM Ready",
    drmSystem: "Widevine / FairPlay / ClearKey",
    defaultQuality: "1080p",
    supportedQualities: ["Auto (ABR)", "4K UHD", "1080p FHD", "720p HD", "480p SD"],
    enableAdaptiveBitrate: true,
  },

  plans: {
    free: {
      id: "plan_free",
      name: "FREE",
      price: 0,
      quality: "720p HD",
      screens: 1,
    },
    basic: {
      id: "plan_basic",
      name: "BASIC",
      price: 4.99,
      quality: "1080p Full HD",
      screens: 2,
    },
    standard: {
      id: "plan_standard",
      name: "STANDARD",
      price: 9.99,
      quality: "1080p Full HD (Downloads)",
      screens: 4,
    },
    premium: {
      id: "plan_premium",
      name: "PREMIUM",
      price: 14.99,
      quality: "4K UHD + HDR + Dolby Atmos",
      screens: 6,
    },
  },
};
