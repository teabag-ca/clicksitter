# ClickSitter

A two-sided marketplace connecting parents with verified independent caregivers. Built with a trust-first philosophy, ClickSitter democratizes access to quality childcare by replacing agency bureaucracy with transparent verification and direct connections.

## 🎯 Core Philosophy

**"Democratized Trust"** — Replacing agency bureaucracy with verified, direct connection between parents and caregivers.

## 🛠 Tech Stack

- **Framework**: Next.js 16.1.1+ (App Router with PWA support)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 4.1.1
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth + Twilio OTP (Phone Verification)
- **Payments**: Stripe (Identity Verification + Subscription Management)
- **Background Checks**: Checkr (Integration ready)
- **AI**: Vercel AI SDK with Google Gemini 2.0 Flash
- **Rate Limiting**: Upstash Redis
- **Storage**: Supabase Storage
- **Linting**: ESLint 9.0.0 with Next.js config

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for a detailed setup guide.

### Basic Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Configure all required services (see [SETUP.md](./SETUP.md) for details)

3. **Run database migrations:**
   ```bash
   # Apply migrations via Supabase CLI or dashboard
   # Migrations are in supabase/migrations/
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser at http://localhost:3000**

## 📁 Project Structure

```
app/
├── (marketing)/          # Public landing pages
│   ├── auth/            # Authentication page
│   └── page.tsx         # Landing page
├── (parent)/            # Parent portal routes
│   ├── jobs/            # Job management
│   ├── search/          # Caregiver search
│   └── layout.tsx       # Parent layout with navigation
├── (pro)/               # Professional portal routes
│   ├── jobs/            # Browse available jobs
│   ├── onboarding/      # AI-powered onboarding
│   ├── profile/         # Profile management
│   ├── verify/          # Identity verification
│   └── layout.tsx       # Professional layout
├── api/                 # API routes
│   ├── ai/              # AI endpoints
│   ├── auth/            # Authentication endpoints
│   ├── chat/            # Messaging
│   ├── jobs/            # Job management
│   ├── subscribe/       # Subscription management
│   ├── verify-identity/ # Identity verification
│   ├── verify-phone/    # Phone verification
│   └── webhooks/        # Webhook handlers (Stripe, Checkr)
├── dashboard/           # Shared dashboard (role-based rendering)
├── subscribe/           # Shared subscription page
└── verify-phone/        # Shared phone verification page

components/
├── dashboard/           # Dashboard components (Parent/Pro)
└── ui/                  # Reusable UI components (Toast, etc.)

lib/
├── ai/                  # AI integration (Gemini)
├── checkr/              # Background check integration
├── redis/               # Rate limiting
├── stripe/              # Stripe integration
├── supabase/            # Supabase clients (server/client)
└── twilio/              # OTP verification

supabase/
├── migrations/          # Database migrations
└── functions/           # Edge functions (cron jobs)

middleware.ts            # Route protection and authentication
```

## ✨ Key Features

### Trust-First Guardrails

1. **Ghost Block**: Phone verification required for all users (Twilio OTP)
2. **Identity Mandatory**: Professionals hidden from search until verified (Stripe Identity)
3. **Safety Expiry**: Background checks expire after 12 months (automated cron)
4. **Parent Throttle**: Subscribers limited to 10 new chats/day until phone verified

### Multi-Tenant Architecture

- **Route Groups**: `(marketing)`, `(parent)`, `(pro)` for organized routing
- **Shared Routes**: Role-based rendering for `/dashboard`, `/subscribe`, `/verify-phone`
- **Row Level Security (RLS)**: Database-level data isolation using PostgreSQL RLS policies
- **Middleware Protection**: Route-level authentication and authorization

### AI Concierge

- **Onboarding Interview**: AI-powered chat interface for professional profile creation
- **Structured Output**: Uses Zod schemas with Google Gemini for reliable data extraction
- **Rate Limiting**: Redis-based daily limits (free tier: 10/day, premium: 50/day)

### Subscription Model

- **Parent Subscriber** ($19/mo): Unlimited chat, video interviews, full background checks
- **Pro Bundle** ($9.99/mo): AI Concierge, Tier 1 ranking, Trust Badge, 50 AI interactions/day

### Design System

- **Brand Colors**: Red-600 primary, Slate neutrals, Emerald success, Amber warnings
- **WCAG Compliant**: All color combinations meet accessibility standards
- **Toast Notifications**: Modern notification system replacing native alerts
- **Responsive**: Mobile-first design with PWA support

## 🔐 Security & Trust

- **Phone Verification**: Twilio OTP for all users
- **Identity Verification**: Stripe Identity for professionals
- **Background Checks**: Checkr integration (optional, premium feature)
- **RLS Policies**: Database-level access control
- **Middleware Protection**: Route-level authentication checks
- **Rate Limiting**: Redis-based throttling for AI features and chat

## 🧪 Testing

### Test User Flows

**Professional Onboarding:**
1. Sign up at `/auth` as "Caregiver"
2. Verify phone number (use Twilio test numbers)
3. Complete AI onboarding interview at `/onboarding`
4. Verify identity via Stripe Identity at `/verify`

**Parent Flow:**
1. Sign up at `/auth` as "Parent"
2. Verify phone number
3. (Optional) Subscribe at `/subscribe` for full features
4. Search for caregivers at `/search`
5. Post a job at `/jobs/new`

### Testing Stripe Webhooks Locally

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. In another terminal, run the webhook listener:
   ```bash
   ./scripts/test-webhook.sh
   # Or manually:
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger identity.verification_session.verified
   ```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)**: Quick setup and testing guide
- **[SETUP.md](./SETUP.md)**: Detailed service configuration
- **[prd.md](./prd.md)**: Product Requirements Document (definitive spec)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

See `.env.example` for required environment variables. Key services:
- Supabase (Database, Auth, Storage)
- Stripe (Payments, Identity)
- Twilio (SMS OTP)
- Upstash Redis (Rate Limiting)
- Google AI (Gemini API)
- Checkr (Background Checks - optional)

## 🚢 Deployment

The application is configured for deployment on Vercel with:
- Next.js 16.1.1 optimized build
- Environment variable configuration
- Webhook endpoints for Stripe and Checkr
- PWA manifest for standalone app experience

## 📝 License

Private - All rights reserved
