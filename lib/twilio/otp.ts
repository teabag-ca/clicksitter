import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const phoneNumber = process.env.TWILIO_PHONE_NUMBER!

const client = twilio(accountSid, authToken)

// Store OTP codes temporarily (in production, use Redis)
const otpStore = new Map<string, { code: string; expiresAt: number }>()

export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    // Store OTP
    otpStore.set(phone, { code, expiresAt })
    
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your ClickSitter verification code is: ${code}. Valid for 10 minutes.`,
      from: phoneNumber,
      to: phone,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}

export function verifyOTP(phone: string, code: string): boolean {
  const stored = otpStore.get(phone)
  
  if (!stored) {
    return false
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone)
    return false
  }
  
  if (stored.code !== code) {
    return false
  }
  
  // OTP verified, remove it
  otpStore.delete(phone)
  return true
}

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now()
  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone)
    }
  }
}, 60000) // Run every minute

