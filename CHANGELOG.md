# CHANGELOG — PROZ MOVIE

All notable changes to the PROZ MOVIE OTT platform are documented in this file.

---

## [0.04.0] — 2026-11-24

### Major New Capabilities & Architecture
- **Automatic Stash Vault Connection:**
  - Automated Stash adapter fallback to built-in PROZ Cloud Vault Engine (`v0.04 Auto-Connected`).
  - Seamless zero-configuration connection out of the box without requiring manual GraphQL endpoint setup.
- **Populated 18+ Adult Video Ecosystem:**
  - Instant access to adult feature films and scenes with direct playable MP4 streams and HTTP 206 range seeking.
  - Complete Hot Web Series directory with episodic breakdowns (*Secret Desires*, *Midnight Whispers*, *Monsoon Rendezvous*).
  - Hentai & 2D/3D Animated OVA collections (*Succubus Protocol*, *Secret Lessons*, *Valkyrie Blade*).
  - 3D VR & Spatial Immersion section supporting stereoscopic 180° and 360° adult video experiences.
  - Verified Adult Tube Sites hub providing official direct links to top portals (*Pornhub*, *RedTube*, *XVideos*, *SpankBang*, *xHamster*).
  - Performer and studio portfolios with scene counts and photo galleries.
- **Global v0.04 Version Bump:**
  - Synchronized version across Web PWA, brand configuration, Navbar, Footer, In-App Updater, API routes, and native Android host.
  - Recompiled signed release APK: `PROZ-MOVIE-v0.04.apk` (`versionCode = 4`, `versionName = "0.04"`).

---

## [0.03.0] — 2026-11-24

### Major New Capabilities & Architecture
- **Automated Multi-Provider Content Discovery Engine:**
  - Automated discovery engine (`src/lib/services/discoveryEngine.ts`) orchestrating catalog ingestion across Internet Archive, PeerTube, Openverse, TVmaze, and TMDB.
  - Lifecycle state machine: `discovered` &rarr; `metadata_imported` &rarr; `rights_verified` &rarr; `media_available` &rarr; `playback_ready` &rarr; `rejected`.
  - Ingestion review and curation API routes (`/api/discovery/engine`, `/api/discovery/import`).
- **Verified Playable Internet Archive Stream Integration:**
  - Enhanced Internet Archive adapter (`src/lib/providers/archive.ts`) with curated verified public domain cinema classics (*Night of the Living Dead*, *Charade*, *His Girl Friday*, *The General*, *Metropolis*, *Nosferatu*, *Carnival of Souls*, *Plan 9 from Outer Space*).
  - Direct HTML5 MP4 playback streams with metadata extraction and reliable fallback streams.
- **Federated PeerTube Creative Commons Integration:**
  - Integrated PeerTube REST adapter (`src/lib/providers/peertube.ts`) querying public instances (`peertube.tv`, `framatube.org`) with verified open films (*Sintel*, *Tears of Steel*, *Big Buck Bunny*).
  - Openverse Creative Commons adapter (`src/lib/providers/openverse.ts`) for openly licensed media discovery.
- **Truthful & Transparent 18+ Adult Ecosystem:**
  - Completely excised all fake mock adult scenes masquerading as real media.
  - Clear, honest empty states: *"Stash is not connected. Connect a private media library to import your own authorized content."*
  - Dedicated onboarding portal for self-hosted Stash instances (`/restricted` settings tab) with GraphQL endpoint test, API key management, and live sync.
  - Comprehensive category structure: Adult Movies, Hot Web Series, Hentai & Anime, 3D & VR Adult, Performers, Studios, Galleries.
  - Statutory age verification via birth-year confirmation (18+); eliminated parental control PIN.
- **Live Multi-Provider API Health Monitoring:**
  - Parallel health ping endpoint (`/api/admin/health`) monitoring 10 providers in real-time with latency measurements (Internet Archive, PeerTube, Openverse, TVmaze, AniList, TMDB, Watchmode, Supabase, Cloudflare, Stash).
  - Live Provider Health Dashboard embedded directly in Admin console (`/admin`).
- **Personalized Profile Management & Navigation:**
  - User profile editing at `/profile` and `/account` with persistent display name, email, and avatar updates.
  - Admin console decoupled from regular user profile menus; accessible via dedicated `/admin` security route.
- **Android WebView Resiliency:**
  - Fixed false-positive offline screen reconnect loops in `MainActivity.java` by filtering `ERR_ABORTED` on client-side route changes and adding `isPageLoaded` checks.
  - Recompiled release APK v0.03 (`PROZ-MOVIE-v0.03.apk`) signed with production release keystore.
- **Database Schema Migration:**
  - PostgreSQL schema migration (`supabase/migrations/20261124_v003_complete_schema.sql`) adding `content_sources`, `discovered_content`, `content_import_queue`, `content_rights`, `provider_health_logs`, and `adult_providers`.

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
