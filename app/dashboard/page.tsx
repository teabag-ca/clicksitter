import { createClientWithRLS } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role === 'parent') {
    return <ParentDashboard />
  } else if (userData?.role === 'professional') {
    return <ProDashboard />
  }

  // Default redirect if role is not set
  redirect('/')
}

