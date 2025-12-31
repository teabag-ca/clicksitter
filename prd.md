This is the **Definitive Master PRD for ClickSitter (MLP)**.

It consolidates every strategic decision we have made: the **Trust-First Guardrails**, the **AI Concierge**, the **Hybrid Monetization**, and the **Next.js Multi-Tenant Architecture**.

This document is written to be handed directly to an engineering team.

---

# 🚀 Master Product Requirement Document: ClickSitter

| **Project Name** | **ClickSitter** |
| --- | --- |
| **Platform** | **Next.js PWA** (Progressive Web App) |
| **Market** | **Canada (Launch)**, USA (Phase 2) |
| **Core Philosophy** | **"Democratized Trust"** — Replacing agency bureaucracy with verified, direct connection. |
| **Technical Goal** | A secure, multi-tenant capable architecture using **PostgreSQL RLS** and **Next.js App Router**. |

---

## 1. Executive Summary

ClickSitter is a two-sided marketplace connecting price-sensitive parents with verified independent caregivers.

* **For Parents:** We reduce anxiety not through high fees, but through transparent **Identity Verification**.
* **For Professionals:** We provide dignity and stability. Our **"AI Concierge"** removes the tech barrier, allowing non-tech-savvy workers to manage their business via voice and chat.

---

## 2. Monetization Strategy (The Hybrid Model)

We monetize *access* for parents and *convenience* for professionals.

| Feature | **Free Tier** | **Paid Tier** |
| --- | --- | --- |
| **Parents (Demand)** | **Guest Access**<br>

<br>• Search & Filter<br>

<br>• View abbreviated profiles (No contact info) | **Subscriber ($19/mo)**<br>

<br>• Unlimited Chat<br>

<br>• Video Interviews<br>

<br>• View Full Background Check |
| **Professionals (Supply)** | **Self-Service**<br>

<br>• Manual Calendar Grid<br>

<br>• Basic Search Ranking<br>

<br>• Manual Profile Entry | **Pro Bundle ($9.99/mo)**<br>

<br>• **AI Concierge** (Voice Management)<br>

<br>• **Tier 1 Ranking** (Top of Search)<br>

<br>• **Trust Badge** (Background Check included) |

---

## 3. Technical Architecture: Next.js Multi-Tenancy

To ensure security and scalability without over-engineering, we will use **Logical Multi-Tenancy** via Next.js Route Groups.

### 3.1 The "Portal" Strategy

Instead of complex subdomains (`pro.app.com` vs `parent.app.com`), we use **Route Groups** to physically separate the code and layouts while keeping a single domain for SEO and PWA installability.

* **Marketing Site:** `app/(marketing)/page.tsx` → Landing pages (SEO optimized).
* **Parent Portal:** `app/(parent)/dashboard/page.tsx` → Optimized for Search & Payments.
* **Pro Portal:** `app/(pro)/dashboard/page.tsx` → Optimized for Chat & Schedule Management.

### 3.2 Data Isolation (The Security Layer)

We use **PostgreSQL with Row Level Security (RLS)**. This is non-negotiable.

* **Why:** It prevents data leaks at the database engine level. Even if a developer writes a bad query like `SELECT * FROM jobs`, the database *itself* will only return rows belonging to the logged-in user.
* **Implementation:** Every query is wrapped in a session context: `set_config('app.current_user_id', user.id)`.

### 3.3 The AI Guardrail (Cost Control)

To support the "Freemium AI," we must prevent API cost explosions.

* **Middleware:** A custom Next.js Middleware check using **Upstash Redis**.
* **Logic:**
* **Free Pro:** Limit to 5 AI interactions (Bio generation only).
* **Premium Pro:** Limit to 50 Voice/Chat interactions per day (Token Bucket algorithm).
* *If limit exceeded:* Fallback to standard manual UI.



---

## 4. Trust & Safety Guardrails (The "Hard Rules")

These rules define the logic of the application.

