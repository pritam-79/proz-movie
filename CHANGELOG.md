# CHANGELOG — PROZ ENTERTAINMENT

All notable changes to the PROZ Entertainment OTT & Stash platform are documented in this file.

---

## [0.09.1] — 2026-11-26

### Real Cine18 OTT Catalog, StashDB VR/Hentai/Performers, Dedup Continue Watching & Gallery Categories

- **Real Cine18 Hot Web Series Catalog:** Hot Web Series section now fetches live series from Cine18 API (Ullu, Alt Balaji, Kooku, Neon, MxPlayer, Primeshots, etc.) — zero fake/hardcoded placeholder cards remain.
- **SeriesDetailModal Live Episodes:** Series detail modal now fetches real live episodes from `/user/video-card/${uid}` endpoint on demand; removed hardcoded fake episode list.
- **StashDB VR Section — Real Data:** 3D VR section now pulls genuine StashDB VR scenes (39k+) with format filter buttons (All/180°/360°/Positional/180° SBS). No more Ullu redirects.
- **StashDB Hentai Section — Real Data:** Hentai section shows real StashDB hentai (1,639+) & 3D CGI (15k+) with correct subcategory filters (Playable Adult Animation/Hentai OVAs/3D CGI/VR Hentai).
- **Genuine Performer Profiles:** Performers Directory shows real pornstars with gender filter pills (Female/Male/Trans/All) and Load More pagination.
- **Deduplicated Continue Watching:** Each scene now appears once at the highest saved progress — eliminates the "Resume 0m + Resume 1m" duplicate bug.
- **Adult Photo Galleries Live:** Photo Galleries now fetches real gallery data with category filter pills (All/Portrait Sets/Scene Stills/Hentai & Anime CG/VR & 3D Stills).
- **Tube Hub Expanded to 24 Portals:** Tube Hub now lists 24 categorized portals with filter buttons (Free Tube/Premium/Niche/Regional/VR).
- **StashDB Panel Improvements:** Always-visible tag chips (All Scenes/VR 39k+/3D 15k+/Hentai 1,639+), gender filter, Retry on error, explicit error messages.
- **Studios Metadata Toggle:** Metadata-only toggle to browse community-indexed studios alongside playable ones.
- **referrerPolicy Fix:** All thumbnail images use `referrerPolicy="no-referrer"` preventing hotlink blocks from StashDB, Cine18 & CDNs.
- **New Backend API Routes:** `/api/library/stash/series`, `/api/library/stash/vr`, `/api/library/stash/hentai` created with `force-dynamic` to prevent stale static caching.
- **Version Bump:** `versionCode = 10`, `versionName = "0.09.1"` across Next.js, Android Gradle, and MainActivity.

---

## [0.09.0] — 2026-11-26

### Critical Player Overlay Fix, Auto Stash Backend, PRO 18+ Ecosystem & Persistent Updater
- **Fixed Critical Video Player UI Overlap:**
  - Isolated `/watch/*` inside `AppChrome` so global `Navbar`, `Footer`, `MobileBottomNav`, and `InAppUpdater` top banners never overlap active video playback.
  - Refactored `VideoPlayer.tsx` to use a clean docked top header above the `16:9` viewport (`safe-area-inset-top`/`bottom`), fixed mobile collisions, eliminated duplicated overlays on embeds, removed mock Cast TV dialogs, added Picture-in-Picture (`PiP`), real stream resolution detection, Shaka audio/quality/subtitle track controls, optional VR pan/gyroscope mode (only when item metadata marks VR), and strict `onPlaying`-only playing state.
  - Cleared mismatched demo placeholder streams (`tears-of-steel` / `x36xhzz` / `BigBuckBunny_124`) from unrelated catalog entries including *Demon Slayer* (`proz-ani-016`), keeping trailer/provider playback cleanly in-app without external redirects.
- **Automatic Stash & StashDB Backend Service (`stashService.ts`):**
  - Consolidated StashDB GraphQL, personal Stash GraphQL, and authorized Cine18 channels behind automatic server-side environment auth (`STASHDB_ENDPOINT`, `STASHDB_API_KEY`, optional `STASH_SERVER_URL`).
  - Removed all manual GraphQL endpoint/key settings forms and browser `localStorage` credential storage; strictly enforces `isPlayable` media file matching before showing Play actions on StashDB entries.
