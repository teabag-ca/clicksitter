import { createClientWithRLS } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function JobsPage() {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Loading...</div>
  }

  // Get open jobs (not yet assigned)
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, users!jobs_parent_id_fkey(email)')
    .eq('status', 'open')
    .is('professional_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      <div className="space-y-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job: any) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {new Date(job.start_time).toLocaleDateString()}
                  </h3>
                  <p className="text-gray-600 mb-2">{job.description}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{job.number_of_kids} kids</span>
                    <span>${job.agreed_rate}/hr</span>
                    <span>
                      {new Date(job.start_time).toLocaleTimeString()} -{' '}
                      {new Date(job.end_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/(pro)/jobs/${job.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No open jobs available at the moment.</p>
        )}
      </div>
    </div>
  )
}

