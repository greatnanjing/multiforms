/* ============================================
   MultiForms Questions API

   表单题目 CRUD API：
   - createQuestion() - 创建题目
   - createQuestions() - 批量创建题目
   - getQuestions() - 获取表单的所有题目
   - getQuestionById() - 获取单个题目详情
   - updateQuestion() - 更新题目
   - updateQuestions() - 批量更新题目
   - deleteQuestion() - 删除题目
   - reorderQuestions() - 重新排序题目
   - duplicateQuestion() - 复制题目

   Usage:
   ```ts
   import { getQuestions, createQuestion } from '@/lib/api/questions'

   const questions = await getQuestions(formId)
   const question = await createQuestion(formId, { question_text: '...', question_type: 'single_choice' })
   ```
 ============================================ */

import { createClient } from '@/lib/supabase/client'
import type { FormQuestion, QuestionInput, QuestionType, QuestionOptions, QuestionValidation } from '@/types'

// ============================================
// Types
// ============================================

/** 创建题目选项 */
export interface CreateQuestionOptions extends Partial<QuestionInput> {
  question_text: string
  question_type: QuestionType
}

/** 更新题目选项 */
export type UpdateQuestionOptions = Partial<QuestionInput>

// ============================================
// Helper Functions
// ============================================

/**
 * 生成唯一 ID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

/**
 * 验证用户是否有权限操作表单
 */
async function validateFormAccess(formId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: form } = await supabase
    .from('forms')
    .select('user_id')
    .eq('id', formId)
    .single()
  
  return form?.user_id === user.id
}

// ============================================
// API Functions
// ============================================

/**
 * 获取表单的所有题目
 */
export async function getQuestions(formId: string): Promise<FormQuestion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('form_questions')
    .select('*')
    .eq('form_id', formId)
    .order('order_index', { ascending: true })

  if (error) {
    throw new Error(`获取题目失败: ${error.message}`)
  }

  return (data || []) as FormQuestion[]
}

/**
 * 通过 ID 获取单个题目详情
 */
export async function getQuestionById(questionId: string): Promise<FormQuestion> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('form_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error) {
    throw new Error(`获取题目失败: ${error.message}`)
  }

  return data as FormQuestion
}

/**
 * 创建新题目
 */