- **Organized PRO 18+ Ecosystem Inside Gallery & Restricted Zone (`/library` & `/restricted`):**
  - Added Recent Uploads (adult photo galleries, videos, collections), Studio & Performer profile modals, Tube Hub with explicit limitation notices, 3D VR SBS/360° viewer, Hentai & 3D subcategories, Hot Web Series details with season/episode progress, Continue Watching/Favorites, and metadata-driven Recommendations.
- **Consistent v0.09 Versioning & Fixed Update Popup:**
  - Updated `package.json`, `brand.config.ts`, `/about`, `/account`, `/updates`, `/api/app/update`, `/api/download/apk`, `manifest.webmanifest`, Android Gradle (`versionCode = 9`, `versionName = "0.09"`), and `MainActivity.java`.
  - Fixed `InAppUpdater.tsx` so popups appear only when a genuinely newer version exists and dismissed alerts stay dismissed across restarts.

---

## [0.08.0] — 2026-11-26

### Playback Repairs, Channel .ts Support, StashDB GraphQL Integration & Mobile UI Redesign
- **Fixed Movie & Anime Single-Trailer & Fallback Bug:**
  - Updated `VideoPlayer.tsx` so commercial movies & anime with unique official `youtubeId` trailers no longer get overridden by the 3 shared sample loops (`tears-of-steel` / `x36xhzz` / `BigBuckBunny_124`).
  - Added `/api/catalog/resolve-title` supporting live resolution for dynamic `anilist-*`, `kitsu-*`, `tvmaze-*`, `tmdb-*`, and `cine18-*` IDs inside `/title/[id]` and `/watch/[id]` (fixing the bug where every clicked anime opened *Deadpool & Wolverine*).
  - Corrected *Solo Leveling: Reawakening* trailer mapping (`HkIKAnwLZCw`).
- **Repaired All Channel Playback Streams:**
  - Installed `mpegts.js` and added MPEG-TS (`.ts`) MSE playback support in `VideoPlayer.tsx` plus safe CDN range proxy (`/api/library/stream-proxy`) fallback for cross-origin/special-character URLs.
  - Added safe URL encoding (`normalizeCdnStreamUrl`), `12s` retry fetches, in-memory detail caches, fuzzy channel name matching, and category partner fallbacks in `cine18.ts` and `/api/channels/[id]/videos`.
- **Integrated StashDB GraphQL & Fixed Stash Streams:**
  - Built `src/lib/providers/stashdb.ts` and `/api/library/stash/stashdb` (configured securely via untracked `.env.local` / runtime user settings, never hardcoded in git) plus `StashDbPanel.tsx` integrated in `/library` and `/restricted`.
  - Replaced dead HTTP 403 `commondatastorage.googleapis.com` links in `/api/library/stash/proxy-stream` with live CineWebby CDN & verified fallback `.mp4` range streaming.
- **Mobile WebView Layout Fixes & Aesthetic Redesign:**
  - Fixed sticky `Navbar` / `SubHeaderNav` overlap on narrow Android viewports, normalized top/bottom page clearance, upgraded `HeroBanner` and `PopularChannelsRow` (real channel logos), replaced bottom/sub-nav hub link with `Stash`, and removed the unwanted homepage demo block (`NewCatalogShowcase`).
- **v0.08 Update Information Popup & Full Version Sync:**
  - `InAppUpdater.tsx` now pops up an informative "What's New in v0.08" dialog automatically once per release (or immediately for older APK builds) with APK download and changelog details.
  - Synchronized `v0.08` (`versionCode = 8`) across Next.js, Android `MainActivity.java`, Gradle, updater routes, and `PROZ-MOVIE-v0.08.apk`.

---

## [0.07.0] — 2026-11-24

