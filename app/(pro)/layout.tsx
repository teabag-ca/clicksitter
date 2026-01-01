import Link from 'next/link'
import { createClientWithRLS } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              ClickSitter
            </Link>
            <div className="flex gap-4 items-center">
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-blue-600"
              >
                Jobs
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-blue-600"
              >
                Profile
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

