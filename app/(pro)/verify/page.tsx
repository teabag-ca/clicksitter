'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check if returning from Stripe verification
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      // Redirect to dashboard - webhook will update the status
      router.push('/(pro)/dashboard')
      return
    }

    async function createVerificationSession() {
      try {
        const response = await fetch('/api/verify-identity/create', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          // Redirect to Stripe's hosted verification page
          window.location.href = `https://verify.stripe.com/start/${data.sessionId}`
        } else {
          alert('Failed to create verification session')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error creating verification session:', error)
        alert('Error creating verification session')
        setLoading(false)
      }
    }

    createVerificationSession()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg mb-4">Redirecting to identity verification...</p>
          <p className="text-slate-700">Please wait while we set up your verification session.</p>
        </div>
      </div>
    )
  }

  return null
}

