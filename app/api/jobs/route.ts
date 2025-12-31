import { createClientWithRLS } from '@/lib/supabase/server'
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

    // Verify user is a parent
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can create jobs' },
        { status: 403 }
      )
    }

    const { start_time, end_time, number_of_kids, description, agreed_rate } =
      await request.json()

    if (!start_time || !end_time || !number_of_kids || !description || !agreed_rate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        parent_id: user.id,
        start_time,
        end_time,
        number_of_kids: parseInt(number_of_kids),
        description,
        agreed_rate: parseInt(agreed_rate),
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: job.id, ...job })
  } catch (error) {
    console.error('Job creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

