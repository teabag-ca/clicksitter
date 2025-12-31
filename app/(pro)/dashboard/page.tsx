import { createClientWithRLS } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProDashboard() {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Loading...</div>
  }

  // Get professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('plan_type', 'pro_bundle')
    .eq('status', 'active')
    .single()

  // Get user's jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const needsOnboarding = !profile
  const needsVerification = profile && !profile.identity_verified

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-600">Manage your caregiver profile and jobs</p>
      </div>

      {needsOnboarding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 mb-2">
            Complete your profile to start receiving job offers
          </p>
          <Link
            href="/(pro)/onboarding"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Start Onboarding
          </Link>
        </div>
      )}

      {needsVerification && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 mb-2">
            Verify your identity to appear in search results
          </p>
          <Link
            href="/(pro)/verify"
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 inline-block"
          >
            Verify Identity
          </Link>
        </div>
      )}

      {!subscription && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Upgrade to Pro Bundle for AI Concierge, Tier 1 ranking, and Trust
            Badge.{' '}
            <Link href="/(pro)/subscribe" className="underline font-semibold">
              Upgrade now ($9.99/mo)
            </Link>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/(pro)/jobs"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">💼 Browse Jobs</h2>
          <p className="text-gray-600">Find and apply to job opportunities</p>
        </Link>
        <Link
          href="/(pro)/profile"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">👤 Edit Profile</h2>
          <p className="text-gray-600">Update your profile and availability</p>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Jobs</h2>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div key={job.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {new Date(job.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      {job.status} • ${job.agreed_rate}/hr
                    </p>
                  </div>
                  <Link
                    href={`/(pro)/jobs/${job.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No jobs yet. Browse available jobs!</p>
        )}
      </div>
    </div>
  )
}

