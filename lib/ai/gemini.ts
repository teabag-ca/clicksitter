import { generateText, generateObject, streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Initialize the Google Gemini model
const model = google('gemini-2.0-flash-exp', {
  apiKey: process.env.GOOGLE_AI_API_KEY!,
})

export async function generateStructuredOutput<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T
): Promise<{ object: z.infer<T>; usage?: { promptTokens?: number; completionTokens?: number } }> {
  const result = await generateObject({
    model,
    schema,
    prompt,
  })

  return {
    object: result.object,
    usage: result.usage,
  }
}

export async function generateTextResponse(prompt: string): Promise<string> {
  const result = await generateText({
    model,
    prompt,
  })

  return result.text
}

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Convert messages to AI SDK format
  const aiMessages = messages.map((msg) => ({
    role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: msg.content,
  }))

  const result = await generateText({
    model,
    messages: aiMessages,
  })

  return result.text
}

export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  // Convert messages to AI SDK format
  const aiMessages = messages.map((msg) => ({
    role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: msg.content,
  }))

  return streamText({
    model,
    messages: aiMessages,
  })
}