### Additive Multi-Provider OTT Hub, Cross-Source Deduplication & Open Media Expansion (All v0.06 Work Preserved)
- **New Documented Public & Open-Media Adapters (`src/lib/providers/`):**
  - Added **Kitsu Anime Directory Adapter** (`kitsu.ts`) supporting Anime Movies, TV, OVA/ONA, and trailer extraction.
  - Added **NASA Public Domain Video Adapter** (`nasa.ts`) with dynamic HTTPS MP4 stream resolution (`images-api.nasa.gov`).
  - Added **Wikimedia Commons Video Adapter** (`wikimedia.ts`) indexing Creative Commons & Public Domain films.
  - Added **IPTV-Org Live HLS Adapter** (`iptvLive.ts`) caching and filtering verified HTTPS `.m3u8` public broadcasts across categories.
  - Added **Expanded Open Cinema Resolver** (`archiveExpanded.ts`) resolving real Archive.org `.mp4` metadata filenames and PeerTube HLS/MP4 videos (`framatube.org`), eliminating trailer-only confusion for open films.
  - Added **Authorized DRM Configuration Registry** (`drmConfig.ts`) supporting Widevine, ClearKey, FairPlay, and PlayReady standards + official Shaka reference test vectors.
- **Cross-Provider Comparison & Deduplication (`src/lib/services/catalogDeduplicator.ts`):**
  - Canonical title/year/stream-URL deduplication merges duplicate entries across providers, retains the highest playability rank (`Full Playable > Live HLS > DRM > Trailer > Catalog`), and surfaces live deduplication stats.
- **Modern Categorized OTT Hub (`/ott-hub` + `/api/v07/*` + `<NewCatalogShowcase />`):**
  - Built `/ott-hub` with master category tabs, sub-category chips, **Direct Playable Only** toggle, inline `OttQuickPlayerModal` (Shaka HLS/DASH/DRM + MP4 + YouTube no-cookie), and an authorized BYO stream/license testing panel.
  - Appended `<NewCatalogShowcase />` cleanly to the homepage and added `OTT Hub (v0.07)` navigation links without altering previous v0.01–v0.06 components or content.
- **Global v0.07 Release Synchronization:**
  - Updated `package.json` (`0.07.0`), `brand.config.ts` (`v0.07`, `versionCode: 7`), `android/app/build.gradle.kts` (`versionCode = 7`, `versionName = "0.07"`), updater APIs, APK download route, and release binary `PROZ-MOVIE-v0.07.apk`.

---

## [0.06.0] — 2026-11-24

### Reference Analysis, Playback Engine Repair & API/DRM Integration
- **Centralized Video Player Repair:**
  - Resolved infinite "Buffering stream..." spinner and 00:00 duration freeze caused by missing `onLoadedMetadata`, `onCanPlay`, and paused video states.
  - Added autoplay initialization with graceful failure handling for browser autoplay policies.
  - Implemented prominent interactive Play Button overlay when video is paused, preventing confusion.
  - Enabled responsive duration tracking that immediately displays actual runtime once stream metadata is received.
- **Movie & Channel Playback Stream Resolution:**
  - Diagnosed and repaired 132 broken sample URLs (`commondatastorage.googleapis.com`) returning HTTP 403 Forbidden.
  - Replaced dead endpoints with high-bitrate adaptive streams: Mux multi-bitrate HLS (`test-streams.mux.dev`), Unified Streaming multi-audio HLS (`demo.unified-streaming.com`), Google Shaka DASH (`storage.googleapis.com/shaka-demo-assets`), and Internet Archive high-speed MP4 (`archive.org`).
  - Integrated dynamic resolution on Title and Watch pages: clicking any Cine18 channel title (`cine18-`) loads genuine video details, episode lists, and playable CDN streams (`cdn.siincere.com`) instead of defaulting to Deadpool & Wolverine.
- **Authorized DRM Architecture & Implementation:**
  - Integrated Google Shaka Player with EME (Encrypted Media Extensions) key system configurations.
  - Supported Widevine Modular DRM (`com.widevine.alpha`) with configurable license server URI.
  - Added W3C ClearKey (`org.w3.clearkey`) key management for open-standard DRM testing.
  - Built automatic DRM license acquisition fallback to direct clear stream if license acquisition is unauthorized or unavailable.
- **Suppressed Intrusive Update Banners:**
  - Fixed hardcoded version comparison bug in `src/components/common/InAppUpdater.tsx` where `data.latestVersionCode > 1` caused update banners to re-appear on every page reload.
  - Connected updater to centralized `brandConfig.version` (`0.06`), ensuring persistent banners are suppressed once on the current build.
