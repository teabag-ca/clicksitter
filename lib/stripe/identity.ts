import { stripe } from './client'

export async function createVerificationSession(
  userId: string,
  returnUrl: string
): Promise<{ sessionId: string; clientSecret: string }> {
  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: {
      user_id: userId,
    },
    options: {
      document: {
        allowed_types: ['driving_license', 'passport', 'id_card'],
      },
    },
    return_url: returnUrl,
  })

  return {
    sessionId: session.id,
    clientSecret: session.client_secret || '',
  }
}

export async function getVerificationSession(sessionId: string) {
  return await stripe.identity.verificationSessions.retrieve(sessionId)
}

