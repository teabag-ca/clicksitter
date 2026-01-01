import { generateText, generateObject, streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Initialize the Google Gemini model
// @ai-sdk/google reads GOOGLE_GENERATIVE_AI_API_KEY from environment by default
// We'll set it via process.env for compatibility
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY
}

const model = google('gemini-2.0-flash-exp')

export async function generateStructuredOutput<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T
): Promise<{ object: z.infer<T>; usage?: { promptTokens?: number; completionTokens?: number } }> {
  const result = await generateObject({
    model: model as any,
    schema,
    prompt,
  } as any) // Type assertion needed due to AI SDK v6 type complexity

  return {
    object: result.object,
    usage: result.usage ? {
      promptTokens: (result.usage as any).promptTokens ?? 0,
      completionTokens: (result.usage as any).completionTokens ?? 0,
    } : undefined,
  }
}

export async function generateTextResponse(prompt: string): Promise<string> {
  const result = await generateText({
    model: model as any,
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
    model: model as any,
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
    model: model as any,
    messages: aiMessages,
  })
}

