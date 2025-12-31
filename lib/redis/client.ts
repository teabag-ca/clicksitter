import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getDailyCounter(key: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const counterKey = `${key}:${today}`
  const count = await redis.get<number>(counterKey)
  return count ?? 0
}

export async function incrementDailyCounter(key: string, ttl: number = 86400): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const counterKey = `${key}:${today}`
  return await redis.incr(counterKey)
}

export async function resetDailyCounter(key: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const counterKey = `${key}:${today}`
  await redis.del(counterKey)
}

// Token bucket for rate limiting
export async function checkTokenBucket(
  key: string,
  capacity: number,
  refillRate: number,
  tokens: number = 1
): Promise<{ allowed: boolean; remaining: number }> {
  const bucketKey = `bucket:${key}`
  const now = Date.now()
  
  // Get current bucket state
  const bucket = await redis.get<{ tokens: number; lastRefill: number }>(bucketKey)
  
  if (!bucket) {
    // Initialize bucket
    await redis.set(bucketKey, { tokens: capacity, lastRefill: now }, { ex: 86400 })
    return { allowed: true, remaining: capacity - tokens }
  }
  
  // Calculate tokens to add based on time passed
  const timePassed = now - bucket.lastRefill
  const tokensToAdd = Math.floor((timePassed / 1000) * refillRate)
  const newTokens = Math.min(capacity, bucket.tokens + tokensToAdd)
  
  if (newTokens >= tokens) {
    // Allow request and update bucket
    const remaining = newTokens - tokens
    await redis.set(bucketKey, { tokens: remaining, lastRefill: now }, { ex: 86400 })
    return { allowed: true, remaining }
  }
  
  // Not enough tokens
  return { allowed: false, remaining: newTokens }
}

