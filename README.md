# PROZ MOVIE v0.01
### YOUR WORLD. YOUR ENTERTAINMENT.

A production-oriented, premium OTT streaming web application built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Shaka Player.

---

## 🌐 Live

- **Website:** http://localhost:3000 *(local development)*
- **GitHub:** https://github.com/pritam-79/proz-movie

---

## ✅ What Is Implemented (v0.01)

### Frontend
- **Liquid Glass UI** — Cinematic dark theme, frosted glass cards, purple/cyan ambient lighting
- **Responsive Navigation** — Glass navbar + mobile bottom nav + search modal (⌘K / Ctrl+K)
- **Homepage** — 12+ content sections: hero banner, trending, Hollywood, Bollywood, Anime, K-Drama, Originals, genre grid
- **Movies Catalogue** — Tabs: All / Hollywood / Bollywood / South Indian / Bengali / International. Filters, search, pagination.
- **TV Series** — Dedicated series catalogue with season/episode support
- **Anime Section** — Full anime hub: trending, dubbed, subbed, movies, seasonal categories
- **Drama Section** — Korean, Chinese, Japanese, Thai, International dramas
- **Content Detail Pages** — `/title/[id]`: backdrop, poster, cast, crew, seasons, episodes, similar titles, watchlist toggle, watch button
- **Video Player** — Shaka Player with HLS/DASH, adaptive bitrate, subtitle selection, audio track selection, PiP, fullscreen, keyboard shortcuts, skip intro, next episode, progress saving
- **Search** — Global search modal with instant results, filters, trending
- **My List (Watchlist)** — Add/remove content, persisted in localStorage + synced to Supabase when configured
- **Watch History** — Track & resume from last position, continue watching row
- **User Authentication** — Login, register, forgot password (localStorage mock + Supabase when configured)
- **Multi-Profile Support** — Manage up to 4 profiles per account
- **18+ Restricted Zone** — Age gate (DOB verification), server-side checks, disabled until compliant
- **Subscription Page** — Free / Basic / Standard / Premium VIP plans with toggle monthly/annual
- **Account Settings** — Profile editing, subscription status, parental controls
- **Admin Dashboard** — Full SPA: stats, content manager (add/edit/delete), import jobs, providers, licence manager, users, analytics
- **Legal Pages** — Privacy Policy, Terms, Copyright, DMCA Takedown, Refund Policy, Age Policy
- **About Page** — Brand story, values, CTA
- **Contact Page** — Support form, FAQ
- **System Status** — Infrastructure status page
- **Error Pages** — 404 not-found, custom error pages

### Backend API Routes
| Route | Method | Description |
|---|---|---|
| `/api/content` | GET | Browse content with filters, sorting, pagination |
| `/api/content/[id]` | GET | Full content detail with joins |
| `/api/content/trending` | GET | Trending content |
| `/api/content/featured` | GET | Featured/hero content |
| `/api/seasons/[contentId]` | GET | Seasons for a series |
| `/api/episodes/[seasonId]` | GET | Episodes for a season |
| `/api/watchlist` | GET/POST/DELETE | Manage user watchlist |
| `/api/history` | GET/POST/DELETE | Watch history and progress |
| `/api/playback/authorize` | POST | Signed playback session authorization |
| `/api/playback/progress` | POST | Save viewing progress |
| `/api/search` | GET | Full-text search with filters |
| `/api/age-verify` | GET/POST | Age verification |
| `/api/subscription` | GET | User subscription status |
| `/api/admin/stats` | GET | Dashboard stats |
| `/api/admin/content` | GET/POST | Content management |
| `/api/admin/content/[id]` | GET/PUT/DELETE | Single content management |
| `/api/admin/providers` | GET/POST | Metadata provider management |
| `/api/admin/licenses` | GET/POST/PUT | Licence management |
| `/api/admin/import` | GET/POST | Content import jobs |
| `/api/webhooks/payment` | POST | Payment webhook handler |
| `/api/download/apk` | GET | APK download route |

