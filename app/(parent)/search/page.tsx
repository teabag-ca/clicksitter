import { createClientWithRLS } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SearchPage() {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check subscription for full profile access
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user?.id)
    .eq('plan_type', 'parent_subscriber')
    .eq('status', 'active')
    .single()

  const isSubscriber = !!subscription

  // Get verified professionals with Trust Search algorithm
  // Tier 1: verified + background, Tier 2: verified only, then by price
  const { data: professionals } = await supabase
    .from('professional_profiles')
    .select('*, users(email)')
    .eq('identity_verified', true)
    .order('background_check_status', { ascending: false })
    .order('hourly_rate', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Caregivers</h1>

      {!isSubscriber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <Link href="/(parent)/subscribe" className="underline font-semibold">
              Subscribe
            </Link>{' '}
            to view full profiles and contact information
          </p>
        </div>
      )}

      <div className="space-y-4">
        {professionals && professionals.length > 0 ? (
          professionals.map((pro: any) => (
            <div
              key={pro.user_id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {isSubscriber ? pro.users?.email : 'Caregiver'}
                    </h3>
                    {pro.background_check_status === 'active' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        ✓ Verified + Background Check
                      </span>
                    )}
                    {pro.background_check_status !== 'active' &&
                      pro.identity_verified && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ✓ Verified
                      </span>
                      )}
                  </div>
                  <p className="text-gray-600 mb-2">
                    {isSubscriber ? pro.bio : 'Profile available to subscribers'}
                  </p>
                  <p className="font-semibold text-blue-600">
                    ${pro.hourly_rate}/hr
                  </p>
                </div>
                {isSubscriber && (
                  <Link
                    href={`/(parent)/professionals/${pro.user_id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No caregivers available yet.</p>
        )}
      </div>
    </div>
  )
}

