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
        <p className="text-slate-700">Manage your caregiver profile and jobs</p>
      </div>

      {needsOnboarding && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 mb-2">
            Complete your profile to start receiving job offers
          </p>
          <Link
            href="/onboarding"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 inline-block focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Start Onboarding
          </Link>
        </div>
      )}

      {needsVerification && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-700 mb-2">
            Verify your identity to appear in search results
          </p>
          <Link
            href="/verify"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 active:bg-amber-800 inline-block focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
          >
            Verify Identity
          </Link>
        </div>
      )}

      {!subscription && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-700">
            Upgrade to Pro Bundle for AI Concierge, Tier 1 ranking, and Trust
            Badge.{' '}
            <Link href="/subscribe" className="underline font-semibold">
              Upgrade now ($9.99/mo)
            </Link>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/jobs"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">💼 Browse Jobs</h2>
          <p className="text-slate-700">Find and apply to job opportunities</p>
        </Link>
        <Link
          href="/profile"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">👤 Edit Profile</h2>
          <p className="text-slate-700">Update your profile and availability</p>
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
                    <p className="text-slate-700">
                      {job.status} • ${job.agreed_rate}/hr
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-red-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-700">No jobs yet. Browse available jobs!</p>
        )}
      </div>
    </div>
  )
}

