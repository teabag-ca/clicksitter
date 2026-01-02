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
  // Type assertion needed: AI SDK v6 has complex generic types that don't always
  // infer correctly with Zod schemas. The runtime behavior is correct.
  // Using 'unknown' first is safer than 'any' per TypeScript recommendations.
  const result = await generateObject({
    model: model as unknown as Parameters<typeof generateObject>[0]['model'],
    schema,
    messages: [{ role: 'user', content: prompt }],
  } as unknown as Parameters<typeof generateObject>[0])

  return {
    object: result.object,
    // Type assertion needed: LanguageModelUsage type doesn't expose promptTokens/completionTokens
    // directly, but they are available at runtime. Accessing via type assertion.
    usage: result.usage ? {
      promptTokens: (result.usage as { promptTokens?: number }).promptTokens ?? 0,
      completionTokens: (result.usage as { completionTokens?: number }).completionTokens ?? 0,
    } : undefined,
  }
}

export async function generateTextResponse(prompt: string): Promise<string> {
  // Type assertion needed: AI SDK v6 model types don't always match expected LanguageModel type
  // The runtime behavior is correct - google() returns a compatible model.
  // Using 'unknown' first is safer than 'any' per TypeScript recommendations.
  const result = await generateText({
    model: model as unknown as Parameters<typeof generateText>[0]['model'],
    messages: [{ role: 'user', content: prompt }],
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

  // Type assertion needed: AI SDK v6 model types don't always match expected LanguageModel type
  // Using 'unknown' first is safer than 'any' per TypeScript recommendations.
  const result = await generateText({
    model: model as unknown as Parameters<typeof generateText>[0]['model'],
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

  // Type assertion needed: AI SDK v6 model types don't always match expected LanguageModel type
  // Using 'unknown' first is safer than 'any' per TypeScript recommendations.
  return streamText({
    model: model as unknown as Parameters<typeof streamText>[0]['model'],
    messages: aiMessages,
  })
}

