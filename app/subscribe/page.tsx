'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function SubscribePage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'parent' | 'professional' | null>(null)

  useEffect(() => {
    async function getUserRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        if (data) {
          setRole(data.role as 'parent' | 'professional')
        }
      }
    }
    getUserRole()
  }, [supabase])

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        showToast('Please sign in to subscribe', 'error')
        return
      }

      const planType = role === 'parent' ? 'parent_subscriber' : 'pro_bundle'
      const response = await fetch('/api/subscribe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          successUrl: `${window.location.origin}/dashboard?subscribed=true`,
          cancelUrl: `${window.location.origin}/subscribe`,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        showToast('Failed to create checkout session', 'error')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      showToast('Error creating subscription', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!role) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (role === 'parent') {
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