export async function createQuestion(
  formId: string, 
  options: CreateQuestionOptions
): Promise<FormQuestion> {
  const supabase = createClient()

  // 验证权限
  const hasAccess = await validateFormAccess(formId)
  if (!hasAccess) {
    throw new Error('无权操作此表单')
  }

  // 获取当前最大 order_index
  const { data: existingQuestions } = await supabase
    .from('form_questions')
    .select('order_index')
    .eq('form_id', formId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1

  const questionData = {
    id: generateId(),
    form_id: formId,
    question_text: options.question_text,
    question_type: options.question_type,
    options: options.options || getDefaultOptions(options.question_type),
    validation: options.validation || getDefaultValidation(options.question_type),
    logic_rules: options.logic_rules || [],
    order_index: options.order_index ?? nextOrderIndex,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('form_questions')
    .insert(questionData)
    .select()
    .single()

  if (error) {
    throw new Error(`创建题目失败: ${error.message}`)
  }

  return data as FormQuestion
}

/**
 * 批量创建题目
 */
export async function createQuestions(
  formId: string,
  questions: CreateQuestionOptions[]
): Promise<FormQuestion[]> {
  const supabase = createClient()

  // 验证权限
  const hasAccess = await validateFormAccess(formId)
  if (!hasAccess) {
    throw new Error('无权操作此表单')
  }

  // 获取当前最大 order_index
  const { data: existingQuestions } = await supabase
    .from('form_questions')
    .select('order_index')
    .eq('form_id', formId)
    .order('order_index', { ascending: false })
    .limit(1)

  const startOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1

  const questionsData = questions.map((q, index) => ({
    id: generateId(),
    form_id: formId,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options || getDefaultOptions(q.question_type),
    validation: q.validation || getDefaultValidation(q.question_type),
    logic_rules: q.logic_rules || [],
    order_index: q.order_index ?? startOrderIndex + index,
    created_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from('form_questions')
    .insert(questionsData)
    .select()

  if (error) {
    throw new Error(`批量创建题目失败: ${error.message}`)
  }

  return (data || []) as FormQuestion[]
}

/**
 * 更新题目
 */
export async function updateQuestion(
  questionId: string,
  updates: UpdateQuestionOptions
): Promise<FormQuestion> {
  const supabase = createClient()

  // 获取题目信息以验证权限
  const { data: question } = await supabase
    .from('form_questions')
    .select('form_id')
    .eq('id', questionId)
    .single()

  if (!question) {
    throw new Error('题目不存在')
  }

  // 验证权限
  const hasAccess = await validateFormAccess(question.form_id)
  if (!hasAccess) {
    throw new Error('无权操作此题目')
  }

  const { data, error } = await supabase
    .from('form_questions')
    .update({
      ...updates,
    })
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    throw new Error(`更新题目失败: ${error.message}`)
  }

  return data as FormQuestion
}

/**
 * 批量更新题目
 */
export async function updateQuestions(
  questions: Array<{ id: string } & UpdateQuestionOptions>
): Promise<FormQuestion[]> {
  const supabase = createClient()

  // 验证所有题目的权限
  for (const q of questions) {
    const { data: question } = await supabase
      .from('form_questions')
      .select('form_id')
      .eq('id', q.id)
      .single()

    if (!question) {
      throw new Error(`题目 ${q.id} 不存在`)
    }

    const hasAccess = await validateFormAccess(question.form_id)
    if (!hasAccess) {
      throw new Error(`无权操作题目 ${q.id}`)
    }
  }

  const results: FormQuestion[] = []
  
  for (const q of questions) {
    const { id, ...updates } = q
    const { data, error } = await supabase
      .from('form_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`更新题目 ${id} 失败: ${error.message}`)
    }

    results.push(data as FormQuestion)
  }

  return results
}

/**
 * 删除题目
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const supabase = createClient()

  // 获取题目信息以验证权限
  const { data: question } = await supabase
    .from('form_questions')
    .select('form_id, order_index')
    .eq('id', questionId)
    .single()

  if (!question) {
    throw new Error('题目不存在')
  }

  // 验证权限
  const hasAccess = await validateFormAccess(question.form_id)
  if (!hasAccess) {
    throw new Error('无权删除此题目')
  }

  const { error } = await supabase
    .from('form_questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    throw new Error(`删除题目失败: ${error.message}`)
  }

  // 重新排序后续题目
  const { data: remainingQuestions } = await supabase
    .from('form_questions')
    .select('id, order_index')
    .eq('form_id', question.form_id)
    .gt('order_index', question.order_index)
    .order('order_index', { ascending: true })

  if (remainingQuestions && remainingQuestions.length > 0) {
    for (let i = 0; i < remainingQuestions.length; i++) {
      await supabase
        .from('form_questions')
        .update({ order_index: question.order_index + i })
        .eq('id', remainingQuestions[i].id)
    }
  }
}

/**
 * 重新排序题目
 */
export async function reorderQuestions(
  formId: string,
  questionIds: string[]
): Promise<FormQuestion[]> {
  const supabase = createClient()

  // 验证权限
  const hasAccess = await validateFormAccess(formId)
  if (!hasAccess) {
    throw new Error('无权操作此表单')
  }

  // 批量更新 order_index
  const updates = questionIds.map((id, index) => 
    supabase
      .from('form_questions')
      .update({ order_index: index })
      .eq('id', id)
  )

  await Promise.all(updates)

  // 返回更新后的题目列表
  return getQuestions(formId)
}

/**
 * 复制题目
 */
export async function duplicateQuestion(
  questionId: string,
  formId?: string
): Promise<FormQuestion> {
  const supabase = createClient()

  // 获取原题目
  const originalQuestion = await getQuestionById(questionId)

  // 验证权限
  const targetFormId = formId || originalQuestion.form_id
  const hasAccess = await validateFormAccess(targetFormId)
  if (!hasAccess) {
    throw new Error('无权操作此表单')
  }

  // 获取目标表单的当前最大 order_index
  const { data: existingQuestions } = await supabase
    .from('form_questions')
    .select('order_index')
    .eq('form_id', targetFormId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextOrderIndex = (existingQuestions?.[0]?.order_index ?? -1) + 1

  // 创建新题目（复制数据）
  const newQuestionData = {
    id: generateId(),
    form_id: targetFormId,
    question_text: `${originalQuestion.question_text} (副本)`,
    question_type: originalQuestion.question_type,
    options: originalQuestion.options,
    validation: originalQuestion.validation,
    logic_rules: originalQuestion.logic_rules,
    order_index: nextOrderIndex,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('form_questions')
    .insert(newQuestionData)
    .select()
    .single()

  if (error) {
    throw new Error(`复制题目失败: ${error.message}`)
  }

  return data as FormQuestion
}

/**
 * 批量复制题目（用于复制表单时的题目复制）
 */
export async function duplicateQuestions(
  sourceFormId: string,
  targetFormId: string
): Promise<FormQuestion[]> {
  const supabase = createClient()

  // 验证权限
  const hasAccess = await validateFormAccess(targetFormId)
  if (!hasAccess) {
    throw new Error('无权操作目标表单')
  }

  // 获取源表单的所有题目
  const sourceQuestions = await getQuestions(sourceFormId)

  if (sourceQuestions.length === 0) {
    return []
  }

  // 批量创建新题目
  const newQuestionsData = sourceQuestions.map((q, index) => ({
    id: generateId(),
    form_id: targetFormId,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    validation: q.validation,
    logic_rules: q.logic_rules,
    order_index: index,
    created_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from('form_questions')
    .insert(newQuestionsData)
    .select()

  if (error) {
    throw new Error(`批量复制题目失败: ${error.message}`)
  }

  return (data || []) as FormQuestion[]
}

// ============================================
// Helper Functions
// ============================================

/**
 * 获取默认选项配置
 */
function getDefaultOptions(questionType: QuestionType): QuestionOptions {
  switch (questionType) {
    case 'single_choice':
    case 'multiple_choice':
      return {
        choices: [
          { id: '1', label: '选项 1', value: 'option-1' },
          { id: '2', label: '选项 2', value: 'option-2' },
        ],
        allow_other: false,
        other_label: '其他',
      }
    
    case 'dropdown':
      return {
        choices: [
          { id: '1', label: '选项 1', value: 'option-1' },
          { id: '2', label: '选项 2', value: 'option-2' },
        ],
      }
    
    case 'rating':
      return {
        rating_type: 'star',
        rating_max: 5,
        rating_min: 1,
      }
    
    case 'text':
      return {
        placeholder: '请输入...',
      }
    
    case 'textarea':
      return {
        placeholder: '请输入详细内容...',
      }

    case 'number':
      return {
        number_min: 0,
        number_max: 100,
        number_step: 1,
      }
    
    case 'date':
      return {
        date_format: 'YYYY-MM-DD',
      }
    
    case 'email':
      return {
        placeholder: 'example@email.com',
      }
    
    case 'phone':
      return {
        placeholder: '请输入手机号码',
      }
    
    case 'file_upload':
      return {
        max_file_size: 10 * 1024 * 1024, // 10MB
        allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        max_file_count: 5,
      }
    
    case 'matrix':
      return {
        matrix_rows: ['行 1', '行 2'],
        matrix_columns: ['列 1', '列 2', '列 3'],
      }
    
    case 'sorting':
      return {
        sortable_items: ['项目 1', '项目 2', '项目 3'],
      }
    
    default:
      return {}
  }
}

/**
 * 获取默认验证规则
 */
function getDefaultValidation(questionType: QuestionType): QuestionValidation {
  switch (questionType) {
    case 'text':
      return {
        required: false,
        max_length: 200,
      }

    case 'textarea':
      return {
        required: false,
        min_length: 0,
        max_length: 1000,
      }

    case 'number':
      return {
        required: false,
      }

    case 'email':
      return {
        required: false,
        pattern: '^[\\w-\\.]+@[\\w-]+\\.[a-z]{2,10}$',
        custom_message: '请输入有效的邮箱地址',
      }

    case 'phone':
      return {
        required: false,
        pattern: '^1[3-9]\\d{9}$',
        custom_message: '请输入有效的手机号码',
      }

    case 'date':
      return {
        required: false,
      }

    case 'single_choice':
    case 'multiple_choice':
    case 'dropdown':
    case 'rating':
    case 'file_upload':
    case 'matrix':
    case 'sorting':
    default:
      return {
        required: false,
      }
  }
}

// ============================================
// Public API Functions (No Auth Required)
// ============================================

/**
 * 公开获取表单题目（用于表单填写页）
 * 不需要认证，只需表单是公开的
 */
export async function getPublicQuestions(formId: string): Promise<FormQuestion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('form_questions')
    .select('*')
    .eq('form_id', formId)
    .order('order_index', { ascending: true })

  if (error) {
    throw new Error(`获取题目失败: ${error.message}`)
  }

  return (data || []) as FormQuestion[]
}