| Rule Name | Logic | Technical Enforcement |
| --- | --- | --- |
| **1. The "Ghost" Block** | No user (Parent or Pro) can interact without a verified phone number. | **Twilio** OTP gate on signup. |
| **2. Identity Mandatory** | A Pro is **Hidden** from search until Identity is verified. | **Stripe Identity**. Webhook listens for `verification_session.verified`. |
| **3. Safety Expiry** | Background checks expire strictly after **12 Months**. | **Cron Job** (Daily) checks `background_check_expires_at`. If expired, remove badge. |
| **4. Parent Throttle** | Subscriber Parents limited to **10 new chats/day** until phone verified. | **Redis Counter**. Reset every 24h. |

---

## 5. Functional Requirements (The MLP Scope)

### 5.1 The Professional Experience ("ClickSitter Concierge")

*Target: Non-tech-savvy caregivers. Interface: Chat/Voice First.*

* **P0: The "Interview" Onboarding:**
* Instead of a long form, an AI Chatbot asks: *"What is your name?"*, *"Do you have CPR training?"*
* **Tech:** OpenAI GPT-4o-mini structured output to fill the database.


* **P0: Instant Identity Verification:**
* User snaps photo of Passport/DL + Selfie.
* **Tech:** Stripe Identity SDK.


* **P1: The Voice Calendar (Premium):**
* User holds microphone button: *"I can't work this Friday."*
* **Tech:** OpenAI Whisper (Speech-to-Text) → Intent Classification → Database Update.


* **P1: Smart Job Summaries (Premium):**
* Incoming job offers are summarized: *"Maria, job 5km away. $20/hr. 2 kids. Want it?"*



### 5.2 The Parent Experience ("Peace of Mind")

*Target: Anxious, budget-conscious parents. Interface: Visual/Search First.*

* **P0: The Trust Search:**
* Algorithm sorts by: **Tier 1 (Verified+Background)** → **Tier 2 (Verified)** → **Price**.


* **P1: Video Handshake:**
* Profile includes a 15s video loop (TikTok style) of the sitter introducing themselves.


* **P1: "Vibe" Filters:**
* Tags for *"Strict"*, *"Energetic"*, *"Grandma-Energy"*, *"Tutor-Focus"*.



---

## 6. Database Schema (Core Tables)

This schema supports the multi-tenant RLS architecture.

```sql
-- USERS TABLE (Base Entity)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT CHECK (role IN ('parent', 'professional')),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (Professional Specifics)
CREATE TABLE professional_profiles (
  user_id UUID REFERENCES users(id),
  bio TEXT, -- Generated by AI
  hourly_rate INTEGER,
  
  -- TRUST SIGNALS
  identity_verified BOOLEAN DEFAULT FALSE, -- Stripe Identity
  background_check_status TEXT CHECK (status IN ('none', 'active', 'expired', 'failed')),
  background_check_expires_at TIMESTAMPTZ,
  
  -- AI SUBSCRIPTION
  tier_level INTEGER DEFAULT 0, -- 0=Free, 1=Premium
  ai_usage_count INTEGER DEFAULT 0 -- Resets daily
);

-- JOBS (The "Transaction")
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  professional_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('open', 'chatting', 'agreed', 'completed', 'cancelled')),
  agreed_rate INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
);

```

---

## 7. Roadmap & Go-to-Market (Canada Launch)

### Phase 1: The "Trust Foundation" (Weeks 1-6)

* **Goal:** A secure, empty vessel.
* **Build:**
* Next.js Shell with Auth (Supabase).
* Stripe Identity Integration.
* The "Ghost Block" (SMS Verification).



### Phase 2: The "Supply Seed" (Weeks 7-10)

* **Goal:** 50 "Perfect" Profiles.
* **Build:**
* **AI Onboarding Interview** (The "Magic" feature).
* Manual recruitment of 50 sitters. We pay for their background checks manually to seed the "Tier 1" group.



### Phase 3: The "Demand Open" (Weeks 11-14)

* **Goal:** First Transaction.
* **Build:**
* Parent Search & Filters.
* Stripe Subscription gating for Chat.
* Launch Marketing in local Parent Facebook Groups.



---

## 8. Final Developer Notes

* **AI Model:** Use `gemini 2.5 flash` for all chat/summary tasks. It is 90% cheaper than Gemini-3 and fast enough for real-time interaction.
* **PWA:** Ensure `manifest.json` is configured for "Standalone" mode so it hides the browser URL bar, feeling like a native app.
* **Storage:** Use supabase
* **Video Handshakes**. where to stored?

This document serves as the single source of truth for the product.