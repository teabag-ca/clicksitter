import { checkTokenBucket, getDailyCounter, incrementDailyCounter } from '@/lib/redis/client'
import { createServiceRoleClient } from '@/lib/supabase/server'

export type AIFeatureType = 'onboarding' | 'bio_generation' | 'voice_calendar' | 'job_summary'

export async function checkAIRateLimit(
  userId: string,
  featureType: AIFeatureType
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createServiceRoleClient()
  
  // Get user's tier level
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('tier_level, last_ai_reset_at')
    .eq('user_id', userId)
    .single()

  if (!profile) {
    return { allowed: false, reason: 'Profile not found' }
  }

  const tierLevel = profile.tier_level || 0
  const isFree = tierLevel === 0

  // Free tier: 5 AI interactions total (bio generation only)
  if (isFree) {
    if (featureType !== 'bio_generation') {
      return { allowed: false, reason: 'Feature requires Pro Bundle subscription' }
    }

    const dailyCount = await getDailyCounter(`ai:free:${userId}`)
    if (dailyCount >= 5) {
      return { allowed: false, reason: 'Daily AI limit reached (5 interactions)' }
    }

    return { allowed: true }
  }

  // Premium tier: 50 interactions per day using token bucket
  const bucketKey = `ai:premium:${userId}`
  const result = await checkTokenBucket(bucketKey, 50, 50 / 86400, 1) // 50 tokens, refill 50 per day

  if (!result.allowed) {
    return { allowed: false, reason: 'Daily AI limit reached (50 interactions)' }
  }

  return { allowed: true }
}

export async function logAIUsage(
  userId: string,
  featureType: AIFeatureType,
  tokensUsed?: number
) {
  const supabase = await createServiceRoleClient()
  
  // Log usage
  await supabase.from('ai_usage_logs').insert({
    user_id: userId,
    feature_type: featureType,
    tokens_used: tokensUsed,
  })

  // Increment daily counter for free tier
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('tier_level')
    .eq('user_id', userId)
    .single()

  if (profile?.tier_level === 0) {
    await incrementDailyCounter(`ai:free:${userId}`)
  }
}

