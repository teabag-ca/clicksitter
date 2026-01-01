import { createClientWithRLS } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ParentDashboard() {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Loading...</div>
  }

  // Get user's jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, professional_profiles(bio, hourly_rate)')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('plan_type', 'parent_subscriber')
    .eq('status', 'active')
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-600">
          Find trusted caregivers for your family
        </p>
      </div>

      {!subscription && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Subscribe to unlock unlimited chats and full background checks.{' '}
            <Link href="/subscribe" className="underline font-semibold">
              Subscribe now ($19/mo)
            </Link>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/search"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">🔍 Search Caregivers</h2>
          <p className="text-gray-600">
            Find verified caregivers in your area
          </p>
        </Link>
        <Link
          href="/jobs/new"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">➕ Post a Job</h2>
          <p className="text-gray-600">
            Create a job posting for caregivers to apply
          </p>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Jobs</h2>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {new Date(job.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      {job.status} • {job.number_of_kids} kids
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No jobs yet. Post your first job!</p>
        )}
      </div>
    </div>
  )
}

