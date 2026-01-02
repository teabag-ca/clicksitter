'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function VerifyPhonePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/verify-phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setStep('verify')
      } else {
        showToast('Failed to send verification code', 'error')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      showToast('Error sending verification code', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/verify-phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      if (response.ok) {
        showToast('Phone number verified successfully!', 'success')
        router.push('/dashboard')
      } else {
        showToast('Invalid verification code', 'error')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      showToast('Error verifying code', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Verify Your Phone Number</h1>

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="bg-white p-6 rounded-lg shadow space-y-4">
          <p className="text-slate-700 mb-4">
            We need to verify your phone number to ensure account security.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="bg-white p-6 rounded-lg shadow space-y-4">
          <p className="text-slate-700 mb-4">
            Enter the 6-digit code sent to {phone}
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center text-2xl tracking-widest text-slate-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-slate-600 py-2 hover:text-slate-700"
          >
            Change phone number
          </button>
        </form>
      )}
    </div>
  )
}

