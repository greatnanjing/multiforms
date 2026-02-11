import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// CORS headers - 完整的 CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// ============================================
// AI Analysis Constants
// ============================================
const ANALYSIS_MAX_LENGTH = 200
const ANALYSIS_TRUNCATED_LENGTH = 197
const TOKEN_LIMIT = 300
const TOKEN_EXPIRATION_MS = 3600000 // 1 hour
const MAX_INPUT_LENGTH = 500 // Maximum length for each answer in prompt

// Zhipu GLM (BigModel) API configuration
const BIGMODEL_API_KEY = Deno.env.get('BIGMODEL_API_KEY') || ''
const BIGMODEL_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const BIGMODEL_MODEL = Deno.env.get('BIGMODEL_MODEL') || 'glm-4-flash'

// Log API key configuration status (without exposing the key)
if (!BIGMODEL_API_KEY) {
  console.warn('BIGMODEL_API_KEY not configured, using rule-based analysis only')
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }

    const { formId, answers, durationSeconds, sessionId } = await req.json()

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate form exists and is published (also get title for analysis)
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, status, max_responses, response_count, expires_at, title')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      return new Response(
        JSON.stringify({ error: '表单不存在' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (form.status !== 'published') {
      return new Response(
        JSON.stringify({ error: '表单未发布，无法提交' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if expired
    if (form.expires_at && new Date(form.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: '表单已过期，无法提交' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check max responses
    if (form.max_responses && form.response_count >= form.max_responses) {
      return new Response(
        JSON.stringify({ error: '表单已达到最大响应数，无法提交' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert submission (bypasses RLS with service role key)
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        user_id: null, // Anonymous submission
        session_id: sessionId || crypto.randomUUID(),
        submitter_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        submitter_user_agent: req.headers.get('user-agent'),
        submitter_location: null,
        answers,
        duration_seconds: durationSeconds || null,
        status: 'completed',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: '提交失败', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Increment response count
    await supabase
      .from('forms')
      .update({
        response_count: (form.response_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)

    // Fetch questions and trigger AI analysis (fire and forget)
    const submissionId = data.id

    // Set initial status to processing
    await supabase
      .from('form_submissions')
      .update({
        ai_analysis_status: 'processing',
      })
      .eq('id', submissionId)

    // Trigger AI analysis asynchronously (don't await)
    performAIAnalysis(supabaseUrl, supabaseServiceKey, submissionId, formId, form.title || '', answers)
      .catch(err => {
        console.error('AI analysis failed:', err)
        // Update status to failed on error
        supabase
          .from('form_submissions')
          .update({ ai_analysis_status: 'failed' })
          .eq('id', submissionId)
          .then(() => {})
          .catch(() => {})
      })

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// AI Analysis Functions (Inlined)
// ============================================

interface QuestionForAnalysis {
  id: string
  question_text: string
  question_type?: string
}

/**
 * Perform AI analysis asynchronously
 */
async function performAIAnalysis(
  supabaseUrl: string,
  supabaseServiceKey: string,
  submissionId: string,
  formId: string,
  formTitle: string,
  answers: Record<string, any>
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch questions for this form
    const { data: questions, error: questionsError } = await supabase
      .from('form_questions')
      .select('id, question_text, question_type')
      .eq('form_id', formId)
      .order('order_index', { ascending: true })

    if (questionsError || !questions || questions.length === 0) {
      console.log('No questions found for analysis, skipping')
      await supabase
        .from('form_submissions')
        .update({ ai_analysis_status: 'failed' })
        .eq('id', submissionId)
      return
    }

    console.log('Starting AI analysis for submission:', submissionId)

    // Generate analysis
    const analysis = await generateAnalysis(formTitle, questions, answers)

    // Update submission with analysis
    const { error } = await supabase
      .from('form_submissions')
      .update({
        ai_analysis: analysis,
        ai_analysis_status: 'completed',
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Failed to update submission with analysis:', error)
      throw error
    }

    console.log('AI analysis completed for submission:', submissionId)
  } catch (error) {
    console.error('AI analysis error:', error)
    throw error
  }
}

/**
 * Sanitize input for prompt to prevent injection attacks
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
