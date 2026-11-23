# CHANGELOG — PROZ MOVIE

All notable changes to the PROZ MOVIE OTT platform are documented in this file.

---

## [0.02.0] — 2026-11-23

### Major New Capabilities & Architecture
- **Stash GraphQL Private Library Integration:**
  - Full adapter for self-hosted Stash instances (`src/lib/providers/stash.ts`) adhering to the official Stash GraphQL schema.
  - Multi-server federation supporting multiple Stash instances (`library_servers`, `media_libraries`).
  - Architecture inspired by Peek Stash Browser (MIT License), maintaining clean attribution and modular separation.
  - Server-side credentials protection: Stash server URLs, internal IP addresses, and API keys are strictly kept server-side and never exposed to the client.
  - Secure chunked stream proxy (`/api/library/stash/proxy-stream`) supporting range requests (HTTP 206) for scrubbing in HTML5 / Shaka Player.
- **Restricted 18+ Adult Ecosystem Overhaul:**
  - Dedicated private adult media environment at `/restricted`.
  - Comprehensive catalog: Scenes, Performers, Studios, Categories, Tags, and High-Resolution Galleries.
  - Strict age-verification gate requiring birth-year verification (18+) before any adult media or previews are rendered.
  - Zero tolerance for unverified, non-consensual, or prohibited material.
- **Multi-User & Permission Engine:**
  - Extended role hierarchy: `super_admin`, `admin`, `moderator`, `premium_user`, `standard_user`, `restricted_user`.
  - Group-level and user-level permissions (`user_groups`, `group_members`, `library_permissions`, `collection_restrictions`).
  - Server-side permission enforcement (`src/lib/auth/permissions.ts`) denying access by default.
- **Personal Data & Media Organization:**
  - Independent ratings, favourites, watch history, resume points, and hidden items per user.
  - Custom private playlists (`src/app/library/playlists/page.tsx`) with shuffle, repeat, and group sharing.
  - Chronological media timeline (`src/app/timeline/page.tsx`).
- **Authorized Legal P2P & Torrent Adapter:**
  - Strict allowlist registry (`src/lib/providers/torrent.ts`) for Public Domain (Internet Archive), Creative Commons (Blender Foundation Open Movies), and verified rights-holder feeds.
  - Prohibits all commercial piracy scrapers, unverified trackers, or DRM bypass tools.
- **Download Manager:**
  - Queue management at `/library/downloads` with progress indicators, pause/resume, cancellation, and storage quota limits.
- **TV 10-Foot Mode:**
  - Remote and keyboard-navigable fullscreen interface at `/tv` with large cards and auto-advance queue.
- **Admin Hub Expansion:**
  - New admin modules for Stash Server Management, Legal P2P Sources Registry, and User Accounts & Permission Boundaries.
- **Database Migrations:**
  - PostgreSQL schema migration (`supabase/migrations/20261123_v002_complete_schema.sql`) introducing 23 new tables with Row-Level Security (RLS) policies.
- **In-App Release Notes & Updates:**
  - Dedicated `/updates` view detailing what's new in v0.02.

---

## [0.01.0] — 2026-11-18

### Initial Production Release
- Multi-provider content discovery with 9 adapters: TMDB, AniList (GraphQL), TVmaze (REST), Watchmode (IN priority), JustWatch, YouTube Data API, Internet Archive, Cloudflare Stream, Mux.
- Upgraded 3-mode video player (Direct HLS/DASH Shaka Player, YouTube IFrame Player, Official Provider Streaming Hub).
- Complete 278-channel directory and Live TV guide (`/channels`, `/live`) with EPG schedules and deep links.
- Admin dashboard overhaul removing manual video uploads in favor of automated synchronization.
- Initial 18-table Supabase database schema with RLS.
