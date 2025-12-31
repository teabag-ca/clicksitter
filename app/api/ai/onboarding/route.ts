import { checkAIRateLimit, logAIUsage } from '@/lib/ai/rate-limit'
import { generateStructuredOutput } from '@/lib/ai/gemini'
import { createClientWithRLS } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ONBOARDING_SCHEMA = z.object({
  name: z.string().optional(),
  hasCPR: z.boolean().optional(),
  experience: z.string().optional(),
  hourlyRate: z.number().optional(),
  bio: z.string().optional(),
  isComplete: z.boolean(),
  nextQuestion: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientWithRLS()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    const rateLimitCheck = await checkAIRateLimit(user.id, 'onboarding')
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.reason },
        { status: 429 }
      )
    }

    const { message, conversationHistory } = await request.json()

    // Build conversation context
    const conversationPrompt = conversationHistory
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `You are an AI assistant helping a caregiver create their profile on ClickSitter. 
Ask friendly, conversational questions to gather:
- Name
- Whether they have CPR training
- Years of experience
- Desired hourly rate
- A brief bio

Current conversation:
${conversationPrompt}

User: ${message}

Extract any information provided and determine:
- isComplete: true if you have all required info (name, experience, hourlyRate, bio), false otherwise
- nextQuestion: the next question to ask (or "Thank you! Your profile is complete." if done)`

    const result = await generateStructuredOutput(fullPrompt, ONBOARDING_SCHEMA)
    const response = result.object

    // Log usage with token count if available
    const totalTokens = result.usage
      ? (result.usage.promptTokens || 0) + (result.usage.completionTokens || 0)
      : undefined
    await logAIUsage(user.id, 'onboarding', totalTokens)

    // If complete, save to database
    if (response.isComplete && response.name) {
      const { error } = await supabase.from('professional_profiles').upsert({
        user_id: user.id,
        bio: response.bio || '',
        hourly_rate: response.hourlyRate || null,
      })

      if (error) {
        console.error('Error saving profile:', error)
      }
    }

    return NextResponse.json({
      response: response.nextQuestion,
      isComplete: response.isComplete,
      extractedData: response,
    })
  } catch (error) {
    console.error('AI onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

