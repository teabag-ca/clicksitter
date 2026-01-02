import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

async function createRecurringPrices() {
  try {
    // Create recurring price for Parent Subscriber ($19/month)
    const parentPrice = await stripe.prices.create({
      product: 'prod_Ti2EPsmRKrr4Js',
      unit_amount: 1900, // $19.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    })
    console.log('✅ Parent Subscriber Recurring Price ID:', parentPrice.id)

    // Create recurring price for Pro Bundle ($9.99/month)
    const proPrice = await stripe.prices.create({
      product: 'prod_Ti2EsBpp9RyU9a',
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    })
    console.log('✅ Pro Bundle Recurring Price ID:', proPrice.id)

    console.log('\n📝 Add these to your .env.local:')
    console.log(`STRIPE_PARENT_PRICE_ID="${parentPrice.id}"`)
    console.log(`STRIPE_PRO_PRICE_ID="${proPrice.id}"`)
  } catch (error: any) {
    console.error('❌ Error creating prices:', error.message)
    process.exit(1)
  }
}

createRecurringPrices()

