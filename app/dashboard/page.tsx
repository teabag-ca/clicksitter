import { createClientWithRLS } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import ParentDashboard from '@/components/dashboard/ParentDashboard'
import ProDashboard from '@/components/dashboard/ProDashboard'

export default async function DashboardPage() {
  const supabase = await createClientWithRLS()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Try to get role from header (set by proxy.ts) to avoid duplicate query
  const headersList = await headers()
  const roleFromHeader = headersList.get('x-user-role')

  let userRole: string | null = roleFromHeader

  // Fallback to database query if header is not available
  if (!userRole) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = userData?.role || null
  }

  if (userRole === 'parent') {
    return <ParentDashboard />
  } else if (userRole === 'professional') {
    return <ProDashboard />
  }

  // Default redirect if role is not set
  redirect('/')
}

