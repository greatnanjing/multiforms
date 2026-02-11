// AI Analysis Edge Function for Form Submissions
// Analyzes form responses using Zhipu GLM (BigModel) API

// @ts-ignore - Deno runtime types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Extend global scope for Deno
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined
    }
  }
}

// ============================================
// Constants
// ============================================
const ANALYSIS_MAX_LENGTH = 200
const ANALYSIS_TRUNCATED_LENGTH = 197
const TOKEN_LIMIT = 300
const TOKEN_EXPIRATION_MS = 3600000 // 1 hour
const MAX_INPUT_LENGTH = 500 // Maximum length for each answer in prompt

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Zhipu GLM (BigModel) API configuration
const BIGMODEL_API_KEY = Deno.env.get('BIGMODEL_API_KEY') || ''
const BIGMODEL_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const BIGMODEL_MODEL = Deno.env.get('BIGMODEL_MODEL') || 'glm-4-flash' // glm-4-flash, glm-4-plus, glm-4-air

// Log API key configuration status (without exposing the key)
if (!BIGMODEL_API_KEY) {
  console.warn('BIGMODEL_API_KEY not configured, using rule-based analysis only')
}

// ============================================
// Type Definitions
// ============================================
interface QuestionForAnalysis {
  id: string
  question_text: string
  question_type?: string
}

