# Stripe Webhook Setup Guide

## Option 1: Stripe CLI (Recommended for Local Development)

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe CLI
```bash
stripe login
```

### Forward webhooks to local server
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like:
`whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Copy this and add it to your .env.local as:
`STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`

## Option 2: Stripe Dashboard (For Production)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `identity.verification_session.verified`
5. Click "Add endpoint"
6. Click on the endpoint to view details
7. Click "Reveal" next to "Signing secret"
8. Copy the secret (starts with `whsec_`)
9. Add to .env.local: `STRIPE_WEBHOOK_SECRET="whsec_..."`

## Testing Webhooks Locally

With Stripe CLI running, you can trigger test events:
```bash
# Test subscription creation
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test identity verification
stripe trigger identity.verification_session.verified
```
