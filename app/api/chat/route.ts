import { createClientWithRLS } from '@/lib/supabase/server'
import { getDailyCounter, incrementDailyCounter } from '@/lib/redis/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientWithRLS()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, content } = await request.json()

    if (!jobId || !content) {
      return NextResponse.json(
        { error: 'Missing jobId or content' },
        { status: 400 }
      )
    }

    // Verify user has access to this job
    const { data: job } = await supabase
      .from('jobs')
      .select('parent_id, professional_id, status')
      .eq('id', jobId)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.parent_id !== user.id && job.professional_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if this is a new chat (Parent Throttle)
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('job_id', jobId)
      .limit(1)

    const isNewChat = existingMessages?.length === 0

    if (isNewChat && job.parent_id === user.id) {
      // Check user role and subscription
      const { data: userData } = await supabase
        .from('users')
        .select('role, phone_verified')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'parent') {
        // Check subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .eq('plan_type', 'parent_subscriber')
          .eq('status', 'active')
          .single()

        if (!subscription) {
          return NextResponse.json(
            { error: 'Subscription required to start chats' },
            { status: 403 }
          )
        }

        // Check phone verification and throttle
        if (!userData.phone_verified) {
          const dailyChatCount = await getDailyCounter(`chats:${user.id}`)
          if (dailyChatCount >= 10) {
            return NextResponse.json(
              { error: 'Daily chat limit reached. Please verify your phone number.' },
              { status: 429 }
            )
          }
          await incrementDailyCounter(`chats:${user.id}`)
        }
      }
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        job_id: jobId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Update job status to 'chatting' if it's 'open'
    if (job.status === 'open') {
      await supabase
        .from('jobs')
        .update({ status: 'chatting' })
        .eq('id', jobId)
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

