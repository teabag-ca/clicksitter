import { createClientWithRLS } from '@/lib/supabase/server'
import { createVerificationSession } from '@/lib/stripe/identity'
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

    const returnUrl = `${request.nextUrl.origin}/(pro)/verify?verified=true`

    const { sessionId, clientSecret } = await createVerificationSession(
      user.id,
      returnUrl
    )

    // Store session ID in profile
    await supabase
      .from('professional_profiles')
      .upsert({
        user_id: user.id,
        stripe_verification_session_id: sessionId,
      })

    return NextResponse.json({ clientSecret, sessionId })
  } catch (error) {
    console.error('Error creating verification session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

