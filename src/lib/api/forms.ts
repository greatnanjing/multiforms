/* ============================================
   MultiForms Forms API

   表单 CRUD API：
   - createForm() - 创建表单
   - getForms() - 获取用户的所有表单
   - getFormById() - 获取单个表单详情
   - getFormByShortId() - 通过 shortId 获取表单
   - updateForm() - 更新表单
   - deleteForm() - 删除表单
   - duplicateForm() - 复制表单
   - publishForm() - 发布表单
   - closeForm() - 关闭表单

   Usage:
   ```ts
   import { createForm, getForms } from '@/lib/api/forms'

   const form = await createForm({ title: 'My Form', type: 'survey' })
   const forms = await getForms()
   ```
============================================ */

import { createClient } from '@/lib/supabase/client'
import { duplicateQuestions } from './questions'
import { SHORT_ID, escapeLikePattern } from '@/lib/utils'
import type { Form, FormInput, FormUpdateInput, FormType, FormStatus, FormQuestion } from '@/types'

// ============================================
// Types
// ============================================

/** 创建表单选项 */
export interface CreateFormOptions extends Omit<FormInput, 'theme_config'> {
  /** 主题配置（可选，使用默认） */
  theme_config?: FormInput['theme_config']
}

/** 获取表单列表选项 */
export interface GetFormsOptions {
  /** 表单状态筛选 */
  status?: FormStatus | 'all'
  /** 表单类型筛选 */
  type?: FormType
  /** 搜索关键词 */
  search?: string
  /** 排序字段 */
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'response_count'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 分页 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 创建日期范围开始 (ISO 8601) */
  createdAfter?: string
  /** 创建日期范围结束 (ISO 8601) */
  createdBefore?: string
  /** 更新日期范围开始 (ISO 8601) */
  updatedAfter?: string
  /** 更新日期范围结束 (ISO 8601) */
  updatedBefore?: string
}

/** 获取表单列表响应 */
export interface GetFormsResponse {
  data: Form[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// API Functions
// ============================================

/**
 * 生成短链接 ID
 * 使用加密安全的随机数生成器
 */
export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  // 使用 crypto API 生成安全随机数
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(SHORT_ID.BYTES)
    crypto.getRandomValues(array)
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  // 最终降级方案（仅在 crypto 不可用时使用）
  let result = ''
  for (let i = 0; i < SHORT_ID.LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 创建新表单
 */
export async function createForm(options: CreateFormOptions): Promise<Form> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }
  const user = session.user

  // 生成唯一的 short_id
  let shortId = generateShortId()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < SHORT_ID.MAX_ATTEMPTS) {
    const { data } = await supabase
      .from('forms')
      .select('short_id')
      .eq('short_id', shortId)
      .single()

    if (!data) {
      isUnique = true
    } else {
      shortId = generateShortId()
      attempts++
    }
  }

  // 如果所有尝试都失败，抛出错误
  if (!isUnique) {
    throw new Error('无法生成唯一的短链接ID，请稍后重试')
  }

  // 默认主题配置
  const defaultThemeConfig = {
    theme: 'nebula' as const,
    mode: 'dark' as const,
    show_progress_bar: true,
    show_question_numbers: true,
    animation_enabled: true,
  }

  const formData = {
    user_id: user.id,
    title: options.title,
    description: options.description || null,
    type: options.type,
    status: 'draft' as FormStatus,
    short_id: shortId,
    theme_config: options.theme_config || defaultThemeConfig,
    access_type: options.access_type || 'public',
    access_password: options.access_password || null,
    max_responses: options.max_responses || null,
    max_per_user: options.max_per_user || 1,
    expires_at: options.expires_at || null,
    show_results: options.show_results || false,
    results_password: null,
    view_count: 0,
    response_count: 0,
    logo_url: null,
  }

  const { data, error } = await supabase
    .from('forms')
    .insert(formData)
    .select()
    .single()

