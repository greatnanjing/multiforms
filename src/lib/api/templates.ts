/* ============================================
   MultiForms Template API

   从模板创建表单的 API：
   - createFormFromTemplate() - 从模板创建表单
   - getTemplateById() - 获取模板详情
   - getAllTemplates() - 获取所有模板

   Usage:
   ```ts
   import { createFormFromTemplate } from '@/lib/api/templates'

   const form = await createFormFromTemplate('activity-vote')
   // 返回创建的表单，可以直接跳转到编辑页面
   router.push(`/forms/${form.id}/edit`)
   ```
============================================ */

import { createClient } from '@/lib/supabase/client'
import { createForm, deleteForm, type CreateFormOptions } from '@/lib/api/forms'
import { createQuestions } from '@/lib/api/questions'
import { getTemplateById, getTemplatesForShowcase, type TemplateId } from '@/lib/templates/definitions'
import type { Form } from '@/types'

// ============================================
// Types
// ============================================

/** 创建表单从模板的结果 */
export interface CreateFormFromTemplateResult {
  form: Form
  questionsCreated: boolean
  questionsCount?: number
}

// ============================================
// API Functions
// ============================================

/**
 * 从模板创建表单
 * @param templateId 模板ID
 * @param options 可选配置
 * @returns 创建的表单
 * @throws {Error} 当模板不存在或创建失败时抛出错误
 */
export async function createFormFromTemplate(
  templateId: TemplateId | string,
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

  // 获取模板定义
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`模板不存在: ${templateId}`)
  }

  // 使用模板配置创建表单
  let form: Form | null = null

  try {
    form = await createForm({
      title: options?.title || template.formConfig.title,
      description: template.formConfig.description,
      type: template.type,
      access_type: template.formConfig.access_type,
      max_per_user: template.formConfig.max_per_user,
      max_responses: template.formConfig.max_responses,
      show_results: template.formConfig.show_results,
    } as CreateFormOptions)
  } catch (error) {
    throw new Error(`创建表单失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  // 批量创建模板中的题目
  if (template.questions.length > 0) {
    try {
      const questions = template.questions.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        validation: q.validation,
      }))
      await createQuestions(form.id, questions)
    } catch (error) {
      // 题目创建失败时，删除已创建的表单以保持原子性
      console.error('创建模板题目失败，正在回滚表单:', error)
      try {
        await deleteForm(form.id)
      } catch (deleteError) {
        console.error('删除回滚表单失败:', deleteError)
      }
      throw new Error(`创建表单题目失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return form
}

/**
 * 获取所有模板列表
 */
export function getAllTemplates() {
  return getTemplatesForShowcase()
}

/**
 * 获取模板详情
 */
export function getTemplate(templateId: string) {
  return getTemplateById(templateId)
}