serve(async (req: Request) => {
  console.log('analyze-submission function called')

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }

    const { submissionId, formTitle, questions, answers } = await req.json()
    console.log('Request received for submission:', submissionId, 'questions:', questions?.length)

    if (!submissionId || !questions || !answers) {
      console.error('Missing parameters:', { submissionId, hasQuestions: !!questions, hasAnswers: !!answers })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting AI analysis generation...')
    // Generate analysis using AI
    const analysis = await generateAnalysis(formTitle, questions, answers)
    console.log('AI analysis generated, length:', analysis?.length)

    // Update submission with analysis
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Updating submission with analysis...')
    const { error } = await supabase
      .from('form_submissions')
      .update({
        ai_analysis: analysis,
        ai_analysis_status: 'completed',
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Failed to update submission:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Analysis completed successfully for submission:', submissionId)
    return new Response(
      JSON.stringify({ success: true, analysis }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Function error:', error)

    // Try to update status to failed if we have submissionId
    try {
      const body = await req.clone().json()
      const { submissionId } = body
      if (submissionId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        await supabase
          .from('form_submissions')
          .update({
            ai_analysis_status: 'failed',
          })
          .eq('id', submissionId)
      }
    } catch {
      // Ignore errors when trying to update failed status
    }

    // Don't expose internal error details to client
    return new Response(
      JSON.stringify({ error: 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// Helper Functions
// ============================================

/**
 * Sanitize input for prompt to prevent injection attacks
 * Removes control characters and limits length
 */
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .slice(0, MAX_INPUT_LENGTH)
}

/**
 * Generate AI analysis based on form responses
 */
async function generateAnalysis(
  formTitle: string,
  questions: QuestionForAnalysis[],
  answers: Record<string, unknown>
): Promise<string> {
  // Build a summary of questions and answers for the AI
  const qaSummary = questions
    .filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')
    .map((q, idx) => {
      const answer = answers[q.id]
      let answerText = ''

      // Format different answer types
      if (Array.isArray(answer)) {
        answerText = answer.join(', ')
      } else if (typeof answer === 'object' && answer !== null) {
        answerText = JSON.stringify(answer)
      } else {
        answerText = String(answer)
      }

      // Sanitize both question and answer
      const sanitizedQuestion = sanitizeForPrompt(q.question_text)
      const sanitizedAnswer = sanitizeForPrompt(answerText)

      return `Q${idx + 1}: ${sanitizedQuestion}\nA: ${sanitizedAnswer}`
    })
    .join('\n\n')

  const sanitizedTitle = sanitizeForPrompt(formTitle || '未命名表单')

  const prompt = `请分析以下表单回答，对用户用"您"来称呼。绝对不要使用"填写者"这个词。
要求：
1. 分析不超过${ANALYSIS_MAX_LENGTH}字
2. 语言简洁精炼，用中文
3. 突出重点观点和独特见解
4. 客观中性，不带主观判断

表单标题：${sanitizedTitle}

问题与回答：
${qaSummary}

分析：`

  // Try Zhipu GLM API first, fallback to rule-based analysis
  if (BIGMODEL_API_KEY) {
    try {
      return await callBigModel(prompt)
    } catch (error) {
      console.error('BigModel API call failed:', error)
      // Fall through to rule-based analysis
    }
  }

  // Fallback: rule-based analysis if no AI API configured or API failed
  return generateRuleBasedAnalysis(questions, answers)
}

/**
 * Call Zhipu GLM (BigModel) API
 */
async function callBigModel(prompt: string): Promise<string> {
  // Generate JWT token for BigModel API
  const token = await generateBigModelToken(BIGMODEL_API_KEY)

  const response = await fetch(BIGMODEL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: BIGMODEL_MODEL,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: TOKEN_LIMIT,
      temperature: 0.7,
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('BigModel API error:', error)
    throw new Error('BigModel API error')
  }

  const data = await response.json()

  if (data.error) {
    console.error('BigModel API error:', data.error)
    throw new Error(data.error.message || 'BigModel API error')
  }

  let analysis = data.choices?.[0]?.message?.content || '分析生成中...'

  // Truncate to max length if needed
  if (analysis.length > ANALYSIS_MAX_LENGTH) {
    analysis = analysis.substring(0, ANALYSIS_TRUNCATED_LENGTH) + '...'
  }

  return analysis.trim()
}

/**
 * Generate JWT token for BigModel API
 * BigModel uses API Key in format: id.secret
 */
async function generateBigModelToken(apiKey: string): Promise<string> {
  const parts = apiKey.split('.')
  if (parts.length !== 2) {
    throw new Error('Invalid API credentials')
  }

  const [id, secret] = parts

  if (!id || !secret) {
    throw new Error('Invalid API credentials')
  }

  // Create JWT payload
  const now = Date.now()
  const payload = {
    api_key: id,
    exp: now + TOKEN_EXPIRATION_MS,
    timestamp: now,
  }

  // Create JWT header
  const header = {
    alg: 'HS256',
    sign_type: 'SIGN',
  }

  // Base64Url encode function
  function base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  // Create signature
  const dataToSign = `${encodedHeader}.${encodedPayload}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(dataToSign)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)

  // Convert signature to base64url
  const signatureArray = Array.from(new Uint8Array(signature))
  const signatureString = btoa(String.fromCharCode(...signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${dataToSign}.${signatureString}`
}

/**
 * Rule-based fallback analysis when AI APIs are not available
 * Optimized to iterate through questions only once
 */
function generateRuleBasedAnalysis(
  questions: QuestionForAnalysis[],
  answers: Record<string, unknown>
): string {
  const insights: string[] = []
  let textCount = 0
  let ratingSum = 0
  let ratingCount = 0
  let answeredCount = 0

  // Single pass through all questions
  for (const q of questions) {
    const answer = answers[q.id]

    // Skip empty answers
    if (answer === undefined || answer === null || answer === '') {
      continue
    }

    answeredCount++

    // Count text answers
    if (typeof answer === 'string' && answer.length > 20) {
      textCount++
    }

    // Count and accumulate ratings
    if (typeof answer === 'number' && answer > 0) {
      ratingSum += answer
      ratingCount++
    } else if (typeof answer === 'string' && /^\d+$/.test(answer)) {
      const num = parseInt(answer, 10)
      if (num > 0) {
        ratingSum += num
        ratingCount++
      }
    }
  }

  if (answeredCount === 0) {
    return '未提供有效回答'
  }

  // Generate insights from collected data
  if (textCount > 0) {
    insights.push(`详细回答了${textCount}道题`)
  }

  if (ratingCount > 0) {
    const avgRating = ratingSum / ratingCount
    insights.push(`平均评分${avgRating.toFixed(1)}`)
  }

  if (answeredCount >= 5) {
    insights.push('完成度高，态度认真')
  }

  return insights.length > 0
    ? insights.join('；') + '。'
    : '已完成所有必答题目'
}