  if (error) {
    throw new Error(`创建表单失败: ${error.message}`)
  }

  return data as Form
}

/**
 * 获取用户的所有表单
 */
export async function getForms(options: GetFormsOptions = {}): Promise<GetFormsResponse> {
  const supabase = createClient()

  // 使用 getSession() 更快，从本地缓存读取
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }
  const user = session.user

  const {
    status,
    type,
    search,
    sortBy = 'updated_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
  } = options

  // 构建查询
  let query = supabase
    .from('forms')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // 状态筛选
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // 类型筛选
  if (type) {
    query = query.eq('type', type)
  }

  // 搜索 - 转义特殊字符防止 SQL 注入
  if (search) {
    query = query.ilike('title', `%${escapeLikePattern(search)}%`)
  }

  // 创建日期范围筛选
  if (createdAfter) {
    query = query.gte('created_at', createdAfter)
  }
  if (createdBefore) {
    query = query.lte('created_at', createdBefore)
  }

  // 更新日期范围筛选
  if (updatedAfter) {
    query = query.gte('updated_at', updatedAfter)
  }
  if (updatedBefore) {
    query = query.lte('updated_at', updatedBefore)
  }

  // 排序
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // 分页
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`获取表单列表失败: ${error.message}`)
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data || []) as Form[],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * 通过 ID 获取单个表单详情
 */
export async function getFormById(formId: string): Promise<Form> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 在查询时同时验证权限（user_id 匹配），一次查询完成
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限
    .single()

  if (error) {
    throw new Error(`获取表单失败: ${error.message}`)
  }

  return data as Form
}

/**
 * 通过 shortId 获取表单（公开访问）
 */
export async function getFormByShortId(shortId: string): Promise<Form> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('short_id', shortId)
    .single()

  if (error) {
    throw new Error(`获取表单失败: ${error.message}`)
  }

  return data as Form
}

/**
 * 获取表单及其题目（编辑页面专用 - 一次查询完成）
 * 返回表单数据和题目数组，优化加载性能
 */
