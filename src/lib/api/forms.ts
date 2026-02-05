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
import type { Form, FormInput, FormUpdateInput, FormType, FormStatus } from '@/types'

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
  status?: FormStatus
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
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  // 使用 crypto API 生成安全随机数
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(6)
    crypto.getRandomValues(array)
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  // 最终降级方案（仅在 crypto 不可用时使用）
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 创建新表单
 */
export async function createForm(options: CreateFormOptions): Promise<Form> {
  const supabase = createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 生成唯一的 short_id
  let shortId = generateShortId()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
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

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  const {
    status,
    type,
    search,
    sortBy = 'updated_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = options

  // 构建查询
  let query = supabase
    .from('forms')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // 状态筛选
  if (status) {
    query = query.eq('status', status)
  }

  // 类型筛选
  if (type) {
    query = query.eq('type', type)
  }

  // 搜索
  if (search) {
    query = query.ilike('title', `%${search}%`)
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

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single()

  if (error) {
    throw new Error(`获取表单失败: ${error.message}`)
  }

  // 检查权限：只有表单创建者可以访问
  if (user && data.user_id !== user.id) {
    throw new Error('无权访问此表单')
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
 * 更新表单
 */
export async function updateForm(formId: string, updates: FormUpdateInput): Promise<Form> {
  const supabase = createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 验证权限
  const existingForm = await getFormById(formId)
  if (existingForm.user_id !== user.id) {
    throw new Error('无权修改此表单')
  }

  // 更新时自动更新 updated_at
  const { data, error } = await supabase
    .from('forms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', formId)
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

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 验证权限
  const existingForm = await getFormById(formId)
  if (existingForm.user_id !== user.id) {
    throw new Error('无权删除此表单')
  }

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)

  if (error) {
    throw new Error(`删除表单失败: ${error.message}`)
  }
}

/**
 * 复制表单
 */
export async function duplicateForm(formId: string): Promise<Form> {
  const supabase = createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 获取原表单
  const originalForm = await getFormById(formId)
  if (originalForm.user_id !== user.id) {
    throw new Error('无权复制此表单')
  }

  // 生成新的 short_id
  let shortId = generateShortId()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
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

  // 创建新表单（复制原表单数据）
  const newFormData = {
    user_id: user.id,
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
 */
export async function incrementFormViewCount(formId: string): Promise<void> {
  const supabase = createClient()

  // 使用 RPC 调用或直接更新
  const { error } = await supabase.rpc('increment_view_count', {
    form_id: formId,
  })

  // 如果 RPC 不存在，使用直接更新
  if (error && error.message.includes('function')) {
    await supabase
      .from('forms')
      .update({
        view_count: (await getFormByShortId(formId)).view_count + 1,
      })
      .eq('id', formId)
  }
}

/**
 * 增加表单回复次数
 */
export async function incrementFormResponseCount(formId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.rpc('increment_response_count', {
    form_id: formId,
  })

  // 如果 RPC 不存在，使用直接更新
  if (error && error.message.includes('function')) {
    await supabase
      .from('forms')
      .update({
        response_count: (await getFormByShortId(formId)).response_count + 1,
      })
      .eq('id', formId)
  }
}
