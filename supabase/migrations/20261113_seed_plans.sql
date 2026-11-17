-- ============================================================================
-- PROZ MOVIE — SEED DATA: Subscription Plans, Genres & Sample Content
-- ============================================================================

-- ============================================================================
-- SUBSCRIPTION PLANS
-- ============================================================================
INSERT INTO subscription_plans (id, name, price, billing_interval, max_screens, video_quality, has_downloads, has_hdr, has_dolby_atmos, is_active, features) VALUES
  ('plan_free',     'FREE',        0.00,   'monthly', 1, '720p',  FALSE, FALSE, FALSE, TRUE, '["720p HD","1 Screen","Ad-supported"]'),
  ('plan_basic',    'BASIC',       199.00, 'monthly', 2, '1080p', FALSE, FALSE, FALSE, TRUE, '["1080p FHD","2 Screens","Ad-free"]'),
  ('plan_standard', 'STANDARD',    499.00, 'monthly', 4, '1080p', TRUE,  FALSE, FALSE, TRUE, '["1080p FHD","4 Screens","Downloads","Ad-free"]'),
  ('plan_premium',  'PREMIUM VIP', 999.00, 'monthly', 6, '4K',    TRUE,  TRUE,  TRUE,  TRUE, '["4K UHD","HDR10+","Dolby Atmos","6 Screens","Downloads"]')
ON CONFLICT (id) DO UPDATE
  SET price    = EXCLUDED.price,
      features = EXCLUDED.features;

-- ============================================================================
-- GENRES
-- ============================================================================
INSERT INTO genres (id, name, slug, display_order) VALUES
  (uuid_generate_v4(), 'Action',      'action',      1),
  (uuid_generate_v4(), 'Adventure',   'adventure',   2),
  (uuid_generate_v4(), 'Comedy',      'comedy',      3),
  (uuid_generate_v4(), 'Drama',       'drama',       4),
  (uuid_generate_v4(), 'Fantasy',     'fantasy',     5),
  (uuid_generate_v4(), 'Horror',      'horror',      6),
  (uuid_generate_v4(), 'Romance',     'romance',     7),
  (uuid_generate_v4(), 'Sci-Fi',      'sci-fi',      8),
  (uuid_generate_v4(), 'Thriller',    'thriller',    9),
  (uuid_generate_v4(), 'Animation',   'animation',  10),
  (uuid_generate_v4(), 'Documentary', 'documentary',11),
  (uuid_generate_v4(), 'Crime',       'crime',      12),
  (uuid_generate_v4(), 'Mystery',     'mystery',    13),
  (uuid_generate_v4(), 'Family',      'family',     14),
  (uuid_generate_v4(), 'Music',       'music',      15),
  (uuid_generate_v4(), 'History',     'history',    16),
  (uuid_generate_v4(), 'War',         'war',        17),
  (uuid_generate_v4(), 'Western',     'western',    18),
  (uuid_generate_v4(), 'Biography',   'biography',  19),
  (uuid_generate_v4(), 'Sport',       'sport',      20)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE / PLACEHOLDER CONTENT
-- NOTE: These are clearly labeled placeholder entries.
--       Admins must replace them with properly licensed content
--       via the Content Management System before publishing.
-- ============================================================================
INSERT INTO content (id, title, slug, content_type, category, description, age_rating, is_published, release_year, language, rating_avg, poster_url, backdrop_url) VALUES
  (uuid_generate_v4(), 'Sample Hollywood Action Film', 'sample-hollywood-action-film',
   'movie', 'hollywood',
   'A high-octane action thriller. [PLACEHOLDER — replace with licensed content via admin panel]',
   'PG-13', FALSE, 2024, 'en', 7.5, '', ''),

  (uuid_generate_v4(), 'Sample Bollywood Drama', 'sample-bollywood-drama',
   'movie', 'bollywood',
   'An emotional family drama. [PLACEHOLDER — replace with licensed content via admin panel]',
   'PG-13', FALSE, 2024, 'hi', 8.0, '', ''),

  (uuid_generate_v4(), 'Sample Anime Series', 'sample-anime-series',
   'anime', 'anime_series',
   'An epic fantasy anime series. [PLACEHOLDER — replace with licensed content via admin panel]',
   'TV-14', FALSE, 2024, 'ja', 8.5, '', ''),

  (uuid_generate_v4(), 'Sample K-Drama Series', 'sample-k-drama-series',
   'drama', 'k_drama',
   'A romantic Korean drama. [PLACEHOLDER — replace with licensed content via admin panel]',
   'TV-14', FALSE, 2024, 'ko', 8.2, '', '')
ON CONFLICT (slug) DO NOTHING;
