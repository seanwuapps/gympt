import OpenAI from 'openai'
import { env } from '../db/env'

let client: OpenAI | null = null

export function getAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: env.AI_API_KEY,
      baseURL: env.AI_BASE_URL,
    })
  }
  return client
}

export async function summarizeSession(_input: unknown) {
  // Placeholder for T022; intentionally unimplemented for now
  throw new Error('summarizeSession not implemented')
}
