# PROZ MOVIE — Stream Your World
### YOUR WORLD. YOUR ENTERTAINMENT.

![PROZ MOVIE Logo](/public/brand/logo-main.svg)

PROZ MOVIE is a complete premium entertainment streaming platform inspired by the modern browsing experience of MovieBox, built with an original brand identity, original code, and independent high-performance infrastructure.

Designed with a futuristic **Liquid Glass** aesthetic, PROZ MOVIE delivers an authentic cinematic streaming experience with adaptive bitrate playback, signed session authorizations, multi-profile account management, configurable subscription plans, and an enterprise-grade administrative dashboard.

---

## 🌟 Key Features

### 1. Official Brand Identity & Liquid Glass Design System
- **Centralized Brand System:** Central configuration file (`src/config/brand.config.ts`) driving brand identity, colors, and typography across the entire platform.
- **Custom Vector Branding:** Hand-crafted P/play emblem seamlessly combined with futuristic PROZ MOVIE typography. Logo variants include Main, Compact, App Icon, Favicon, White, and Transparent SVG.
- **Cinematic Palette:** Midnight (`#080B12`), Glass Navy (`#111827`), Glass Border (`#334155`), Electric Purple (`#8B5CF6`), Neon Cyan (`#22D3EE`), Soft White (`#F8FAFC`), and Muted Grey (`#94A3B8`).
- **Liquid Glass Interface:** Translucent glass cards, floating glass navigation, ambient purple and cyan lighting, smooth hover zoom animations, and responsive mobile drawers.

### 2. Comprehensive Streaming Homepage (14 Dedicated Sections)
1. **Floating Glass Navigation:** Logo, search shortcut (`⌘K`), category navigation, watchlist indicator, and user profile drawer.
2. **Featured Cinematic Hero Banner:** Dynamic multi-item hero with trailer preview, rating, metadata, quick play, and watchlist toggles.
3. **Trending Movies:** Highest-velocity global blockbusters.
4. **Popular Movies:** Critically acclaimed audience favorites.
5. **Latest Releases:** Newest cinematic and seasonal additions.
6. **Continue Watching:** Real-time synchronized viewing progress bars with resume timestamps.
7. **Popular Web Series:** Bingeable multi-episode television sagas.
8. **Anime Collection:** Japanese masterworks with subbed and dubbed metadata.
9. **Korean & Asian Dramas:** K-Drama, C-Drama, and J-Drama releases.
10. **International Entertainment:** Award-winning global cinema.
11. **Recommended for You:** Algorithmic personalized picks.
12. **Featured Originals:** High-fidelity exclusive PROZ Originals.
13. **Popular Genres:** Interactive Lucide icon glass pills.
14. **Footer:** Comprehensive legal, device, DMCA, and system status links.

### 3. Dedicated Content Categories
- **Movies (`/movies`):** Hollywood, Bollywood, South Indian, Bengali, and International films.
- **Web Series (`/series`):** OTT shows, Originals, and Documentaries with season/episode breakdown.
- **Anime (`/anime`):** Shonen, Seinen, seasonal hits, dual audio options.
- **Drama (`/drama`):** Korean, Chinese, Japanese, and international dramatic series.
- **Multi-faceted Filtering:** Live category search, genre filters, language filters, release-year filters, and 4 sorting modes.

### 4. Professional Video Player & Playback Engine
- **Authorized Shaka Player Engine:** Adaptive Bitrate (ABR) streaming supporting HLS and MPEG-DASH manifests.
- **Playback Controls:** Play/pause, 10s seek, smooth scrubber, volume slider, fullscreen, picture-in-picture, playback speeds (0.75x to 2x).
- **Subtitles & Multi-Audio:** Dynamic subtitle track switcher (English, Spanish, Hindi, etc.) and dual-audio language selection.
- **Smart Playback Features:** Auto Skip Intro button, Next Episode launcher for series, and continuous watch progress saving every 5 seconds.
- **Backend Authorization Sequence:**
  1. Authenticate user credentials.
  2. Verify content entitlement.
  3. Verify subscription plan level.
  4. Check content license validity and territorial clearance.
  5. Check age restrictions.
  6. Issue signed cryptographic HMAC-SHA256 playback session token (`/api/playback/authorize`).
  7. Initialize video player with signed session.
  8. Save progress telemetry (`/api/playback/progress`).

### 5. User Account System & Multi-Profile Support
- **Authentication:** Registration, Login, Google OAuth button, Password Reset.
- **Watchlist & History:** Synchronized watchlist (`/watchlist`) and resume watching queue (`/history`).
- **Device Management (`/account/devices`):** Active device sessions list, concurrent screen enforcement, and remote session termination.
- **Account Settings (`/account`):** Profile editing, maturity rating preference, and GDPR account deletion request.

### 6. Configurable Subscriptions & Billing
- **Four Tiers:**
  - **FREE:** Ad-supported, 720p HD, 1 screen.
  - **BASIC ($4.99/mo):** Ad-free, 1080p FHD, 2 screens.
  - **STANDARD ($9.99/mo):** Ad-free, 1080p FHD, 4 screens, offline downloads.
  - **PREMIUM VIP ($14.99/mo):** 4K Ultra HD, HDR10+, Dolby Atmos 7.1, 6 screens.
- **Payment Infrastructure:** Interactive billing toggle (monthly / annual with 20% discount), checkout modal, and server-side webhook handler (`/api/webhooks/payment`).

### 7. 18+ Restricted Zone & Parental Controls
- Dedicated adult vault (`/restricted`) protected by server-side age verification (DOB declaration) and 4-digit parental control PIN (Default: `1234`).
- Strict compliance safeguards to prevent unauthorized access by minors.

### 8. Master Administrator Console (`/admin`)
- **Analytics Overview:** Revenue tracking, subscriber counts, total catalog titles, and 24-hour streaming CDN performance charts.
- **Catalog Management:** Add new movies and shows, assign genres, maturity ratings, poster artwork, and video stream manifests.
- **License Management:** Contract windows, territorial allowances, and rights expiry tracking.
- **Subscriber Management:** Active customer accounts, tier status, and billing health.
- **Security Audit Logs:** Real-time log of playback tokens issued, DRM key validations, and device sync events.

### 9. Legal & Compliance Suite
- Privacy Policy (`/legal/privacy`)
- Terms and Conditions of Use (`/legal/terms`)
- Copyright & DMCA Compliance (`/legal/copyright`)
- Expedited Content Removal Request (`/legal/removal-request`)
- Subscription & Refund Policy (`/legal/refund`)
- Age-Restriction & Parental Controls Policy (`/legal/age-policy`)
- Direct Concierge Contact & FAQ (`/contact`)
- Live Infrastructure Status (`/status`)

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router, Server Actions, API Routes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS, Custom Liquid Glass Theme
- **Icons:** Lucide React
- **Streaming:** Shaka Player (Adaptive Bitrate HLS & MPEG-DASH)
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS)
- **Validation:** Zod

---

## 🚀 Quick Start (Local Development)

```bash
# Navigate to project directory
cd proz-movie

# Install dependencies (already installed)
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License & Attribution

PROZ MOVIE is an original software application designed for digital entertainment streaming.
*Tagline: YOUR WORLD. YOUR ENTERTAINMENT.*
Copyright © 2026 PROZ Entertainment Technologies Inc. All rights reserved.
