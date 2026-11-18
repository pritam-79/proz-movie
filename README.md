# PROZ MOVIE v0.01 — YOUR WORLD. YOUR ENTERTAINMENT.

A production-oriented, premium OTT streaming web platform inspired by Cinema v3.0.0, Netflix, and Prime Video, built with Next.js 14 App Router, TypeScript, Tailwind CSS, Shaka Player, and multi-provider automated content discovery.

---

## 🌐 Live Deployments & Repository

- **Production URL:** [https://proz-movie.vercel.app](https://proz-movie.vercel.app)
- **GitHub Repository:** [https://github.com/pritam-79/proz-movie](https://github.com/pritam-79/proz-movie)
- **Status & Compliance Report:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## ✨ Features & Architecture

### 1. Zero Manual Uploads & Universal Provider Adapters
Manual file and personal video uploads are completely deprecated. Catalog harvesting and playback authorization are handled dynamically through 9 standardized provider adapters:
- **TMDB:** Movies, TV series, episodes, backdrops, cast & crew, trending and watch providers.
- **AniList (GraphQL):** Direct, no-auth catalog integration for live trending and popular anime.
- **TVmaze (REST):** Public television series schedule, cast, and episode guide.
- **Internet Archive:** Authorized public domain cinema with direct playable MP4 streams.
- **YouTube Data API v3:** Licensed documentaries, creator full movies, and official trailers.
- **Watchmode:** Regional streaming availability and deep-linking (India region prioritized by default).
- **JustWatch:** Enterprise partner interface specifications (no scrapers).
- **Cloudflare Stream:** Direct tokenized HLS video delivery adapter.
- **Mux Video:** Tokenized HLS playback adapter.

### 2. Upgraded 3-Mode Video Player
Built on top of Google's Shaka Player with automatic stream detection and responsive fallbacks:
1. **Direct Stream (Shaka Player / HTML5 MP4):** Adaptive HLS/DASH playback for public domain and licensed streams.
2. **YouTube Player:** Embedded playback with privacy mode enabled (`youtube-nocookie.com`).
3. **Official Provider Streaming Hub:** Direct deep links to authorized regional streaming providers (Netflix, Prime Video, Disney+ Hotstar, JioCinema, Zee5, etc.).

### 3. Complete 278-Channel Directory & Live TV Guide
- **All Channels (`/channels`):** 3-column circular avatar grid on mobile and responsive desktop layout. Filterable by News, Sports, Entertainment, Kids, Movies, and Music.
- **Channel Detail (`/channels/[id]`):** Verified broadcaster links, Android package launch intents, and integration status chips.
- **Live TV (`/live`):** Live broadcaster stream player with an Electronic Program Guide (EPG) showing "Now Playing" and "Next Up".

### 4. Complete Application Navigation
- **Home (`/`):** Dynamic featured carousel, trending row, Bollywood, Hollywood, South Indian, Anime, and Dramas.
- **Movies (`/movies`):** Dedicated movies catalog with regional and international filters.
- **TV Series (`/series`):** Complete series catalog with season and episode selectors.
- **Anime Hub (`/anime`):** Powered by the live AniList GraphQL API.
- **Asian Dramas (`/drama`):** Korean, Chinese, Japanese, and Thai drama collections.
- **Explore (`/explore`):** Dynamic multi-category browsing.
- **Ranking (`/ranking`):** Top 10 trending and critically acclaimed leaderboard.
- **Adult Zone (`/adult`):** Age-restricted zone protected by a legal birth-year verification gate.
- **Automated Admin (`/admin`):** Real-time provider health dashboard, sync trigger console, and availability query tool.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/pritam-79/proz-movie.git
cd proz-movie

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment template and populate your keys:

```bash
cp .env.example .env.local
```

Essential variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Provider Credentials
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_v3
WATCHMODE_API_KEY=your_watchmode_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Video Hosting Adapters
CLOUDFLARE_STREAM_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_STREAM_API_TOKEN=your_cloudflare_stream_token
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

### Running Locally

```bash
# Start development server
npm run dev

# Run production build
npm run build
npm run start
```

---

## 🗄️ Database Setup (Supabase)

Run the consolidated PostgreSQL migration located at:
`supabase/migrations/20261118_v001_complete_schema.sql`

This creates:
- 18 core tables (`profiles`, `titles`, `external_title_ids`, `genres`, `seasons`, `episodes`, `content_providers`, `content_rights`, `playback_assets`, `watchlist`, `watch_history`, `playback_sessions`, `subscriptions`, `sync_jobs`, etc.)
- Full Row-Level Security (RLS) policies protecting user data and private assets
- Automatic `updated_at` triggers and performance indices

---

## 📜 Legal & Compliance Notice

PROZ MOVIE is committed to authorized and compliant media delivery:
- No pirated third-party scrapers or unverified video hosting domains are used.
- Metadata is attributed in compliance with TMDB, AniList, and TVmaze API terms of use.
- Direct playback is restricted to public-domain creative commons content, official YouTube embeds, and user-configured Cloudflare/Mux video hosts.
- Premium commercial content links to official licensed OTT destinations.

---

## 📄 License

Proprietary — Developed for PROZ MOVIE OTT Platform.
