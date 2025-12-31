'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'parent' as 'parent' | 'professional',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: formData.role,
            },
          },
        })

        if (error) throw error

        // Create user record with role
        if (data.user) {
          const { error: dbError } = await supabase.from('users').insert({
            id: data.user.id,
            email: formData.email,
            role: formData.role,
          })

          if (dbError) {
            console.error('Error creating user record:', dbError)
          }

          // Create profile based on role
          if (formData.role === 'professional') {
            await supabase.from('professional_profiles').insert({
              user_id: data.user.id,
            })
          } else {
            await supabase.from('parent_profiles').insert({
              user_id: data.user.id,
            })
          }
        }

        // Redirect to phone verification
        router.push(
          formData.role === 'parent'
            ? '/(parent)/verify-phone'
            : '/(pro)/verify-phone'
        )
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        // Get user role and redirect
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', formData.email)
          .single()

        if (userData?.role === 'professional') {
          router.push('/(pro)/dashboard')
        } else {
          router.push('/(parent)/dashboard')
        }
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium mb-1">I am a...</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={formData.role === 'parent'}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'parent' | 'professional' })
                  }
                  className="mr-2"
                />
                Parent
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="professional"
                  checked={formData.role === 'professional'}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'parent' | 'professional' })
                  }
                  className="mr-2"
                />
                Caregiver
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setIsSignUp(false)}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => setIsSignUp(true)}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  )
}

