'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProSubscribePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        alert('Please sign in to subscribe')
        return
      }

      const response = await fetch('/api/subscribe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: 'pro_bundle',
          successUrl: `${window.location.origin}/(pro)/dashboard?subscribed=true`,
          cancelUrl: `${window.location.origin}/(pro)/subscribe`,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Error creating subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Upgrade to Pro Bundle</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Pro Bundle - $9.99/month</h2>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            AI Concierge (Voice Management)
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Tier 1 Ranking (Top of Search)
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Trust Badge (Background Check included)
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            50 AI interactions per day
          </li>
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-semibold"
        >
          {loading ? 'Processing...' : 'Upgrade Now'}
        </button>
      </div>
    </div>
  )
}

