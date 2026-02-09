/* ============================================
   MultiForms Form Submissions API

   表单提交 API：
   - submitFormAnswer() - 提交表单答案
   - getFormSubmissions() - 获取表单的所有提交
   - getSubmissionById() - 获取单个提交详情
   - deleteSubmission() - 删除提交

   Usage:
   ```ts
   import { submitFormAnswer, getFormSubmissions } from '@/lib/api/submissions'

   await submitFormAnswer(formId, answers, durationSeconds)
   const submissions = await getFormSubmissions(formId)
   ```
============================================ */

import { createClient } from '@/lib/supabase/client'
import { generateId } from '@/lib/utils'
import type { SubmissionAnswers } from '@/types'

// ============================================
// Types
// ============================================

/** 提交表单答案选项 */
export interface SubmitFormOptions {
  /** 表单 ID */
  formId: string
  /** 答案数据 */
  answers: SubmissionAnswers
  /** 填写时长（秒） */
  durationSeconds?: number
  /** 会话 ID（用于追踪匿名用户） */
  sessionId?: string
}

/** 表单提交记录 */
export interface FormSubmission {
  id: string
  form_id: string
  user_id: string | null
  session_id: string | null
  submitter_ip: string | null
  submitter_user_agent: string | null
  submitter_location: {
    country?: string
    city?: string
    ip?: string
    latitude?: number
    longitude?: number
  } | null
  answers: SubmissionAnswers
  duration_seconds: number | null
  status: 'draft' | 'completed'
  created_at: string
  updated_at: string
}

/** 获取提交列表选项 */
export interface GetSubmissionsOptions {
  /** 分页 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 排序字段 */
  sortBy?: 'created_at' | 'updated_at'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 状态筛选 */
  status?: string
}

// ============================================
// Helper Functions
// ============================================

// Helper functions 已移至 @/lib/utils.ts

/**
 * 获取客户端 IP（需要在服务端调用）
 */
async function getClientIP(): Promise<string | null> {
  // 在浏览器环境中无法获取真实 IP，返回 null
  // 服务端可以通过 request headers 获取
  if (typeof window !== 'undefined') {
    return null
  }
  return null
}

/**
 * 获取 User Agent
 */
function getUserAgent(): string | null {
  if (typeof window !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent
  }
  return null
}

// ============================================
// API Functions
// ============================================

/**
 * 提交表单答案（通过 Edge Function，无需登录）
 */
export async function submitFormAnswer(options: SubmitFormOptions): Promise<FormSubmission> {
  const { formId, answers, durationSeconds, sessionId } = options

  // 获取 Supabase URL 和 anon key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 配置未找到')
  }

  // 构建 Edge Function URL
  const baseUrl = supabaseUrl.replace(/\/$/, '')
  const functionUrl = `${baseUrl}/functions/v1/submit-form`

  console.log('Calling Edge Function:', functionUrl)

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      formId,
      answers,
      durationSeconds,
      sessionId,
    }),
  })

  console.log('Response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Edge Function error response:', errorText)
    throw new Error(`提交失败 (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  console.log('Edge Function result:', result)

  if (!result.success) {
    throw new Error(result.error || '提交失败，请稍后重试')
  }

  return result.data as FormSubmission
}

/**
 * 获取表单的所有提交（仅表单所有者）
 */
export async function getFormSubmissions(
  formId: string,
  options: GetSubmissionsOptions = {}
): Promise<{ data: FormSubmission[]; total: number }> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 验证表单权限
  const { data: form } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限
    .single()

  if (!form) {
    throw new Error('表单不存在')
  }

  const {
    page = 1,
    pageSize = 50,
    sortBy = 'created_at',
    sortOrder = 'desc',
    status,
  } = options

  // 构建查询
  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    .eq('form_id', formId)

  // 状态筛选
  if (status) {
    query = query.eq('status', status)
  }

  // 排序
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // 分页
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`获取提交记录失败: ${error.message}`)
  }

  return {
    data: (data || []) as FormSubmission[],
    total: count || 0,
  }
}

/**
 * 通过 ID 获取单个提交详情（仅表单所有者）
 */
export async function getSubmissionById(submissionId: string): Promise<FormSubmission> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 获取提交记录和表单（JOIN 查询验证权限）
  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .select('*, forms!inner(user_id)')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    throw new Error(`获取提交记录失败: ${subError?.message || '不存在'}`)
  }

  // 验证权限
  if ((submission as any).forms.user_id !== session.user.id) {
    throw new Error('无权访问此提交记录')
  }

  return submission as FormSubmission
}

/**
 * 删除提交记录（仅表单所有者）
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 获取提交记录和表单信息（JOIN 查询验证权限）
  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .select('form_id, forms!inner(user_id, response_count)')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    throw new Error(`提交记录不存在: ${subError?.message || ''}`)
  }

  // 验证权限
  const form = (submission as any).forms
  if (form.user_id !== session.user.id) {
    throw new Error('无权删除此提交记录')
  }

  // 删除提交
  const { error } = await supabase
    .from('form_submissions')
    .delete()
    .eq('id', submissionId)

  if (error) {
    throw new Error(`删除提交记录失败: ${error.message}`)
  }

  // 减少表单响应计数
  const { error: countError } = await supabase
    .from('forms')
    .update({
      response_count: Math.max(0, (form.response_count || 1) - 1),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submission.form_id)

  if (countError) {
    console.warn('Failed to decrement response count:', countError)
  }
}

/**
 * 批量删除提交记录（仅表单所有者）
 */
export async function deleteSubmissions(submissionIds: string[]): Promise<void> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 获取所有提交记录的表单 ID（同时验证权限）
  const { data: submissions } = await supabase
    .from('form_submissions')
    .select('form_id, forms!inner(user_id)')
    .in('id', submissionIds)

  if (!submissions || submissions.length === 0) {
    return
  }

  // 验证权限：所有提交必须属于同一用户的表单
  const formIds = [...new Set(submissions.map((s: any) => s.form_id))]

  for (const sub of submissions) {
    if ((sub as any).forms.user_id !== session.user.id) {
      throw new Error(`无权删除表单 ${(sub as any).form_id} 的提交记录`)
    }
  }

  // 批量删除
  const { error } = await supabase
    .from('form_submissions')
    .delete()
    .in('id', submissionIds)

  if (error) {
    throw new Error(`批量删除失败: ${error.message}`)
  }

  // 更新响应计数（简单处理：重新统计）
  for (const formId of formIds) {
    const { data: countData } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('form_id', formId)

    const { error: countError } = await supabase
      .from('forms')
      .update({
        response_count: countData?.count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formId)

    if (countError) {
      console.warn(`Failed to update response count for form ${formId}:`, countError)
    }
  }
}
