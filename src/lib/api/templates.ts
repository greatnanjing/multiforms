/* ============================================
   MultiForms Template API

   从模板创建表单的 API：
   - createFormFromTemplate() - 从数据库模板创建表单

   Usage:
   ```ts
   import { createFormFromTemplate } from '@/lib/api/templates'

   const form = await createFormFromTemplate('template-uuid')
   // 返回创建的表单，可以直接跳转到编辑页面
   router.push(`/forms/${form.id}/edit`)
   ```
============================================ */

import { createClient } from '@/lib/supabase/client'
import { createForm, deleteForm, getFormById, type CreateFormOptions } from '@/lib/api/forms'
import { createQuestions } from '@/lib/api/questions'
import type { Form, FormQuestion } from '@/types'

// ============================================
// Types
// ============================================

/** 数据库模板类型 */
interface DatabaseTemplate {
  id: string
  title: string
  description: string | null
  category: string
  demo_form_id: string | null
  use_count?: number
}

// ============================================
// API Functions
// ============================================

/**
 * 判断是否为 UUID 格式的模板 ID（数据库模板）
 */
function isUUID(templateId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(templateId)
}

/**
 * 从数据库模板创建表单
 * @param templateId 数据库模板 ID (UUID)
 * @param options 可选配置
 * @returns 创建的表单
 */
async function createFormFromDatabaseTemplate(
  templateId: string,
  options?: { title?: string }
): Promise<Form> {
  const supabase = createClient()

  // 获取数据库模板
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_active', true)
    .single()

  if (templateError || !template) {
    throw new Error(`模板不存在: ${templateId}`)
  }

  const dbTemplate = template as DatabaseTemplate

  // 如果模板有关联的示例表单，复制该表单
  if (dbTemplate.demo_form_id) {
    try {
      // 获取示例表单
      const demoForm = await getFormById(dbTemplate.demo_form_id)
      if (!demoForm) {
        throw new Error('示例表单不存在')
      }

      // 获取示例表单的所有题目
      const { data: demoQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', dbTemplate.demo_form_id)
        .order('sort_order', { ascending: true })

      // 创建新表单（复制示例表单的配置）
      const newForm = await createForm({
        title: options?.title || dbTemplate.title,
        description: dbTemplate.description || demoForm.description,
        type: demoForm.type,
        access_type: demoForm.access_type,
        max_per_user: demoForm.max_per_user,
        max_responses: demoForm.max_responses,
        show_results: demoForm.show_results,
      } as CreateFormOptions)

      // 复制题目
      if (demoQuestions && demoQuestions.length > 0) {
        try {
          const questions = demoQuestions.map((q: FormQuestion) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            validation: q.validation,
          }))
          await createQuestions(newForm.id, questions)
        } catch (error) {
          // 题目创建失败时，删除已创建的表单以保持原子性
          console.error('创建模板题目失败，正在回滚表单:', error)
          try {
            await deleteForm(newForm.id)
          } catch (deleteError) {
            console.error('删除回滚表单失败:', deleteError)
          }
          throw new Error(`创建表单题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }

      // 增加模板使用计数
      await supabase
        .from('templates')
        .update({ use_count: (template.use_count || 0) + 1 })
        .eq('id', templateId)

      return newForm
    } catch (error) {
      if (error instanceof Error && error.message.includes('不存在')) {
        throw error
      }
      // 如果复制示例表单失败，尝试创建空白表单
      console.warn('复制示例表单失败，创建空白表单:', error)
    }
  }

  // 没有关联示例表单或复制失败，创建空白表单
  return createForm({
    title: options?.title || dbTemplate.title,
    description: dbTemplate.description || '',
    type: 'collection',
    access_type: 'public',
  } as CreateFormOptions)
}

/**
 * 从模板创建表单
 * @param templateId 数据库模板 ID (UUID)
 * @param options 可选配置
 * @returns 创建的表单
 * @throws {Error} 当模板不存在或创建失败时抛出错误
 */
export async function createFormFromTemplate(
  templateId: string,
  options?: {
    /** 自定义表单标题 */
    title?: string
  }
): Promise<Form> {
  // 验证输入
  if (!templateId || typeof templateId !== 'string') {
    throw new Error('无效的模板ID')
  }

  if (templateId.length > 100) {
    throw new Error('模板ID过长')
  }

  // 仅支持从数据库模板创建
  if (!isUUID(templateId)) {
    throw new Error(`无效的模板ID格式: ${templateId}`)
  }

  return createFormFromDatabaseTemplate(templateId, options)
}
