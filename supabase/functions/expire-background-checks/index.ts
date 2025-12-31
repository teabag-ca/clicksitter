import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find all background checks that have expired
    const now = new Date().toISOString()
    
    const { data: expiredProfiles, error } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('background_check_status', 'active')
      .lt('background_check_expires_at', now)

    if (error) {
      console.error('Error fetching expired profiles:', error)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!expiredProfiles || expiredProfiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired background checks found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update status to expired
    const userIds = expiredProfiles.map((p) => p.user_id)
    
    const { error: updateError } = await supabase
      .from('professional_profiles')
      .update({ background_check_status: 'expired' })
      .in('user_id', userIds)

    if (updateError) {
      console.error('Error updating expired profiles:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profiles' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${expiredProfiles.length} expired background checks`,
        count: expiredProfiles.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Cron job error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

