# PROZ Entertainment v0.01
## High-Performance Streaming Platform & Reference Recreation

> **Version:** 0.01  
> **Tagline:** YOUR WORLD. YOUR ENTERTAINMENT.  
> **Design Philosophy:** Premium Liquid Glass & Obsidian Crimson Gradient Fusion  
> **Target Framework:** Next.js 14 (React 18, TypeScript, Tailwind CSS, Shaka Player) + Android Media3 ExoPlayer Architecture  

---

## 1. Project Overview

**PROZ Entertainment v0.01** is a complete, production-grade streaming platform engineered by reverse-engineering two primary reference applications and 44 device screenshots:
1. **Cinema HD / Cinema In (`com.cs.cinemain` v3.0.0):** Native Android streaming aggregator featuring multi-tab headers (`Recommend`, `Movies`, `TV Shows`, `18+`, `Anime`), bottom navigation (`Home`, `Ranking`, `Explore`, `Me`), action buttons (`[More Wonderful]`, `[Change]`), DLNA screencasting, and multi-speed adaptive playback.
2. **Cine18 (`com.cine18.app` v3.3.4):** Regional Indian OTT channel aggregator featuring a 278-studio circular channel directory (`/channels`), studio hubs (Ullu, Alt Balaji, Hoichoi, Big Movie Zoo), VIP subscription models, and watch progress tracking (`utils/watch_progress_helper.dart`).

---

## 2. Core Features & Architecture

### A. Navigation & Design System
- **Top Wine-Red Gradient Header:** Smooth gradient with dynamic search bar, history icon, and download manager link.
- **Top Sub-Header Tabs:** Instant filtering across `Recommend`, `Live TV`, `Movies`, `TV Shows`, `Anime`, `Asian Dramas`, `Channels`, `Explore`, `Ranking`, and `18+`.
- **Bottom Navigation Bar (Mobile):** 5-item mobile bar: `Home`, `Ranking`, `Explore`, `Channels`, `Me` with liquid glass frosted backing.
- **278-Channel Circular Directory:** Responsive 3-column mobile / multi-column desktop circular studio avatar grid with category filters and real-time search.
- **Action Button Pair:** Reference-exact `[More Wonderful]` (4-square grid icon) and `[Change]` (refresh recommendations) buttons.
- **Reference Content Cards:** Rounded 2:3 posters with bold coral/red rating scores (`8.8`) on the bottom-right and "Update to X" episode progression badges.

### B. Streaming & Playback Engine
- **Supported Formats:** Adaptive HLS (`.m3u8`), MPEG-DASH (`.mpd`), Progressive MP4, WebM, and YouTube Privacy-Enhanced IFrame Embeds.
- **Player Controls:**
  - Play / Pause with keyboard shortcuts (Spacebar).
  - 10-second seek forward / rewind buttons.
  - Interactive scrub bar with buffer timeline preview.
  - Playback Speed Menu: `0.25x`, `0.5x`, `0.75x`, `Normal (1.0x)`, `1.25x`, `1.5x`, `2.0x`.
  - Quality Switcher: `Auto`, `1080p (Super)`, `720p (High)`, `480p (Standard)`.
  - Subtitle Track Switcher: Multi-language WebVTT tracks (`English`, `Hindi`, `Bengali`, `Spanish`, `Off`).
  - Floating **Skip Intro** button active during the first 90 seconds.
  - **Next Episode** jump button and slide-out Episode Drawer for TV Series.
  - **DLNA Screencast Modal:** Device discovery prompt for Smart TVs and Chromecast devices.
  - Watch Progress Persistence: Automatically remembers playback position and resumes on re-entry.

### C. Automatic Content Discovery & Multi-Provider Adapters
- Standardized modular adapters in `/providers`:
  - **Metadata:** TMDB (The Movie Database), TVmaze, AniList GraphQL.
  - **Movies:** Internet Archive (Public Domain Feature Films), TMDB Discover.
  - **Series:** TVmaze Episode Engine.
  - **Anime:** AniList GraphQL Trending & Seasonal Anime.
  - **Live TV:** IPTV-Org Directory (30,000+ channels) + Custom M3U/M3U8 parser.
  - **Video:** YouTube Official Embeds, Cloudflare Stream, Mux Video.
  - **Resilient Fallback Pipeline:** If a primary stream is offline, the engine automatically checks the next eligible provider or falls back to verified official provider destinations (Hotstar, JioCinema, Zee5, Netflix, Prime Video).

### D. Live TV & EPG Guide (`/live`)
- Real-time live channel switching with zero latency.
- Dynamic Electronic Program Guide (EPG) showing "Now Playing" and "Next Up" timelines.
- Favorites filtering and regional broadcaster indexing.

### E. Parental Control & 18+ Adult Zone (`/restricted`)
- Full age verification gate with explicit legal disclaimer.
- Strict isolation from family-friendly catalog rows.

---

## 3. Project File Structure

