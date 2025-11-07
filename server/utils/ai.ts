/**
 * AI service utilities for Cloudflare Workers AI (OpenAI-compatible)
 */

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { z } from 'zod'

export interface AIRequestOptions {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxRetries?: number
  responseSchema?: z.ZodTypeAny
  schemaName?: string
}

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Call Cloudflare Workers AI using OpenAI SDK with retry logic
 */
export async function callCloudflareAI(options: AIRequestOptions): Promise<AIResponse> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxRetries = 3, responseSchema, schemaName } = options

  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey
  const baseURL = config.openaiBaseUrl
  const model = config.openaiModel

  if (!apiKey || !baseURL) {
    return {
      success: false,
      error: 'OpenAI API credentials not configured',
    }
  }

  const openai = new OpenAI({
    apiKey,
    baseURL,
  })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt}/${maxRetries}`)
      console.log(`[AI] Model: ${model}`)
      console.log(`[AI] Using schema: ${responseSchema ? schemaName : 'none (basic JSON mode)'}`)
      
      // Build completion options
      const completionOptions: OpenAI.Chat.ChatCompletionCreateParams = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: 2048,
      }

      // Use structured outputs with Zod schema if provided
      if (responseSchema && schemaName) {
        // Use zodResponseFormat with Zod v3 for compatibility
        const format = zodResponseFormat(responseSchema, schemaName)
        console.log('[AI] Response format:', JSON.stringify(format, null, 2))
        completionOptions.response_format = format
      } else {
        // Fallback to basic JSON mode
        console.log('[AI] Response format: { type: "json_object" }')
        completionOptions.response_format = { type: 'json_object' }
      }

      console.log('[AI] Sending request to Cloudflare Workers AI...')
      const completion = await openai.chat.completions.create(completionOptions)
      console.log('[AI] Response received')

      const content = completion.choices[0]?.message?.content

      if (!content) {
        console.error('[AI] No content in response')
        throw new Error('No content in AI response')
      }

      console.log('[AI] Content type:', typeof content)
      console.log('[AI] Raw response content:', typeof content === 'string' ? content.substring(0, 200) + '...' : JSON.stringify(content).substring(0, 200) + '...')

      // Parse JSON response - content might already be an object with structured outputs
      const parsedData = typeof content === 'string' ? JSON.parse(content) : content
      console.log('[AI] Successfully parsed JSON response')
      console.log('[AI] Response keys:', Object.keys(parsedData))

      return {
        success: true,
        data: parsedData,
      }
    } catch (error: any) {
      lastError = error
      console.error(`[AI] Attempt ${attempt} failed:`, error.message)
      if (error.response) {
        console.error('[AI] Error response:', error.response.data)
      }
      if (error.stack) {
        console.error('[AI] Stack trace:', error.stack)
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'AI call failed after retries',
  }
}
