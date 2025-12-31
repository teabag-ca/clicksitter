import { stripe } from '@/lib/stripe/client'
import { handleSubscriptionWebhook } from '@/lib/stripe/subscriptions'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle subscription events
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await handleSubscriptionWebhook(event)
  }

  // Handle identity verification events
  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object as Stripe.Identity.VerificationSession
    const userId = session.metadata?.user_id

    if (userId) {
      const supabase = await createServiceRoleClient()
      await supabase
        .from('professional_profiles')
        .update({ identity_verified: true })
        .eq('user_id', userId)
    }
  }

  return NextResponse.json({ received: true })
}

