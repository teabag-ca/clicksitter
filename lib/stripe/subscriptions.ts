import Stripe from 'stripe'
import { stripe } from './client'
import { createServiceRoleClient } from '@/lib/supabase/server'

export type PlanType = 'parent_subscriber' | 'pro_bundle'

const PLAN_PRICES: Record<PlanType, string> = {
  parent_subscriber: process.env.STRIPE_PARENT_PRICE_ID || '',
  pro_bundle: process.env.STRIPE_PRO_PRICE_ID || '',
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  planType: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const priceId = PLAN_PRICES[planType]
  
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${planType}`)
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      plan_type: planType,
    },
  })

  return session
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  const supabase = await createServiceRoleClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const planType = session.metadata?.plan_type as PlanType

    if (!userId || !planType) {
      console.error('Missing metadata in checkout session')
      return
    }

    // Get subscription details
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customerId = subscription.customer as string

    // Store subscription in database
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: subscription.status,
      plan_type: planType,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    // Update professional tier if Pro Bundle
    if (planType === 'pro_bundle') {
      await supabase
        .from('professional_profiles')
        .update({ tier_level: 1 })
        .eq('user_id', userId)
    }
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription

    // Update subscription status and downgrade professional tier
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id)

    // Get user_id from subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id, plan_type')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subData?.plan_type === 'pro_bundle') {
      await supabase
        .from('professional_profiles')
        .update({ tier_level: 0 })
        .eq('user_id', subData.user_id)
    }
  }
}