- **Complete Android Manifest Permissions:**
  - Expanded `android/app/src/main/AndroidManifest.xml` based on reference specifications from Cinema HD and Cine18 APKs: added `ACCESS_WIFI_STATE`, `FOREGROUND_SERVICE`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`, `READ_MEDIA_IMAGES`, `POST_NOTIFICATIONS`, and `WAKE_LOCK`.
- **Global v0.06 Release & Synchronization:**
  - Updated `package.json` to `0.06.0`.
  - Updated `brandConfig.version` to `v0.06` (`versionCode: 6`).
  - Updated `android/app/build.gradle.kts` to `versionCode = 6`, `versionName = "0.06"`.
  - Updated `api/app/update` endpoint and UI labels to `v0.06`.
  - Recompiled signed production APK `PROZ-MOVIE-v0.06.apk`.

---

## [0.05.0] — 2026-11-24

### Major System Repair & Backend Integration (Audit of bugs.pdf)
- **Live Cine18 / CineWebby API Integration:**
  - Extracted production endpoints from decompiled reference APK: base `https://server.cinewebby.com/api`, channels `api/user/channel/all`, video filtering `api/user/channel/{uid}`, video details `api/user/video-card/{uid}`, banners `api/user/banners`, and sections `api/user/section`.
  - Created robust `Cine18Adapter` (`src/lib/providers/cine18.ts`) registered in universal `ProviderRegistry`.
  - Connected 329+ live OTT channels and hundreds of web series, movies, and scenes with high-speed CDN stream links (`https://cdn.siincere.com/`) and verified image covers (`https://images.cinewebby.com/`).
- **Channel Pages & Authentic Content Alignment:**
  - Repaired `src/app/channels/[id]/page.tsx` and created dedicated backend route `/api/channels/[id]/videos`.
  - Replaced arbitrary Hollywood fallback content ("The Boys", "Deadpool", "Dune") with authentic channel video catalogs for Alt Balaji (`r33w`), Bharti Jha (`v35i`), New Sensations (`m67a`), Family XXX (`f94s`), Ullu (`z62v`), and Desiflix (`j35w`).
  - Enriched 237 channels in `src/lib/data/channelsData.ts` with authentic Cine18 logos, banners, and channel UIDs.
- **Robust Image Error Fallbacks:**
  - Added stateful `onError` fallback handlers in `src/components/content/ContentCard.tsx` and `src/app/channels/page.tsx` (ChannelAvatarItem).
  - Eliminated all broken image icons, missing cover boxes, and raw alt-text displays; replaced with stylized cinematic gradients, category badges, and play icons.
- **Truthful Personal Stash Server Status:**
  - Completely removed false "Auto-Connected" claims when no private server is configured.
  - Truthfully displays: *"Not Connected — Connect a Stash Server to Use This Feature"* with an explicit configuration interface for self-hosted GraphQL instances.
- **Enhanced 18+ Section Streaming Ecosystem:**
  - Populated 18+ section with real, playable adult web series and movies via `/api/library/adult-content` querying Ullu, Bharti Jha, New Sensations, and Family XXX.
  - Implemented direct playback authorization for `cine18-` streams in `/api/playback/authorize` and `/watch/[id]`.
- **Realistic 3D VR Playback:**
  - Removed exaggerated marketing claims (60 FPS, binaural audio, spatial head-tracking).
  - Replaced with realistic Stereoscopic 180° / 360° Side-by-Side format notices with WebXR, Meta Quest, and Cardboard headset support.
- **UI Overlapping & Layout Clearance:**
  - Permanently removed intrusive floating version badge (`v0.04 NEW` pill in `src/components/common/InAppUpdater.tsx`) that obstructed navigation buttons and channel cards on every screen (PDF pages 1–16).
  - Added safe bottom viewport padding (`pb-28`) to channel pages, channel detail views, and restricted 18+ sections to prevent collision with mobile bottom navigation.
- **Global v0.05 Version Bump & Android Build:**
  - Synchronized `v0.05` across `package.json`, `brand.config.ts`, `build.gradle.kts`, `InAppUpdater.tsx`, updates page, API update endpoint, and navigation headers.
  - Recompiled signed release APK: `PROZ-MOVIE-v0.05.apk` (`versionCode = 5`, `versionName = "0.05"`).

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
