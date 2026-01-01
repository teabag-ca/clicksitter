// Quick test script to verify Upstash Redis connection
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

async function testRedis() {
  try {
    console.log('Testing Redis connection...')
    
    // Test set/get
    await redis.set('test:connection', 'success')
    const value = await redis.get('test:connection')
    console.log('✅ Redis connection successful!')
    console.log('Test value:', value)
    
    // Test counter
    const count = await redis.incr('test:counter')
    console.log('✅ Counter test:', count)
    
    // Cleanup
    await redis.del('test:connection', 'test:counter')
    console.log('✅ Redis is working correctly!')
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message)
    process.exit(1)
  }
}

testRedis()
