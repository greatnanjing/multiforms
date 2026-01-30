/* ============================================
   MultiForms Analytics API

   数据统计 API：
   - getFormStats() - 获取表单统计概览
   - getResponseTrend() - 获取回复趋势数据
   - getQuestionStats() - 获取题目统计数据
   - getSubmissions() - 获取原始提交数据
   - exportSubmissions() - 导出提交数据
============================================ */

import { createClient } from '@/lib/supabase/client'
import type {
  Form,
  FormOverviewStats,
  QuestionStats,
  TrendDataPoint,
  FormSubmission,
  DateRange,
  PaginatedResponse,
} from '@/types'

// ============================================
// Types
// ============================================

/** 获取统计数据选项 */
export interface GetStatsOptions {
  formId: string
}

/** 获取趋势数据选项 */
export interface GetTrendOptions {
  formId: string
  dateRange?: DateRange
}

/** 获取题目统计选项 */
export interface GetQuestionStatsOptions {
  formId: string
  questionId?: string
}

/** 获取提交数据选项 */
export interface GetSubmissionsOptions {
  formId: string
  page?: number
  pageSize?: number
  sortBy?: 'created_at' | 'duration_seconds'
  sortOrder?: 'asc' | 'desc'
}

// ============================================
// API Functions
// ============================================

/**
 * 获取表单统计概览
 */
export async function getFormStats(options: GetStatsOptions): Promise<FormOverviewStats & { form: Form }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 获取表单
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', options.formId)
    .single()

  if (formError || !form) {
    throw new Error('表单不存在')
  }

  if (form.user_id !== user.id) {
    throw new Error('无权访问此表单')
  }

  // 计算今日和本周的开始时间
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)
  const weekStartIso = weekStart.toISOString()

  // 获取本周和今日的回复数
  const { data: submissions } = await supabase
    .from('form_submissions')
    .select('created_at, duration_seconds')
    .eq('form_id', options.formId)
    .eq('status', 'completed')

  const responsesToday = submissions?.filter(s => s.created_at >= todayStart).length || 0
  const responsesThisWeek = submissions?.filter(s => s.created_at >= weekStartIso).length || 0

  // 计算平均完成时间（秒）
  const durations = submissions?.map(s => s.duration_seconds).filter((d): d is number => d !== null) || []
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  // 计算完成率（假设 view_count 包含未完成的访问）
  const completionRate = form.view_count > 0
    ? Math.round((form.response_count / form.view_count) * 100)
    : form.response_count > 0 ? 100 : 0

  return {
    form: form as Form,
    total_views: form.view_count,
    total_responses: form.response_count,
    completion_rate: completionRate,
    avg_duration: avgDuration,
    responses_today: responsesToday,
    responses_this_week: responsesThisWeek,
    responses_this_month: submissions?.filter(s => {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      return s.created_at >= monthStart
    }).length || 0,
  }
}

/**
 * 获取回复趋势数据
 */
export async function getResponseTrend(options: GetTrendOptions): Promise<TrendDataPoint[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 计算日期范围
  const now = new Date()
  let startDate = new Date()
  const dateRange = options.dateRange || '7d'

  switch (dateRange) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      startDate = new Date(2000, 0, 1)
      break
  }

  const startDateIso = startDate.toISOString()

  // 获取提交数据
  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('created_at')
    .eq('form_id', options.formId)
    .eq('status', 'completed')
    .gte('created_at', startDateIso)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`获取趋势数据失败: ${error.message}`)
  }

  // 按日期分组统计
  const trendMap = new Map<string, number>()

  // 初始化所有日期
  const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    trendMap.set(dateKey, 0)
  }

  // 统计每日回复数
  submissions?.forEach(submission => {
    const dateKey = submission.created_at.split('T')[0]
    trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1)
  })

  // 转换为数组
  return Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))
}

/**
 * 获取题目统计数据
 */
