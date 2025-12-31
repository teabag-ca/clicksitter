import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'report.completed' || type === 'report.disposition') {
      const reportId = data.id
      const status = data.status
      const disposition = data.disposition

      const supabase = await createServiceRoleClient()

      // Find professional profile with this report ID
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('user_id')
        .eq('checkr_report_id', reportId)
        .single()

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      // Update background check status
      let backgroundCheckStatus = 'none'
      if (status === 'complete' && disposition === 'clear') {
        backgroundCheckStatus = 'active'
        // Set expiry to 12 months from now
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 12)

        await supabase
          .from('professional_profiles')
          .update({
            background_check_status: 'active',
            background_check_expires_at: expiresAt.toISOString(),
          })
          .eq('user_id', profile.user_id)
      } else if (disposition === 'consider') {
        backgroundCheckStatus = 'failed'
        await supabase
          .from('professional_profiles')
          .update({ background_check_status: 'failed' })
          .eq('user_id', profile.user_id)
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Checkr webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

