'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const router = useRouter()
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
          planType: 'parent_subscriber',
          successUrl: `${window.location.origin}/(parent)/dashboard?subscribed=true`,
          cancelUrl: `${window.location.origin}/(parent)/subscribe`,
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
      <h1 className="text-3xl font-bold mb-6">Subscribe to ClickSitter</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Parent Subscriber - $19/month</h2>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Unlimited Chat with caregivers
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Video Interviews
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            View Full Background Checks
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Access to all caregiver contact information
          </li>
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-semibold"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </div>
  )
}

