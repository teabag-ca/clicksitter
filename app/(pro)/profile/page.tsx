'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    bio: '',
    hourly_rate: '',
    availability: {},
  })

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFormData({
            bio: data.bio || '',
            hourly_rate: data.hourly_rate?.toString() || '',
            availability: data.availability || {},
          })
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          bio: formData.bio,
          hourly_rate: parseInt(formData.hourly_rate) || null,
          availability: formData.availability,
        })

      if (error) {
        alert('Failed to update profile')
      } else {
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
            rows={6}
            placeholder="Tell parents about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            min="1"
            value={formData.hourly_rate}
            onChange={(e) =>
              setFormData({ ...formData, hourly_rate: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Availability: Use the calendar grid to set your available times
            (manual entry for free tier)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {profile && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Verification Status</h2>
          <div className="space-y-2 text-sm">
            <p>
              Identity:{' '}
              {profile.identity_verified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-red-600">✗ Not Verified</span>
              )}
            </p>
            <p>
              Background Check:{' '}
              {profile.background_check_status === 'active' ? (
                <span className="text-green-600">✓ Active</span>
              ) : (
                <span className="text-gray-600">Not completed</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

