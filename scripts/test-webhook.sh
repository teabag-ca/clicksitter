#!/bin/bash
# Script to test Stripe webhooks locally

echo "Starting Stripe webhook listener..."
echo "This will forward webhooks to: http://localhost:3000/api/webhooks/stripe"
echo ""
echo "In another terminal, run your Next.js dev server: npm run dev"
echo ""
echo "To test webhooks, use these commands in another terminal:"
echo "  stripe trigger checkout.session.completed"
echo "  stripe trigger customer.subscription.updated"
echo "  stripe trigger identity.verification_session.verified"
echo ""
echo "Press Ctrl+C to stop the listener"
echo ""

stripe listen --forward-to localhost:3000/api/webhooks/stripe
