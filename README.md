# PROZ ENTERTAINMENT v0.09.02 — YOUR WORLD. YOUR ENTERTAINMENT.

A production-grade, authorized OTT streaming platform combined with a private, federated multi-user media library and restricted 18+ ecosystem inspired by the open-source **Peek Stash Browser** architecture.

Built with **Next.js 14 App Router**, TypeScript, Tailwind CSS, Google Shaka Player, Stash GraphQL, and Supabase.

---

## 🌐 Live Deployments & Repository

- **Production URL:** [https://proz-movie.vercel.app](https://proz-movie.vercel.app)
- **GitHub Repository:** [https://github.com/pritam-79/proz-movie](https://github.com/pritam-79/proz-movie)
- **Implementation Architecture:** [V0.02_IMPLEMENTATION.md](./V0.02_IMPLEMENTATION.md)
- **Status & Compliance Matrix:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## ✨ What's New in v0.02

### 1. Private Multi-User Media Library (`/library`)
- **Stash GraphQL Engine:** Native connector for one or multiple self-hosted Stash instances via official GraphQL queries.
- **Multiple Views:** Grid view, Compact grid, List view, and Gallery view with multi-faceted filtering (Studio, Performer, Tags, Duration, Rating).
- **Secure Chunked Proxy:** Video chunks and seeking (HTTP 206) are served through `/api/library/stash/proxy-stream`, completely masking internal server IPs and API keys.
- **Playlists Manager (`/library/playlists`):** Create, reorder, play, shuffle, and share playlists with user groups.
- **Download Manager (`/library/downloads`):** Queue, pause, resume, cancel, and track storage quotas for authorized offline viewing.
- **10-Foot TV Mode (`/tv`):** Remote and keyboard-friendly navigation (`←`, `→`, `Enter`) with oversized media cards.
- **Media Timeline (`/timeline`):** Chronological activity feeds and watch progress history.

### 2. Restricted 18+ Adult Ecosystem (`/restricted`)
- **Strict Age Verification:** Statutory birth-year gate (18+) required before displaying any adult media, thumbnails, or previews.
- **Peek Stash Browser Integration:** Scenes, Performers, Studios, Categories, Tags, and High-Resolution Photo Galleries.
- **Zero Illicit Content:** Strictly limited to authorized personal Stash repositories and licensed distributor feeds.

### 3. Multi-User & Group Permissions
- **6 Tiered Roles:** `super_admin`, `admin`, `moderator`, `premium_user`, `standard_user`, `restricted_user`.
- **Denied by Default:** Server-side validation on every media request (`src/lib/auth/permissions.ts`).
- **Group Restrictions:** Admin-managed permissions for library access, adult viewing, and download quotas.

### 4. Authorized Legal P2P & Torrent Module
- **Allowlisted Registry Only:** Internet Archive Public Domain feature films, Blender Foundation Open Movies (Tears of Steel, Sintel, etc.), and Wikimedia Commons feeds.
- **Anti-Piracy Guardrails:** Commercial piracy scraping, unverified torrent indices, and DRM bypassing are strictly prohibited and blocked.

### 5. Preserved v0.01 Main OTT Platform
- **Movies & Web Series:** Bollywood, Hollywood, South Indian, Asian Dramas (K-Drama, C-Drama), and International Cinema.
- **Anime Hub:** Live AniList GraphQL streaming discovery.
- **278-Channel Directory & Live TV:** Circular logo grid, official broadcaster intents, and EPG schedules.
- **3-Mode Video Player:** Adaptive HLS/DASH (Shaka Player), Direct MP4, YouTube IFrame, and Official Streaming Hub.

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

# Run local development server
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Environment Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

```env
# Supabase Backend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Provider Credentials
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_v3
WATCHMODE_API_KEY=your_watchmode_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Stash Server (Kept Strictly Server-Side)
STASH_SERVER_URL=http://localhost:9999/graphql
STASH_API_KEY=your_stash_api_key

# Video Hosting Adapters
CLOUDFLARE_STREAM_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_STREAM_API_TOKEN=your_cloudflare_stream_token
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

---

## 🗄️ Database Setup (Supabase)

Run the v0.02 migration script:
`supabase/migrations/20261123_v002_complete_schema.sql`

This establishes the 23 relational tables and RLS security policies for federated Stash servers, media items, user groups, playlists, downloads, and legal P2P sources.

---

## 📄 License

Proprietary — Developed for PROZ MOVIE OTT Platform.
Peek Stash Browser architecture patterns referenced under the MIT License.

