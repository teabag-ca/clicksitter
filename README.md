# ClickSitter

A two-sided marketplace connecting parents with verified independent caregivers.

## Tech Stack

- **Framework**: Next.js 16.1.1+ (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth + Twilio OTP
- **Payments**: Stripe (Identity + Subscriptions)
- **Background Checks**: Checkr
- **AI**: Vercel AI SDK with Google Gemini 2.0 Flash
- **Rate Limiting**: Upstash Redis
- **Storage**: Supabase Storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Run database migrations:
```bash
# Apply migrations to your Supabase project
# Use Supabase CLI or dashboard
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

- `app/(marketing)/` - Public landing pages
- `app/(parent)/` - Parent portal
- `app/(pro)/` - Professional portal
- `lib/` - Utility libraries
- `supabase/migrations/` - Database migrations
- `supabase/functions/` - Edge functions (cron jobs)

## Key Features

- **Multi-tenant architecture** using Next.js Route Groups
- **Row Level Security (RLS)** for data isolation
- **Trust-first guardrails**: Phone verification, identity verification, background checks
- **AI Concierge** for professional onboarding
- **Subscription-based monetization**

## Environment Variables

See `.env.example` for required environment variables.

