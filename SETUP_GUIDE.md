# PROZ MOVIE — SETUP & INSTALLATION GUIDE
### YOUR WORLD. YOUR ENTERTAINMENT.

This guide provides step-by-step instructions to configure, run, and connect PROZ MOVIE with Supabase, TMDB, and Payment Providers.

---

## 1. Prerequisites
- **Node.js:** v18.18+ or v20+ (tested on Node v26.13.0)
- **Package Manager:** npm v9+ (or yarn / pnpm)
- **Supabase Account:** (Free tier or Pro at [supabase.com](https://supabase.com))

---

## 2. Environment Configuration

1. Copy the example environment template:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and configure your credentials:
```env
# Application
NEXT_PUBLIC_APP_NAME="PROZ MOVIE"
NEXT_PUBLIC_APP_TAGLINE="YOUR WORLD. YOUR ENTERTAINMENT."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase (From Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Playback Session Security
JWT_PLAYBACK_SECRET="your-32-char-secret-jwt-signing-key"
PLAYBACK_SESSION_TTL_SECONDS="14400"

# 18+ Compliance & Parental Pin
ENABLE_RESTRICTED_ZONE="true"
NEXT_PUBLIC_PARENTAL_PIN="1234"

# Payment Gateway (stripe, razorpay, or mock)
PAYMENT_PROVIDER="mock"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# TMDB Integration (Optional)
TMDB_API_KEY="your_tmdb_api_key"
```

---

## 3. Database Schema Migration

PROZ MOVIE includes complete SQL migration and seed scripts located in `supabase/migrations/`:

### Method A: Supabase Dashboard SQL Editor
1. Log into your Supabase Dashboard.
2. Select your project and navigate to the **SQL Editor**.
3. Copy the contents of `supabase/migrations/20261113_initial_schema.sql` and click **Run**.
4. (Optional) Run `supabase/seed.sql` to populate sample content, genres, and subscription plans.

### Method B: Supabase CLI
```bash
supabase db push
supabase db seed
```

---

## 4. Starting Local Development

```bash
# If in root workspace
cd proz-movie

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view PROZ MOVIE.

---

## 5. Testing Credentials & Admin Access

For immediate testing, default mock credentials with full administrator rights are pre-configured:
- **Email:** `alex.proz@example.com`
- **Password:** `password123`
- **Role:** Administrator (Access to `/admin`)
- **Parental Control PIN:** `1234`
- **Subscription Tier:** PREMIUM VIP (4K UHD + Dolby Atmos)
