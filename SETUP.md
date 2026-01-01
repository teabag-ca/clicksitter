# ClickSitter Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Supabase account and project
3. Stripe account with API keys
4. Twilio account with phone number
5. Checkr account (for background checks)
6. Google AI API key (for Gemini)
7. Upstash Redis account

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PARENT_PRICE_ID=price_xxx  # Create in Stripe Dashboard
STRIPE_PRO_PRICE_ID=price_xxx     # Create in Stripe Dashboard

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Checkr
CHECKR_API_KEY=your_checkr_api_key

# Google AI (for Vercel AI SDK)
GOOGLE_AI_API_KEY=your_google_ai_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

Run the migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_rls_policies.sql`

### 4. Stripe Setup

1. Create two products in Stripe Dashboard:
   - **Parent Subscriber**: $19/month recurring
   - **Pro Bundle**: $9.99/month recurring
2. Copy the Price IDs and add them to `.env.local`
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `identity.verification_session.verified`

### 5. Supabase Storage

Create a storage bucket for video handshakes:
- Bucket name: `video-handshakes`
- Public: Yes
- File size limit: 50MB

### 6. Supabase Edge Function (Cron Job)

Deploy the background check expiry function:

```bash
supabase functions deploy expire-background-checks
```

Set up a cron job to call this function daily (via Supabase Dashboard or Vercel Cron).

## Running the Application

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Testing the Flow

### Professional Onboarding

1. Sign up as a professional
2. Verify phone number
3. Complete AI onboarding interview
4. Verify identity via Stripe Identity
5. (Optional) Subscribe to Pro Bundle

### Parent Flow

1. Sign up as a parent
2. Verify phone number
3. (Optional) Subscribe to access full features
4. Search for caregivers
5. Post a job
6. Chat with professionals

## Important Notes

- Phone verification is required for all users (Ghost Block)
- Professionals are hidden from search until identity is verified
- Background checks expire after 12 months (cron job handles this)
- Free tier professionals get 5 AI interactions (bio generation only)
- Premium professionals get 50 AI interactions per day
- Parents need subscription to start chats (10/day limit without phone verification)

## Troubleshooting

### RLS Policies Not Working

- Ensure migrations are applied correctly
- Check that `auth.uid()` is available (Supabase provides this automatically)
- Verify user is authenticated before making queries

### Stripe Webhooks Not Working

- Verify webhook secret is correct
- Check Stripe Dashboard for webhook delivery logs
- Ensure endpoint is publicly accessible

### AI Rate Limiting Issues

- Check Upstash Redis connection
- Verify environment variables are set
- Check Redis dashboard for key expiration


## Twilio Phone Number Setup

To send SMS verification codes, you need a Twilio phone number:

1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click "Buy a number" or use a trial number
3. Copy the phone number (format: +1234567890)
4. Add it to `.env.local` as `TWILIO_PHONE_NUMBER="+1234567890"`

**Note:** In test mode, you can only send SMS to verified phone numbers in your Twilio account.
