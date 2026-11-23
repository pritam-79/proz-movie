# PROZ MOVIE v0.02 — Implementation Status & Architecture Report

**Platform Identity:** PROZ MOVIE  
**Version:** v0.02  
**Tagline:** YOUR WORLD. YOUR ENTERTAINMENT.  
**Design System:** Premium Liquid Glass (Midnight `#080B12`, Deep Navy `#111827`, Electric Purple `#8B5CF6`, Neon Cyan `#22D3EE`, Soft White `#F8FAFC`)  
**Last Updated:** November 2026  
**Repository:** [github.com/pritam-79/proz-movie](https://github.com/pritam-79/proz-movie)  
**Live Production URL:** [proz-movie.vercel.app](https://proz-movie.vercel.app)

---

## 1. Executive Summary

PROZ MOVIE v0.02 elevates the production OTT platform with a private, federated multi-user media library and restricted 18+ ecosystem inspired by the open-source **Peek Stash Browser** architecture.

### Key Pillars of v0.02:
1. **Full v0.01 OTT Preservation:** Movies, TV Series, Anime (AniList GraphQL), Dramas (TVmaze), Live TV Guide (278 Channels), TMDB metadata, and 3-mode Shaka player remain intact.
2. **Federated Stash Multi-Server Vault:** Supports connecting one or multiple self-hosted Stash instances via official GraphQL API.
3. **Restricted 18+ Adult Ecosystem:** Gated by strict birth-year age verification, featuring scenes, performers, studios, tags, and photo galleries without exposing sensitive content to unverified sessions.
4. **Multi-User & Permission Engine:** 6 distinct roles (`super_admin`, `admin`, `moderator`, `premium_user`, `standard_user`, `restricted_user`), user groups, and denied-by-default server validation.
5. **Private Media Playlists & Activity Timeline:** User-created playlists with shuffle/repeat and group sharing; chronological media timeline.
6. **Authorized Legal P2P Adapter:** Strict allowlist registry limited to Public Domain (Internet Archive) and Creative Commons (Blender Foundation Open Movies).
7. **Offline Download Manager:** Queue management with pause/resume, cancel, and storage quota accounting.
8. **10-Foot TV Mode:** Remote and keyboard-navigable fullscreen interface at `/tv`.

---

## 2. Feature Status Matrix

| Module | Feature / Capability | Status | Notes / Requirements |
|---|---|---|---|
| **Private Library** | Multi-Server Stash Federation | ✅ Operational | Configurable via Admin Hub & `/api/library/servers` |
| **Private Library** | Stash Scene Browsing (Grid/Compact/List) | ✅ Operational | Filtering by studio, performer, tags, rating |
| **Private Library** | Secure Stream Proxy (`/api/library/stash/proxy-stream`) | ✅ Operational | HTTP 206 partial content streaming; hides internal IP |
| **Private Library** | Incremental & Delta Sync (`/api/library/stash/sync`) | ✅ Operational | Automated scene, performer, and studio sync |
| **Playlists** | Private & Shared Playlists (`/library/playlists`) | ✅ Operational | User-managed queues, shuffle, repeat, group visibility |
| **Downloads** | Download Queue & Storage Quota (`/library/downloads`) | ✅ Operational | Pause, resume, cancellation, and quota management |
| **TV Mode** | 10-Foot Remote Navigable Interface (`/tv`) | ✅ Operational | Keyboard navigation (`←`, `→`, `Enter`), large cards |
| **Timeline** | Chronological Media Timeline (`/timeline`) | ✅ Operational | Date-sorted activity and viewing progression |
| **Restricted 18+** | Statutory Age-Verification Gate (`/restricted`) | ✅ Operational | Birth-year validation; zero adult thumbnails to unverified users |
| **Restricted 18+** | Performers, Studios & Galleries | ✅ Operational | Dynamic filtering powered by Stash GraphQL |
| **Legal P2P** | Allowlisted Torrent Source Registry | ✅ Operational | Internet Archive CC, Blender Open Movies only |
| **Multi-User** | Roles & Group Permissions Engine | ✅ Operational | Super Admin, Admin, Moderator, Premium, Standard, Restricted |
| **Admin Hub** | Stash Servers & Vault Manager | ✅ Operational | Multi-server configuration and delta sync runner |
| **Admin Hub** | Legal P2P Source Registry Manager | ✅ Operational | Allowlist verification status and permissions |
| **Admin Hub** | User Accounts & Role Assignment | ✅ Operational | Per-user vault and download permissions |
| **Main OTT** | All v0.01 Features (Home, Live TV, Channels, Explore, Player) | ✅ Operational | Fully preserved |
| **In-App Updates** | Release Notes & Architecture View (`/updates`) | ✅ Operational | Interactive v0.02 release presentation |

---

## 3. Provider Integration Inventory

| Provider Adapter | Integration Type | Authentication / Credentials | Status |
|---|---|---|---|
| **Stash Media Server** | GraphQL API | `STASH_SERVER_URL` & `STASH_API_KEY` (Server-side) | ✅ Operational (Includes simulated fallback vault) |
| **Legal P2P Adapter** | WebRTC / Allowlisted Manifest | Allowlist Registry | ✅ Operational (Archive.org & Blender Studio verified) |
| **TMDB** | REST v3 (`api.themoviedb.org`) | `NEXT_PUBLIC_TMDB_API_KEY` | ✅ Operational |
| **AniList** | GraphQL (`graphql.anilist.co`) | None required (Public) | ✅ Operational & live |
| **TVmaze** | REST (`api.tvmaze.com`) | None required (Public) | ✅ Operational & live |
| **Internet Archive** | REST & MP4 (`archive.org`) | None required (Public domain) | ✅ Operational & direct streaming |
| **YouTube Data API** | REST v3 & Embed IFrame | `YOUTUBE_API_KEY` (Optional for embeds) | ✅ Operational |
| **Watchmode** | REST (`api.watchmode.com`) | `WATCHMODE_API_KEY` | ✅ Configured |
| **JustWatch** | Partner REST Feed | Partner License Required | 🔒 Partner API Required stub |
| **Cloudflare Stream** | REST & HLS (`videodelivery.net`) | `CLOUDFLARE_STREAM_ACCOUNT_ID` + `API_TOKEN` | 🔑 User Configured |
| **Mux Video** | REST & HLS (`stream.mux.com`) | `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` | 🔑 User Configured |

---

## 4. Supabase Database Schema

The comprehensive migration script is located at:
`supabase/migrations/20261123_v002_complete_schema.sql`

Tables added in v0.02:
1. `library_servers`
2. `media_libraries`
3. `library_sync_jobs`
4. `library_items`
5. `library_item_external_ids`
6. `user_groups`
7. `group_members`
8. `library_permissions`
9. `collection_restrictions`
10. `user_ratings`
11. `user_favourites`
12. `user_hidden_items`
13. `user_saved_filters`
14. `playlists`
15. `playlist_items`
16. `playlist_permissions`
17. `playback_progress`
18. `download_jobs`
19. `authorized_media_sources`
20. `source_rights_records`
21. `content_licences`
22. `audit_logs`
