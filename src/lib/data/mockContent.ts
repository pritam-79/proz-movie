import { ContentItem } from '@/types/content';

export const MOCK_CONTENT: ContentItem[] = [
  // 1. Featured Cinematic Hero & Hollywood Original
  {
    id: "proz-mov-001",
    title: "Tears of Steel: Cyber Horizon",
    originalTitle: "Tears of Steel",
    slug: "tears-of-steel-cyber-horizon",
    type: "movie",
    category: "hollywood",
    synopsis: "Set in a dystopian future where Earth has been overrun by autonomous military cyborgs, a daring team of rebel scientists and veterans assemble at the ancient Oude Kerk in Amsterdam. Their mission: activate a temporal memory beacon and alter the timeline before human civilization is extinguished.",
    tagline: "What if the future is already here, and we lost the keys?",
    releaseYear: 2024,
    runtimeMinutes: 84,
    maturityRating: "PG-13",
    genres: ["Sci-Fi", "Action", "Cyberpunk", "Thriller"],
    languages: ["English", "Hindi", "Spanish", "Japanese"],
    ratingScore: 9.1,
    ratingCount: 14820,
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    streamUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    dashUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: true,
    isRestricted18Plus: false,
    cast: [
      { name: "Derek de Lint", character: "Old Thom", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
      { name: "Sergio Hasselbaink", character: "Barley", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
      { name: "Vanja Rukavina", character: "Frank", avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
      { name: "Denise Rebergen", character: "Celia", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Ian Hubert", role: "Director & Writer" },
      { name: "Ton Roosendaal", role: "Producer" },
      { name: "Joris Hermans", role: "Cinematographer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English [CC]", lang: "en", url: "/subtitles/tos-en.vtt", isDefault: true },
      { id: "sub-es", label: "Español", lang: "es", url: "/subtitles/tos-es.vtt" },
      { id: "sub-hi", label: "हिन्दी", lang: "hi", url: "/subtitles/tos-hi.vtt" }
    ],
    audioTracks: [
      { id: "aud-en", label: "English [Original - 5.1 Dolby]", lang: "en", codec: "AAC", isDefault: true },
      { id: "aud-hi", label: "Hindi [Dubbed]", lang: "hi", codec: "AAC" }
    ],
    license: {
      licensor: "Blender Foundation & PROZ Cinema Studios",
      expiryDate: "2030-12-31",
      territories: ["GLOBAL"]
    }
  },

  // 2. K-Drama Hit Series
  {
    id: "proz-ser-002",
    title: "Seoul Protocol: Shadow Cyber",
    originalTitle: "서울 프로토콜",
    slug: "seoul-protocol-shadow-cyber",
    type: "series",
    category: "k_drama",
    synopsis: "When a deepfake cyber extortion ring threatens the South Korean national power grid, an uncompromising NIS digital forensics officer joins forces with an underground white-hat hacker group hidden in the neon alleyways of Gangnam.",
    tagline: "In the neon city, your identity is the currency.",
    releaseYear: 2025,
    runtimeMinutes: 62,
    maturityRating: "TV-MA",
    genres: ["K-Drama", "Crime", "Cyberpunk", "Mystery"],
    languages: ["Korean", "English", "Hindi"],
    ratingScore: 9.4,
    ratingCount: 31200,
    posterUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: true,
    isRestricted18Plus: false,
    seasons: [
      {
        id: "sp-s01",
        seasonNumber: 1,
        title: "Season 1: Zero-Day Incursion",
        episodes: [
          {
            id: "sp-s01-e01",
            seasonNumber: 1,
            episodeNumber: 1,
            title: "Episode 1: The Blackout",
            synopsis: "A coordinated electrical pulse shuts down half of Seoul's financial district. Lead investigator Park Jin-woo discovers code signatures traced back to a decommissioned military server.",
            durationMinutes: 64,
            thumbnailUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop",
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            introStartSec: 45,
            introEndSec: 110
          },
          {
            id: "sp-s01-e02",
            seasonNumber: 1,
            episodeNumber: 2,
            title: "Episode 2: The Red Ledger",
            synopsis: "Jin-woo tracks down the rogue programmer known as Spectre, only to find him ambushed inside a subterranean server farm.",
            durationMinutes: 58,
            thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            introStartSec: 30,
            introEndSec: 95
          },
          {
            id: "sp-s01-e03",
            seasonNumber: 1,
            episodeNumber: 3,
            title: "Episode 3: Ghost in the Metro",
            synopsis: "The chase goes mobile as autonomous trains across Line 2 are hijacked in real time by the consortium.",
            durationMinutes: 61,
            thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop",
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            introStartSec: 25,
            introEndSec: 85
          }
        ]
      }
    ],
    cast: [
      { name: "Lee Dong-wook", character: "Park Jin-woo", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
      { name: "Han So-hee", character: "Kang Min-ah (Spectre)", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
      { name: "Wi Ha-joon", character: "Agent Choi", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Bong Joon-seok", role: "Showrunner & Director" },
      { name: "Kim Eun-hee", role: "Screenwriter" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/sp-en.vtt", isDefault: true },
      { id: "sub-ko", label: "한국어", lang: "ko", url: "/subtitles/sp-ko.vtt" }
    ],
    audioTracks: [
      { id: "aud-ko", label: "Korean [Original]", lang: "ko", codec: "AAC", isDefault: true },
      { id: "aud-en", label: "English Dub", lang: "en", codec: "AAC" }
    ],
    license: {
      licensor: "CJ ENM & PROZ Media Asia",
      expiryDate: "2031-06-30",
      territories: ["GLOBAL"]
    }
  },

  // 3. Anime Masterpiece
  {
    id: "proz-ani-003",
    title: "Sintel: Dragon Vanguard",
    originalTitle: "シンテル 龍の守護者",
    slug: "sintel-dragon-vanguard",
    type: "movie",
    category: "anime",
    synopsis: "In a fantasy kingdom shrouded in ice and forgotten magic, the determined orphan Sintel raises a wounded baby dragon. When ruthless dragon hunters kidnap Scales, she undertakes a harrowing pilgrimage through snow storms and monster-infested ruins to take back her guardian friend.",
    tagline: "The strongest bond cannot be severed by sword or magic.",
    releaseYear: 2024,
    runtimeMinutes: 56,
    maturityRating: "PG-13",
    genres: ["Anime", "Fantasy", "Action", "Adventure"],
    languages: ["Japanese", "English", "Hindi"],
    ratingScore: 9.3,
    ratingCount: 22400,
    posterUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920&auto=format&fit=crop",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: false,
    isRestricted18Plus: false,
    cast: [
      { name: "Halina Reijn", character: "Sintel (Voice)", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" },
      { name: "Thom Hoffman", character: "Shaman (Voice)", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Colin Levy", role: "Director" },
      { name: "Esther Pearl", role: "Producer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English [Subbed]", lang: "en", url: "/subtitles/sintel-en.vtt", isDefault: true },
      { id: "sub-ja", label: "日本語", lang: "ja", url: "/subtitles/sintel-ja.vtt" }
    ],
    audioTracks: [
      { id: "aud-ja", label: "Japanese [Original Audio]", lang: "ja", codec: "AAC", isDefault: true },
      { id: "aud-en", label: "English Dubbed", lang: "en", codec: "AAC" }
    ],
    license: {
      licensor: "Durian Open Movie Project / PROZ Anime",
      expiryDate: "2032-01-01",
      territories: ["GLOBAL"]
    }
  },

  // 4. Bollywood High-Octane Action
  {
    id: "proz-bol-004",
    title: "Vanguard: Mumbai Rising",
    originalTitle: "वैनगार्ड: मुंबई राइजिंग",
    slug: "vanguard-mumbai-rising",
    type: "movie",
    category: "bollywood",
    synopsis: "An elite anti-terror operative is recalled from retirement when an international syndicate plants weaponized drone swarms atop Mumbai's iconic skyline. Racing against an 8-hour countdown, he must penetrate the underwater nexus before the city collapses.",
    tagline: "Duty beyond life. Courage beyond fear.",
    releaseYear: 2025,
    runtimeMinutes: 142,
    maturityRating: "PG-13",
    genres: ["Bollywood", "Action", "Thriller", "Crime"],
    languages: ["Hindi", "English", "Telugu", "Tamil"],
    ratingScore: 8.8,
    ratingCount: 42100,
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1920&auto=format&fit=crop",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: false,
    isRestricted18Plus: false,
    cast: [
      { name: "Kabir Roy", character: "Major Vikram Rathore", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
      { name: "Aria Sharma", character: "Dr. Ananya Sen", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Rohit Verma", role: "Director" },
      { name: "Karan Malhotra", role: "Producer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/vm-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-hi", label: "Hindi [Original Atmos]", lang: "hi", codec: "AAC", isDefault: true },
      { id: "aud-en", label: "English Dub", lang: "en", codec: "AAC" }
    ],
    license: {
      licensor: "Dharma Productions / PROZ India",
      expiryDate: "2029-12-31",
      territories: ["GLOBAL"]
    }
  },

  // 5. South Indian Epic
  {
    id: "proz-sou-005",
    title: "Veera Chakra: The Dynasty",
    originalTitle: "వీర చక్ర",
    slug: "veera-chakra-the-dynasty",
    type: "movie",
    category: "south_indian",
    synopsis: "In 14th-century Southern India, a forgotten prince rises against a tyrannical warlord to reclaim the sacred celestial wheel and unite the scattered kingdoms across the Deccan plateau.",
    tagline: "Blood defines royalty. Valor defines a King.",
    releaseYear: 2024,
    runtimeMinutes: 165,
    maturityRating: "PG-13",
    genres: ["South Indian", "Action", "Epic", "Drama"],
    languages: ["Telugu", "Tamil", "Kannada", "Malayalam", "Hindi", "English"],
    ratingScore: 9.2,
    ratingCount: 58000,
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=1920&auto=format&fit=crop",
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isFeatured: false,
    isTrending: true,
    isOriginal: false,
    isRestricted18Plus: false,
    cast: [
      { name: "Prabhas Rao", character: "Prince Rudra Deva", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
      { name: "Samantha Krishnan", character: "Princess Mallika", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "S.S. Rajamohan", role: "Director" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/vc-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-te", label: "Telugu [Original]", lang: "te", codec: "AAC", isDefault: true },
      { id: "aud-hi", label: "Hindi Dub", lang: "hi", codec: "AAC" },
      { id: "aud-ta", label: "Tamil Dub", lang: "ta", codec: "AAC" }
    ],
    license: {
      licensor: "Arka Media Works / PROZ South",
      expiryDate: "2030-05-15",
      territories: ["GLOBAL"]
    }
  },

  // 6. Bengali Mystery & Cinema
  {
    id: "proz-ben-006",
    title: "Kolkata Noir: Midnight Case",
    originalTitle: "কলকাতা নয়ার: মধ্যরাতের কেস",
    slug: "kolkata-noir-midnight-case",
    type: "movie",
    category: "bengali",
    synopsis: "A seasoned detective who lost his family to an unresolved heist gets a cryptic letter pointing to a series of high-profile art thefts along the vintage tramways of North Kolkata.",
    tagline: "The city remembers every shadow.",
    releaseYear: 2024,
    runtimeMinutes: 118,
    maturityRating: "PG-13",
    genres: ["Bengali", "Mystery", "Crime", "Thriller"],
    languages: ["Bengali", "English", "Hindi"],
    ratingScore: 8.7,
    ratingCount: 12500,
    posterUrl: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFeatured: false,
    isTrending: false,
    isOriginal: true,
    isRestricted18Plus: false,
    cast: [
      { name: "Parambrata Bose", character: "Inspector Subhashish", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
      { name: "Raima Sen", character: "Nandini Mukherjee", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Srijit Roy", role: "Director" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/kn-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-bn", label: "Bengali [Original]", lang: "bn", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "SVF Entertainment / PROZ East",
      expiryDate: "2029-08-20",
      territories: ["GLOBAL"]
    }
  },

  // 7. International Sci-Fi Cinema
  {
    id: "proz-int-007",
    title: "Cosmos Laundromat: First Cycle",
    originalTitle: "Cosmos Laundromat",
    slug: "cosmos-laundromat-first-cycle",
    type: "movie",
    category: "international",
    synopsis: "On a desolate cliff in the middle of nowhere, a melancholy soul meets an eccentric salesman who offers a washing machine with the power to transport anyone into parallel lives and infinite surreal dimensions.",
    tagline: "One soul. Infinite parallel realities.",
    releaseYear: 2024,
    runtimeMinutes: 62,
    maturityRating: "PG-13",
    genres: ["International", "Sci-Fi", "Surreal", "Comedy"],
    languages: ["English", "French", "German", "Spanish"],
    ratingScore: 9.0,
    ratingCount: 19800,
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isFeatured: false,
    isTrending: true,
    isOriginal: false,
    isRestricted18Plus: false,
    cast: [
      { name: "Pierre Bokma", character: "Franck", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" },
      { name: "Reinout Scholten van Aschat", character: "Victor", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Mathieu Auvray", role: "Director" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/cl-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-en", label: "English [Original]", lang: "en", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "Blender Animation Studio / PROZ Europe",
      expiryDate: "2031-11-15",
      territories: ["GLOBAL"]
    }
  },

  // 8. Cyberpunk Anime Series
  {
    id: "proz-ani-008",
    title: "Chrono Blade: Neo Tokyo",
    originalTitle: "クロノブレード ネオ東京",
    slug: "chrono-blade-neo-tokyo",
    type: "series",
    category: "anime",
    synopsis: "In year 2099, neural augments are mandatory for citizens of Neo-Tokyo. A rogue cyber-samurai possessing an analog katana and an anti-quantum neural shield wages a solo campaign against the megacorporation controlling human thoughts.",
    tagline: "Steel cannot be hacked.",
    releaseYear: 2025,
    runtimeMinutes: 24,
    maturityRating: "TV-MA",
    genres: ["Anime", "Cyberpunk", "Action", "Sci-Fi"],
    languages: ["Japanese", "English"],
    ratingScore: 9.5,
    ratingCount: 48900,
    posterUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: true,
    isRestricted18Plus: false,
    seasons: [
      {
        id: "cb-s01",
        seasonNumber: 1,
        title: "Season 1: Neon Glitch",
        episodes: [
          {
            id: "cb-s01-e01",
            seasonNumber: 1,
            episodeNumber: 1,
            title: "Episode 1: The Analog Katana",
            synopsis: "Ren awakens with wiped memories in the neon gutters of Shinjuku Sector 4, armed only with an heirloom katana.",
            durationMinutes: 25,
            thumbnailUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop",
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          },
          {
            id: "cb-s01-e02",
            seasonNumber: 1,
            episodeNumber: 2,
            title: "Episode 2: Protocol Override",
            synopsis: "Corporate strike teams deploy mecha-drones across the skybridges, forcing Ren into an alliance with underground resistance hackers.",
            durationMinutes: 24,
            thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
            streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          }
        ]
      }
    ],
    cast: [
      { name: "Kenjiro Tsuda", character: "Ren (Voice)", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
      { name: "Maaya Sakamoto", character: "Aoi (Voice)", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Shinichiro Watanabe", role: "Creative Director" }
    ],
    subtitles: [
      { id: "sub-en", label: "English [Subbed]", lang: "en", url: "/subtitles/cb-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-ja", label: "Japanese [Original Audio]", lang: "ja", codec: "AAC", isDefault: true },
      { id: "aud-en", label: "English Dub", lang: "en", codec: "AAC" }
    ],
    license: {
      licensor: "Mappa / PROZ Anime Studios",
      expiryDate: "2030-10-31",
      territories: ["GLOBAL"]
    }
  },

  // 9. Chinese Drama / Wuxia
  {
    id: "proz-dra-009",
    title: "Sword of the Immortal Phoenix",
    originalTitle: "凤凰不死剑",
    slug: "sword-of-the-immortal-phoenix",
    type: "series",
    category: "c_drama",
    synopsis: "In ancient Jianghu, a disgraced disciple of Mount Kunlun discovers a celestial scroll capable of commanding lightning. Bound by a forbidden promise to a rebel princess, he walks between mortal law and mythical cultivation.",
    tagline: "Honor is forged in the fires of Mount Kunlun.",
    releaseYear: 2024,
    runtimeMinutes: 48,
    maturityRating: "PG-13",
    genres: ["Drama", "Action", "Fantasy", "Romance"],
    languages: ["Mandarin", "English"],
    ratingScore: 8.9,
    ratingCount: 29500,
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isFeatured: false,
    isTrending: true,
    isOriginal: false,
    isRestricted18Plus: false,
    cast: [
      { name: "Xiao Zhan", character: "Master Ye Feng", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
      { name: "Zhao Liying", character: "Princess Lian", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Zhang Yimou", role: "Executive Producer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/sp-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-zh", label: "Mandarin [Original]", lang: "zh", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "iQIYI / PROZ Asia",
      expiryDate: "2029-04-12",
      territories: ["GLOBAL"]
    }
  },

  // 10. Web Series OTT Hit
  {
    id: "proz-ser-010",
    title: "Silicon Heist: Rogue Protocol",
    originalTitle: "Silicon Heist",
    slug: "silicon-heist-rogue-protocol",
    type: "series",
    category: "original",
    synopsis: "Four disaffected engineers at the world's most valuation-inflated quantum computing firm plan a billion-dollar cryptocurrency extraction from inside the server core during an IPO gala.",
    tagline: "The smartest theft requires no weapons. Just a terminal.",
    releaseYear: 2025,
    runtimeMinutes: 52,
    maturityRating: "TV-MA",
    genres: ["Crime", "Thriller", "Drama", "Tech"],
    languages: ["English", "Spanish", "German"],
    ratingScore: 9.1,
    ratingCount: 34100,
    posterUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFeatured: true,
    isTrending: true,
    isOriginal: true,
    isRestricted18Plus: false,
    cast: [
      { name: "Rami Malek", character: "Elliot Hayes", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
      { name: "Emma Stone", character: "Devon Vance", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "David Fincher", role: "Creator & Showrunner" }
    ],
    subtitles: [
      { id: "sub-en", label: "English [CC]", lang: "en", url: "/subtitles/sh-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-en", label: "English [Atmos]", lang: "en", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "PROZ Studios Original Distribution",
      expiryDate: "2035-12-31",
      territories: ["GLOBAL"]
    }
  },

  // 11. Documentary Feature
  {
    id: "proz-doc-011",
    title: "Deep Abyss: Secrets of the Mariana Trench",
    slug: "deep-abyss-mariana-trench",
    type: "movie",
    category: "documentary",
    synopsis: "Join a record-breaking 11,000-meter deep submersible dive into the Challenger Deep, illuminating bioluminescent alien creatures and geothermal vents never before captured in 4K HDR.",
    tagline: "The last unexplored frontier on planet Earth.",
    releaseYear: 2024,
    runtimeMinutes: 75,
    maturityRating: "G",
    genres: ["Documentary", "Nature", "Science"],
    languages: ["English", "French"],
    ratingScore: 9.4,
    ratingCount: 16200,
    posterUrl: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isFeatured: false,
    isTrending: false,
    isOriginal: true,
    isRestricted18Plus: false,
    cast: [
      { name: "David Attenborough", character: "Narrator", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "James Cameron", role: "Producer & Deep Sea Explorer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/doc-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-en", label: "English [Spatial Audio]", lang: "en", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "National Geographic & PROZ Docs",
      expiryDate: "2032-07-04",
      territories: ["GLOBAL"]
    }
  },

  // 12. 18+ Restricted Zone Title 1
  {
    id: "proz-18p-012",
    title: "Midnight Tokyo: Neon Desires",
    slug: "midnight-tokyo-neon-desires",
    type: "movie",
    category: "international",
    synopsis: "An uncensored, provocative exploration of the seductive nightlife and high-stakes underground clubs of Roppongi, where secrets, passion and betrayal collide under neon rain.",
    tagline: "Desire has no curfew.",
    releaseYear: 2024,
    runtimeMinutes: 98,
    maturityRating: "18+",
    genres: ["18+ Restricted", "Drama", "Romance", "Thriller"],
    languages: ["Japanese", "English"],
    ratingScore: 8.5,
    ratingCount: 18400,
    posterUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isFeatured: false,
    isTrending: false,
    isOriginal: true,
    isRestricted18Plus: true,
    cast: [
      { name: "Asuka Kirara", character: "Reiko", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Takashi Miike", role: "Consulting Producer" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/mt-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-ja", label: "Japanese [Original]", lang: "ja", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "PROZ After Dark International",
      expiryDate: "2028-12-31",
      territories: ["GLOBAL"]
    }
  },

  // 13. 18+ Restricted Zone Title 2
  {
    id: "proz-18p-013",
    title: "Velvet Shadows: The Uncut Chronicles",
    slug: "velvet-shadows-uncut",
    type: "series",
    category: "original",
    synopsis: "An adult psychological drama delving into the sensual entanglements and dangerous blackmail rings within high society art collectors in Zurich and Milan.",
    tagline: "Every secret leaves a velvet scar.",
    releaseYear: 2025,
    runtimeMinutes: 50,
    maturityRating: "18+",
    genres: ["18+ Restricted", "Psychological", "Drama"],
    languages: ["English", "French", "Italian"],
    ratingScore: 8.6,
    ratingCount: 14200,
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    backdropUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920&auto=format&fit=crop",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    fallbackMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isFeatured: false,
    isTrending: false,
    isOriginal: true,
    isRestricted18Plus: true,
    cast: [
      { name: "Chloe Moreau", character: "Elena", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" }
    ],
    crew: [
      { name: "Jean-Luc Godard Estate", role: "Creative Advisor" }
    ],
    subtitles: [
      { id: "sub-en", label: "English", lang: "en", url: "/subtitles/vs-en.vtt", isDefault: true }
    ],
    audioTracks: [
      { id: "aud-en", label: "English [Uncensored]", lang: "en", codec: "AAC", isDefault: true }
    ],
    license: {
      licensor: "PROZ Mature Productions",
      expiryDate: "2029-06-30",
      territories: ["GLOBAL"]
    }
  }
];

export const GENRE_LIST = [
  { id: "action", name: "Action", icon: "Flame" },
  { id: "sci-fi", name: "Sci-Fi", icon: "Rocket" },
  { id: "drama", name: "Drama", icon: "HeartHandshake" },
  { id: "thriller", name: "Thriller", icon: "Zap" },
  { id: "anime", name: "Anime", icon: "Sparkles" },
  { id: "k_drama", name: "K-Drama", icon: "Tv" },
  { id: "crime", name: "Crime", icon: "ShieldAlert" },
  { id: "documentary", name: "Documentary", icon: "Film" },
  { id: "comedy", name: "Comedy", icon: "Laugh" },
  { id: "fantasy", name: "Fantasy", icon: "Shield" },
];