export async function getFormWithQuestions(
  formId: string
): Promise<{ form: Form; questions: FormQuestion[] }> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 使用 JOIN 一次查询获取表单和题目，同时验证权限
  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_questions (*)
    `)
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限
    .single()

  if (error) {
    throw new Error(`获取表单失败: ${error.message}`)
  }

  // 题目按 order_index 排序
  const questions = (data.form_questions || []).sort((a: any, b: any) => a.order_index - b.order_index)

  return {
    form: data as Form,
    questions: questions as FormQuestion[],
  }
}

/**
 * 更新表单
 */
export async function updateForm(formId: string, updates: FormUpdateInput): Promise<Form> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 在更新时同时验证权限（user_id 匹配），一次查询完成
  const { data, error } = await supabase
    .from('forms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限
    .select()
    .single()

  if (error) {
    throw new Error(`更新表单失败: ${error.message}`)
  }

  return data as Form
}

/**
 * 删除表单
 */
export async function deleteForm(formId: string): Promise<void> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 删除时同时验证权限（user_id 匹配），一次查询完成
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限

  if (error) {
    throw new Error(`删除表单失败: ${error.message}`)
  }
}

/**
 * 复制表单
 */
export async function duplicateForm(formId: string): Promise<Form> {
  const supabase = createClient()

  // 使用 getSession() 更快
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('用户未登录')
  }

  // 获取原表单（同时验证权限）
  const { data: originalForm, error: fetchError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', session.user.id) // 同时验证权限
    .single()

  if (fetchError || !originalForm) {
    throw new Error(fetchError?.message || '无权复制此表单')
  }

  // 生成新的 short_id
  let shortId = generateShortId()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < SHORT_ID.MAX_ATTEMPTS) {
    const { data } = await supabase
      .from('forms')
      .select('short_id')
      .eq('short_id', shortId)
      .single()

    if (!data) {
      isUnique = true
    } else {
      shortId = generateShortId()
      attempts++
    }
  }

  // 如果所有尝试都失败，抛出错误
  if (!isUnique) {
    throw new Error('无法生成唯一的短链接ID，请稍后重试')
  }

  // 创建新表单（复制原表单数据）
  const newFormData = {
    user_id: session.user.id,
    title: `${originalForm.title} (副本)`,
    description: originalForm.description,
    type: originalForm.type,
    status: 'draft' as FormStatus,
    short_id: shortId,
    theme_config: originalForm.theme_config,
    access_type: originalForm.access_type,
    access_password: null, // 不复制密码
    max_responses: originalForm.max_responses,
    max_per_user: originalForm.max_per_user,
    expires_at: originalForm.expires_at,
    show_results: originalForm.show_results,
    results_password: null,
    view_count: 0,
    response_count: 0,
    logo_url: originalForm.logo_url,
  }

  const { data, error } = await supabase
    .from('forms')
    .insert(newFormData)
    .select()
    .single()

  if (error) {
    throw new Error(`复制表单失败: ${error.message}`)
  }

  // 复制表单题目
  try {
    await duplicateQuestions(formId, data.id)
  } catch (error) {
    console.warn('复制表单题目失败:', error)
    // 即使题目复制失败，也返回新表单
  }

  return data as Form
}

/**
 * 发布表单
 */
export async function publishForm(formId: string): Promise<Form> {
  return updateForm(formId, {
    status: 'published',
    published_at: new Date().toISOString(),
  } as FormUpdateInput)
}

/**
 * 关闭表单
 */
export async function closeForm(formId: string): Promise<Form> {
  return updateForm(formId, {
    status: 'closed',
  })
}

/**
 * 归档表单
 */
export async function archiveForm(formId: string): Promise<Form> {
  return updateForm(formId, {
    status: 'archived',
  })
}

/**
 * 增加表单浏览次数
 * 注意：此函数在高并发时可能有竞态条件
 * 建议使用 PostgreSQL RPC 函数实现原子增量：
 * CREATE OR REPLACE FUNCTION increment_view_count(form_id UUID)
 * RETURNS void AS $$
 * BEGIN
 *   UPDATE forms SET view_count = view_count + 1 WHERE id = form_id;
 * END;
 * $$ LANGUAGE plpgsql;
 */
export async function incrementFormViewCount(formId: string): Promise<void> {
  const supabase = createClient()

  // 尝试使用 RPC 函数（如果已创建）
  try {
    const { error } = await supabase.rpc('increment_view_count', { form_id: formId })
    if (!error) return // RPC 成功则直接返回
  } catch {
    // RPC 不存在，降级到 read-modify-write 模式
  }

  // 先获取当前值，再更新（降级方案，低并发下可用）
  const { data: currentData } = await supabase
    .from('forms')
    .select('view_count')
    .eq('id', formId)
    .single()

  const currentCount = currentData?.view_count || 0

  await supabase
    .from('forms')
    .update({ view_count: currentCount + 1 })
    .eq('id', formId)
}

/**
 * 增加表单回复次数
 * 注意：此函数在高并发时可能有竞态条件
 * 建议使用 PostgreSQL RPC 函数实现原子增量
 */
export async function incrementFormResponseCount(formId: string): Promise<void> {
  const supabase = createClient()

  // 尝试使用 RPC 函数（如果已创建）
  try {
    const { error } = await supabase.rpc('increment_response_count', { form_id: formId })
    if (!error) return // RPC 成功则直接返回
  } catch {
    // RPC 不存在，降级到 read-modify-write 模式
  }

  // 先获取当前值，再更新（降级方案，低并发下可用）
  const { data: currentData } = await supabase
    .from('forms')
    .select('response_count')
    .eq('id', formId)
    .single()

  const currentCount = currentData?.response_count || 0

  await supabase
    .from('forms')
    .update({ response_count: currentCount + 1 })
    .eq('id', formId)
}
