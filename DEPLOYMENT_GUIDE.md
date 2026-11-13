# PROZ MOVIE — PRODUCTION DEPLOYMENT GUIDE
### YOUR WORLD. YOUR ENTERTAINMENT.

This document describes how to deploy PROZ MOVIE to production hosting environments such as **Vercel**, **Railway**, **AWS Amplify**, or a self-hosted Docker container.

---

## 1. Deploying to Vercel (Recommended)

Next.js App Router applications are natively optimized for Vercel edge deployment.

### Step 1: Connect Git Repository
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository and set the **Root Directory** to `proz-movie`.

### Step 2: Configure Environment Variables
In the Vercel Project Settings, add the required production environment variables:
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_TAGLINE`
- `NEXT_PUBLIC_APP_URL` (e.g. `https://prozmovie.com`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_PLAYBACK_SECRET`
- `ENABLE_RESTRICTED_ZONE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 3: Deploy
Click **Deploy**. Vercel will execute `npm run build` and distribute the serverless functions across global edge regions.

---

## 2. Production Build Checklist

Before cutting a public release:
- [x] Run `npm run build` locally to confirm zero TypeScript errors.
- [x] Verify remote image hostnames in `next.config.mjs`.
- [x] Ensure `JWT_PLAYBACK_SECRET` is at least 32 cryptographically random characters in production.
- [x] Verify Supabase Row Level Security (RLS) policies are active on all 20 database tables.
- [x] Ensure Stripe or LemonSqueezy webhook signing secret is verified in `/api/webhooks/payment`.
- [x] Confirm that age verification gate is enforced for adult titles.