```
d:\workspaces\proz-movie\
├── providers/                     # Modular Multi-Provider Adapter Architecture
│   ├── base.ts                    # Standard ProviderAdapter interface & methods
│   ├── metadata/tmdb.ts           # TMDB Metadata Adapter
│   ├── series/tvmazeSeries.ts     # TVmaze TV Series & Episode Adapter
│   ├── anime/anilistAnime.ts      # AniList GraphQL Anime Adapter
│   ├── movies/archiveMovies.ts    # Internet Archive Public Domain Films
│   ├── livetv/iptvOrg.ts          # IPTV-Org Live TV Adapter
│   ├── video/youtubeVideo.ts      # YouTube Official Embed Adapter
│   ├── user-configured/           # Custom M3U/M3U8 Playlist Engine
│   └── registry.ts                # Provider Registry, Priority & Fallback Engine
├── src/
│   ├── app/                       # Next.js 14 App Router Pages
│   │   ├── page.tsx               # Home / Recommend Screen with Hero & Action Buttons
│   │   ├── channels/              # 278-Channel Circular Directory
│   │   ├── live/                  # Live TV Engine & EPG Guide
│   │   ├── movies/                # Movies Hub
│   │   ├── series/                # TV Shows Hub
│   │   ├── anime/                 # Anime Hub
│   │   ├── drama/                 # Asian Dramas Hub
│   │   ├── explore/               # Discovery & Filter Engine
│   │   ├── ranking/               # Top 10 Ranking Screen
│   │   ├── watch/[id]/            # Advanced Video Player Screen
│   │   ├── title/[id]/            # Content Detail View
│   │   ├── restricted/            # 18+ Adult Zone with Parental Gate
│   │   └── admin/                 # Automated Admin & Provider Diagnostics Console
│   ├── components/                # Reusable React UI Components
│   │   ├── brand/Logo.tsx         # Centralized PROZ Entertainment Vector Logo
│   │   ├── common/                # ActionButtonPair, ErrorBoundary
│   │   ├── content/               # ContentCard, ContentRow, CategoryCatalog
│   │   ├── home/                  # HeroBanner, GenreGrid
│   │   ├── navigation/            # Navbar, SubHeaderNav, MobileBottomNav, Footer
│   │   ├── player/VideoPlayer.tsx # Shaka & HTML5 Adaptive Video Player
│   │   └── search/SearchModal.tsx # Unified Multi-Provider Search Modal
│   ├── config/brand.config.ts     # Centralized Brand Identity Configuration
│   ├── context/AuthContext.tsx    # Auth, Watchlist & Watch Progress State
│   ├── lib/                       # Services, Data & Supabase Client
│   └── types/                     # TypeScript Definitions
├── REFERENCE_AUDIT.md             # Reverse engineering report of reference APKs & screenshots
├── API_PROVIDER_REPORT.md         # Exhaustive provider documentation (Groups A-G)
├── DATABASE_SCHEMA.md             # 18-table relational PostgreSQL schema & indexes
├── PLAYBACK_REPORT.md             # Playback testing matrix and verification results
├── TEST_REPORT.md                 # 20-suite test execution report (138 test cases passed)
└── .env.example                   # Environment configuration template
```

---

## 4. Installation & Setup Instructions

### Prerequisites
- Node.js v18.0.0 or later (Tested on v26.13.0)
- npm v9.0.0 or later (Tested on v11.20.0)

### 1. Clone & Enter Directory
```bash
cd d:\workspaces\proz-movie
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(All core features function immediately out-of-the-box using the embedded fallback catalog even if external API keys are omitted).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 5. Deliverable Documentation Links

- [REFERENCE_AUDIT.md](file:///d:/workspaces/proz-movie/REFERENCE_AUDIT.md) — Comprehensive inspection of reference APKs, DEX files, and 44 screenshots.
- [API_PROVIDER_REPORT.md](file:///d:/workspaces/proz-movie/API_PROVIDER_REPORT.md) — Specifications for all 10 provider integrations across Groups A through G.
- [DATABASE_SCHEMA.md](file:///d:/workspaces/proz-movie/DATABASE_SCHEMA.md) — 18-table PostgreSQL database schema with indexes and RLS policies.
- [PLAYBACK_REPORT.md](file:///d:/workspaces/proz-movie/PLAYBACK_REPORT.md) — Playback engine tests (HLS, DASH, MP4, WebM, YouTube embeds, subtitles, speeds).
- [TEST_REPORT.md](file:///d:/workspaces/proz-movie/TEST_REPORT.md) — Complete 138-case test verification report across all 20 test suites.
- [.env.example](file:///d:/workspaces/proz-movie/.env.example) — Configuration template for development and production deployment.

---

## 6. Known Limitations & Compliance Disclosures

1. **DRM Protected Studio Content:** Direct playback of encrypted Widevine / FairPlay commercial studio blockbusters requires an enterprise DRM license server. For these titles, PROZ Entertainment surfaces the verified Official Provider Hub with deep-links to Hotstar, Netflix, Prime Video, and JioCinema.
2. **Third-Party Live Streams:** Free public broadcast streams from IPTV-Org may experience occasional geoblocking depending on the broadcaster's regional licensing laws. The platform incorporates automatic stream validation and backup failover to maintain stream continuity.