export async function getQuestionStats(options: GetQuestionStatsOptions): Promise<QuestionStats[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  // 获取表单的所有题目
  const { data: questions, error: questionsError } = await supabase
    .from('form_questions')
    .select('*')
    .eq('form_id', options.formId)
    .order('order_index', { ascending: true })

  if (questionsError) {
    throw new Error(`获取题目失败: ${questionsError.message}`)
  }

  // 获取所有提交
  const { data: submissions, error: submissionsError } = await supabase
    .from('form_submissions')
    .select('answers')
    .eq('form_id', options.formId)
    .eq('status', 'completed')

  if (submissionsError) {
    throw new Error(`获取提交数据失败: ${submissionsError.message}`)
  }

  const answers = submissions?.map(s => s.answers) || []
  const totalResponses = answers.length

  // 为每个题目计算统计
  const stats: QuestionStats[] = (questions || []).map(question => {
    const questionAnswers = answers
      .map(a => a[question.id])
      .filter(a => a !== undefined && a !== null)

    const responseCount = questionAnswers.length
    const skipCount = totalResponses - responseCount

    const baseStats: QuestionStats = {
      question_id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      response_count: responseCount,
      skip_count: skipCount,
    }

    // 选择题统计
    if (
      question.question_type === 'single_choice' ||
      question.question_type === 'multiple_choice'
    ) {
      const choices = question.options?.choices || []
      const choiceCountMap = new Map<string, number>()

      // 初始化选项计数
      choices.forEach((choice: { value: string; label: string }) => {
        choiceCountMap.set(choice.value, 0)
      })

      // 统计每个选项的选择次数
      questionAnswers.forEach(answer => {
        const values = Array.isArray(answer) ? answer : [answer]
        values.forEach(v => {
          choiceCountMap.set(v, (choiceCountMap.get(v) || 0) + 1)
        })
      })

      const choiceDistribution = choices.map((choice: { value: string; label: string }) => {
        const count = choiceCountMap.get(choice.value) || 0
        return {
          option: choice.label,
          count,
          percentage: responseCount > 0 ? Math.round((count / responseCount) * 100) : 0,
        }
      })

      return {
        ...baseStats,
        choice_distribution: choiceDistribution,
      }
    }

    // 评分题统计
    if (question.question_type === 'rating') {
      const ratings = questionAnswers.map(a => Number(a)).filter(n => !isNaN(n))
      const validRatings = ratings.length

      if (validRatings > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0)
        const avg = Math.round((sum / validRatings) * 10) / 10
        const min = Math.min(...ratings)
        const max = Math.max(...ratings)

        const distribution: Record<number, number> = {}
        const ratingMax = question.options?.rating_max || 5
        const ratingMin = question.options?.rating_min || 1

        for (let i = ratingMin; i <= ratingMax; i++) {
          distribution[i] = ratings.filter(r => r === i).length
        }

        return {
          ...baseStats,
          rating_stats: {
            avg,
            min,
            max,
            distribution,
          },
        }
      }

      return {
        ...baseStats,
        rating_stats: {
          avg: 0,
          min: 0,
          max: 0,
          distribution: {},
        },
      }
    }

    // 文本题统计
    if (
      question.question_type === 'text' ||
      question.question_type === 'textarea'
    ) {
      const textAnswers = questionAnswers.map(a => String(a)).filter(a => a.length > 0)

      if (textAnswers.length > 0) {
        const avgLength = Math.round(
          textAnswers.reduce((sum, text) => sum + text.length, 0) / textAnswers.length
        )

        // 简单词频统计
        const wordCountMap = new Map<string, number>()
        textAnswers.forEach(text => {
          const words = text.split(/\s+/).filter(w => w.length > 1)
          words.forEach(word => {
            wordCountMap.set(word, (wordCountMap.get(word) || 0) + 1)
          })
        })

        const wordCloud = Array.from(wordCountMap.entries())
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)

        return {
          ...baseStats,
          text_stats: {
            avg_length: avgLength,
            word_cloud: wordCloud,
          },
        }
      }

      return {
        ...baseStats,
        text_stats: {
          avg_length: 0,
        },
      }
    }

    return baseStats
  })

  return stats
}

/**
 * 获取原始提交数据
 */
export async function getSubmissions(
  options: GetSubmissionsOptions
): Promise<PaginatedResponse<FormSubmission>> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('用户未登录')
  }

  const {
    formId,
    page = 1,
    pageSize = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options

  // 构建查询
  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    .eq('form_id', formId)
    .eq('status', 'completed')

  // 排序
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // 分页
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`获取提交数据失败: ${error.message}`)
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data || []) as FormSubmission[],
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  }
}

/**
 * 导出提交数据为 CSV
 */
export async function exportSubmissions(options: GetSubmissionsOptions & {
  questions: Array<{ id: string; question_text: string; question_type: string }>
}): Promise<string> {
  // 首先获取总数
  const countResult = await getSubmissions({
    ...options,
    pageSize: 1,
  })

  const { data, total: totalCount } = await getSubmissions({
    ...options,
    pageSize: countResult.total, // 导出全部数据
  })

  if (!data || data.length === 0) {
    return ''
  }

  // 构建 CSV 内容
  const headers = ['提交时间', '耗时(秒)']
  options.questions.forEach(q => {
    headers.push(q.question_text)
  })

  const rows = data.map(submission => {
    const row = [
      submission.created_at,
      submission.duration_seconds?.toString() || '',
    ]
    options.questions.forEach(q => {
      const value = submission.answers[q.id]
      if (Array.isArray(value)) {
        row.push(value.join('; '))
      } else if (typeof value === 'object') {
        row.push(JSON.stringify(value))
      } else {
        row.push(value?.toString() || '')
      }
    })
    return row
  })

  // 组装 CSV
  const csvRows = [headers, ...rows]
  return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}
