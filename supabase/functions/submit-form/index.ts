import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// CORS headers - 完整的 CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    // Validate form exists and is published
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, status, max_responses, response_count, expires_at')
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
