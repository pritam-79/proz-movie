-- ============================================================================
-- PROZ MOVIE — INITIAL SEED DATA
-- YOUR WORLD. YOUR ENTERTAINMENT.
-- ============================================================================

-- Seed Subscription Plans
INSERT INTO subscription_plans (id, name, price, billing_interval, max_screens, video_quality, has_downloads, has_hdr, has_dolby_atmos, is_active)
VALUES 
  ('plan_free', 'FREE', 0.00, 'monthly', 1, '720p', FALSE, FALSE, FALSE, TRUE),
  ('plan_basic', 'BASIC', 4.99, 'monthly', 2, '1080p', FALSE, FALSE, FALSE, TRUE),
  ('plan_standard', 'STANDARD', 9.99, 'monthly', 4, '1080p FHD', TRUE, TRUE, FALSE, TRUE),
  ('plan_premium', 'PREMIUM', 14.99, 'monthly', 6, '4K UHD + HDR', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Genres
INSERT INTO genres (id, name, slug, icon, display_order)
VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Action', 'action', 'Flame', 1),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Sci-Fi', 'sci-fi', 'Rocket', 2),
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Drama', 'drama', 'HeartHandshake', 3),
  ('a1b2c3d4-0004-0000-0000-000000000004', 'Thriller', 'thriller', 'Zap', 4),
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Comedy', 'comedy', 'Laugh', 5),
  ('a1b2c3d4-0006-0000-0000-000000000006', 'Romance', 'romance', 'Heart', 6),
  ('a1b2c3d4-0007-0000-0000-000000000007', 'Animation', 'animation', 'Sparkles', 7),
  ('a1b2c3d4-0008-0000-0000-000000000008', 'Fantasy', 'fantasy', 'Shield', 8),
  ('a1b2c3d4-0009-0000-0000-000000000009', 'Crime', 'crime', 'ShieldAlert', 9),
  ('a1b2c3d4-0010-0000-0000-000000000010', 'Documentary', 'documentary', 'Film', 10),
  ('a1b2c3d4-0011-0000-0000-000000000011', 'Mystery', 'mystery', 'Search', 11),
  ('a1b2c3d4-0012-0000-0000-000000000012', 'Horror', 'horror', 'Skull', 12)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Content (Movies & Series)
INSERT INTO content (
  id, title, original_title, slug, content_type, category, synopsis, tagline, 
  release_year, runtime_minutes, maturity_rating, original_language, rating_score, 
  poster_url, backdrop_url, is_featured, is_trending, is_proz_original, is_restricted_18_plus
) VALUES 
(
  'b1c2d3e4-1001-0000-0000-000000000001',
  'Tears of Steel: Cyber Horizon',
  'Tears of Steel',
  'tears-of-steel',
  'movie',
  'hollywood',
  'In a dystopian future, a group of warriors and scientists gather at Amsterdam’s Oude Kerk to stage a desperate attempt to rescue humanity from the destructive clutches of rampaging sentient robotic drones.',
  'What if the future is already here, and we lost the keys?',
  2024,
  82,
  'PG-13',
  'en',
  8.9,
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
  TRUE,
  TRUE,
  TRUE,
  FALSE
),
(
  'b1c2d3e4-1002-0000-0000-000000000002',
  'Cosmos: The Deep Orbit',
  'Cosmos Laundromat',
  'cosmos-deep-orbit',
  'movie',
  'international',
  'On a desolate windswept island, a suicidal sheep named Franck meets a quirky salesman who offers him the adventure of a lifetime: the chance to live multiple surreal lives across quantum dimensions.',
  'One sheep. Infinite parallel universes.',
  2025,
  68,
  'PG-13',
  'en',
  9.1,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop',
  TRUE,
  TRUE,
  TRUE,
  FALSE
),
(
  'b1c2d3e4-1003-0000-0000-000000000003',
  'Sintel: The Dragon Hunter',
  'Sintel',
  'sintel-dragon-hunter',
  'movie',
  'anime',
  'A lonely young wanderer named Sintel forms an unbreakable bond with an injured baby dragon. When it is snatched away by an elder dragon, she embarks on an epic quest across treacherous snow peaks.',
  'Friendship has no boundaries. Neither does vengeance.',
  2024,
  52,
  'PG-13',
  'ja',
  8.8,
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1920&auto=format&fit=crop',
  FALSE,
  TRUE,
  FALSE,
  FALSE
),
(
  'b1c2d3e4-1004-0000-0000-000000000004',
  'Seoul Protocol: Shadow Cyber',
  '서울 프로토콜',
  'seoul-protocol',
  'series',
  'k_drama',
  'An elite cybersecurity investigator uncovers a clandestine AI network pulling the strings of South Korea’s highest conglomerates, forcing her to team up with an enigmatic rogue white-hat hacker.',
  'Trust no one in the digital district.',
  2025,
  60,
  'TV-MA',
  'ko',
  9.3,
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
  TRUE,
  TRUE,
  TRUE,
  FALSE
)
ON CONFLICT (id) DO NOTHING;
