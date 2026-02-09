/* ============================================
   MultiForms Template Types

   模板类型定义，所有模板均存储在数据库中
============================================ */

import type { QuestionType } from '@/types'

// ============================================
// Types
// ============================================

/** 模板展示数据 */
export interface TemplateShowcase {
  id: string
  name: string
  description: string
  type: string
  category: 'vote' | 'survey' | 'rating' | 'feedback' | 'collection'
  iconName: string
  questionsCount: number
  useCount: number
  // 数据库字段
  title?: string
  tags?: string[]
  is_featured?: boolean
  is_active?: boolean
  sort_order?: number
}

// ============================================
// API Functions
// ============================================

/**
 * 获取数据库中的模板（管理员创建的）
 * @returns 数据库模板列表
 */
export async function getDatabaseTemplates(): Promise<TemplateShowcase[]> {
  try {
    // 添加超时保护，防止数据库查询阻塞渲染
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database templates query timeout')), 5000)
    )

    // 动态导入以避免服务端导入问题
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const queryPromise = supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error || !data) {
      console.warn('Failed to fetch database templates:', error)
      return []
    }

    // 将数据库模板转换为 TemplateShowcase 格式
    return data.map((t: any) => ({
      id: t.id,
      name: t.title,
      title: t.title,
      description: t.description || '',
      type: t.category,
      category: t.category,
      tags: t.tags,
      is_featured: t.is_featured,
      is_active: t.is_active,
      sort_order: t.sort_order,
      iconName: 'FileText',
      questionsCount: 0, // TODO: 可以从 demo_form_id 关联获取
      useCount: t.use_count || 0,
    }))
  } catch (error) {
    // 超时或其他错误时，静默返回空数组
    if (error instanceof Error && error.message.includes('timeout')) {
      console.warn('[Templates] Database templates query timed out')
    } else {
      console.warn('[Templates] Error fetching database templates:', error)
    }
    return []
  }
}

/**
 * 订阅数据库模板的实时更新
 * @param callback 模板更新时的回调函数
 * @returns 取消订阅的函数
 */
export function subscribeToDatabaseTemplates(
  callback: (templates: TemplateShowcase[]) => void
): () => void {
  let channel: any = null

  // 使用动态导入避免在服务端执行
  const setupSubscription = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // 订阅 templates 表的变更
      channel = supabase
        .channel('templates-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // 监听所有变更：INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'templates',
          },
          async () => {
            // 当模板发生变化时，重新获取并回调
            const updatedTemplates = await getDatabaseTemplates()
            callback(updatedTemplates)
          }
        )
        .subscribe()

      console.log('[Templates] Realtime subscription established')
    } catch (error) {
      console.warn('[Templates] Failed to setup realtime subscription:', error)
    }
  }

  setupSubscription()

  // 返回取消订阅的函数
  return () => {
    if (channel) {
      channel.unsubscribe()
      console.log('[Templates] Realtime subscription cancelled')
    }
  }
}
