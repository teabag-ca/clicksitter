import twilio from 'twilio'
import { redis } from '@/lib/redis/client'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const phoneNumber = process.env.TWILIO_PHONE_NUMBER!

const client = twilio(accountSid, authToken)

// OTP expiration time: 10 minutes
const OTP_EXPIRY = 10 * 60 // 10 minutes in seconds

export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in Redis with expiration
    const otpKey = `otp:${phone}`
    await redis.set(otpKey, code, { ex: OTP_EXPIRY })
    
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your ClickSitter verification code is: ${code}. Valid for 10 minutes.`,
      from: phoneNumber,
      to: phone,
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error sending OTP:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to send verification code' 
    }
  }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  try {
    const otpKey = `otp:${phone}`
    const storedCode = await redis.get<string>(otpKey)
    
    if (!storedCode) {
      return false
    }
    
    if (storedCode !== code) {
      return false
    }
    
    // OTP verified, remove it
    await redis.del(otpKey)
    return true
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return false
  }
}