### Database
- **26 tables** with proper FK constraints, indexes, RLS policies
- Covers: content, seasons, episodes, genres, metadata_providers, content_sources, provider_sync_logs, content_import_jobs, licenses, video_assets, subtitles, audio_tracks, playback_sessions, watch_history, watchlist, subscriptions, payments, user_devices, age_verifications, audit_logs, trending_cache, and more

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install
```bash
cd d:\workspaces\proz-movie
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in your credentials (see **Environment Variables** below).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role key (server-side only) |
| `TMDB_API_KEY` | Optional | TMDB metadata API key |
| `JWT_PLAYBACK_SECRET` | Optional | Secret for signing playback tokens |
| `ENABLE_RESTRICTED_ZONE` | Optional | Set `true` to enable 18+ section |
| `PAYMENT_PROVIDER` | Optional | `stripe`, `razorpay`, or `mock` |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |

> **The app runs fully without any environment variables** using mock data and localStorage.

---

## 🗄️ Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations:
   ```bash
   # In Supabase SQL Editor, run:
   # 1. supabase/migrations/20261113_initial_schema.sql
   # 2. supabase/migrations/20261113_seed_plans.sql
   ```
3. Add your Supabase credentials to `.env.local`

---

## 📱 Android App

The Android Studio project is at `android/`. Open it in Android Studio to build the companion Android WebView app.

```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📋 Pending External Configuration

| Feature | What's Needed |
|---|---|
| **Live Content Catalogue** | Supabase DB configured + licensed content imported via admin |
| **User Authentication** | Supabase project with Auth enabled + Google OAuth configured |
| **Video Streaming** | Authorized video provider (Mux, Cloudflare Stream) + video assets registered in DB |
| **Payment Processing** | Razorpay or Stripe account + webhook configured |
| **TMDB Metadata** | TMDB API key |
| **18+ Zone** | Age verification provider + legal compliance + admin enable |
| **DRM** | Widevine/FairPlay licensing agreement + DRM provider |

---

## 🏗️ Project Structure

```
proz-movie/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (pages)/            # All routes
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   │   ├── brand/              # Logo, brand assets
│   │   ├── content/            # ContentCard, ContentRow, FilterBar, etc.
│   │   ├── home/               # HeroBanner, GenreGrid
│   │   ├── navigation/         # Navbar, Footer
│   │   ├── player/             # VideoPlayer (Shaka)
│   │   └── search/             # SearchModal
│   ├── config/
│   │   └── brand.config.ts     # Central brand configuration
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── lib/
│   │   ├── data/               # Mock content data
│   │   ├── supabase/           # Supabase clients
│   │   └── tmdb/               # TMDB client
│   └── types/
│       └── content.ts          # TypeScript interfaces
├── supabase/
│   └── migrations/             # DB migration files
├── public/
│   └── brand/                  # SVG logos
├── android/                    # Android Studio project
├── .env.example                # Environment template
└── package.json
```

---

## 🔒 Security Notes

- Video playback URLs are **never exposed client-side** without a signed session token
- Admin routes require authentication and role verification against `admin_users` table
- Payment status is **verified server-side** via webhook — never trusted from frontend
- 18+ content requires **server-side age verification** — never client-only
- All database access uses **Row Level Security** (RLS) policies
- API secrets are **never committed to Git** — use `.env.local`

---

## 📄 Legal

PROZ MOVIE is an original platform. All content on the platform must be:
1. Properly licensed with documented distribution rights
2. Compliant with applicable territory laws
3. Age-classified and access-controlled appropriately

The 18+ section requires legal counsel review before enabling.

---

*PROZ MOVIE v0.01 — YOUR WORLD. YOUR ENTERTAINMENT.*  
*© 2026 PROZ Entertainment Technologies Inc. All rights reserved.*
