/* ============================================
   MultiForms Admin Form Stats Page

   管理员表单数据统计页面：
   - 查看单个表单的提交数据
   - 答题统计
   - 响应趋势

   路径: /admin/forms/{id}/stats
============================================ */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Users, Eye, TrendingUp, Calendar, Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// ============================================
// Types
// ============================================

interface Submission {
  id: string
  answers: Record<string, unknown> | null
  created_at: string
  duration_seconds: number | null
}

interface QuestionStats {
  question_id: string
  question_text: string
  question_type: string
  total_responses: number
  answer_stats: Record<string, number>
  order_index: number
}

interface FormStatsData {
  form_id: string
  form_title: string
  total_views: number
  total_responses: number
  completion_rate: number
  avg_duration: number
  daily_stats: Array<{
    date: string
    responses: number
  }>
  question_stats: QuestionStats[]
}

// ============================================
// Components
// ============================================

function StatsCard({
  icon,
  label,
  value,
  unit = '',
  color = 'purple',
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  unit?: string
  color?: 'purple' | 'green' | 'cyan' | 'pink' | 'orange'
}) {
  const colorClasses = {
    purple: 'bg-purple-500/15 text-purple-400',
    green: 'bg-green-500/15 text-green-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    pink: 'bg-pink-500/15 text-pink-400',
    orange: 'bg-orange-500/15 text-orange-400',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
    </div>
  )
}

function QuestionStatCard({ stat, index }: { stat: QuestionStats; index: number }) {
  const isChoice = ['single_choice', 'multiple_choice'].includes(stat.question_type)
  const answers = stat.answer_stats || {}
  const totalAnswers = Object.values(answers).reduce((sum, count) => sum + count, 0)

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--primary-glow)]">
              {index + 1}.
            </span>
            <h3 className="text-base font-medium text-white">{stat.question_text || '未命名题目'}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>{stat.question_type === 'single_choice' ? '单选题' : stat.question_type === 'multiple_choice' ? '多选题' : stat.question_type}</span>
            <span>•</span>
            <span>{stat.total_responses} 人回答</span>
          </div>
        </div>
      </div>

      {isChoice && Object.keys(answers).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(answers)
            .sort(([, a], [, b]) => b - a)
            .map(([answer, count]) => {
              const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
              return (
                <div key={answer}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)] truncate flex-1 mr-3">{answer || '未填写'}</span>
                    <span className="text-white font-medium whitespace-nowrap">{count} 次 ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        <div className="text-sm text-[var(--text-muted)]">
          {Object.entries(answers).map(([key, value]) => (
            <div key={key} className="flex justify-between py-1">
              <span>{key || '未填写'}</span>
              <span className="text-white">{value} 次</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function AdminFormStatsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [stats, setStats] = useState<FormStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载表单统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // 获取表单基本信息
        const { data: form, error: formError } = await supabase
          .from('forms')
          .select('id, title, view_count, response_count')
          .eq('id', formId)
          .single()

        if (formError || !form) {
          throw new Error('表单不存在')
        }

        // 获取提交数据
        const { data: submissions, error: submissionsError } = await supabase
          .from('form_submissions')
          .select('id, answers, created_at, duration_seconds')
          .eq('form_id', formId)

        if (submissionsError) throw submissionsError

        const submissionList = submissions || []

        // 计算完成率
        const completionRate = form.view_count > 0
          ? Math.round((submissionList.length / form.view_count) * 100)
          : 0

        // 计算平均时长
        const durations = submissionList
          .map((s: Submission) => s.duration_seconds)
          .filter((d: unknown): d is number => typeof d === 'number' && d !== null && d !== undefined)
        const avgDuration = durations.length > 0
          ? Math.round(durations.reduce((sum: number, d: number) => sum + d, 0) / durations.length)
          : 0

        // 按日期统计 - 生成最近7天完整数据
        const dailyStatsMap = new Map<string, number>()
        submissionList.forEach((s: Submission) => {
          const date = new Date(s.created_at).toLocaleDateString('zh-CN')
          dailyStatsMap.set(date, (dailyStatsMap.get(date) || 0) + 1)
        })

        // 生成最近7天的完整日期范围
        const dailyStats: Array<{ date: string; responses: number }> = []
        const today = new Date()
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toLocaleDateString('zh-CN')
          dailyStats.push({
            date: dateStr,
            responses: dailyStatsMap.get(dateStr) || 0
          })
        }

        // 获取题目数据
        const { data: questions, error: questionsError } = await supabase
          .from('form_questions')
          .select('id, question_text, question_type, order_index')
          .eq('form_id', formId)
          .order('order_index', { ascending: true })

        if (questionsError) throw questionsError

        // 统计每道题的答案
        const questionStats: QuestionStats[] = (questions || []).map((q: { id: string; question_text: string; question_type: string; order_index: number }) => {
          const answerStats: Record<string, number> = {}

          submissionList.forEach((submission: Submission) => {
            const answer = submission.answers?.[q.id]
            if (!answer) return

            if (Array.isArray(answer)) {
              answer.forEach(a => {
                answerStats[a] = (answerStats[a] || 0) + 1
              })
            } else {
              const answerKey = String(answer)
              answerStats[answerKey] = (answerStats[answerKey] || 0) + 1
            }
          })

          return {
            question_id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            total_responses: Object.values(answerStats).reduce((sum, count) => sum + count, 0),
            answer_stats: answerStats,
            order_index: q.order_index,
          }
        })

        setStats({
          form_id: form.id,
          form_title: form.title,
          total_views: form.view_count || 0,
          total_responses: submissionList.length,
          completion_rate: completionRate,
          avg_duration: avgDuration,
          daily_stats: dailyStats,
          question_stats: questionStats,
        })
      } catch (err: any) {
        console.error('Failed to load stats:', err)
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [formId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
              <p className="text-sm text-[var(--text-muted)]">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-[var(--text-secondary)] mb-4">{error || '加载失败'}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回表单列表
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{stats.form_title}</h1>
            <p className="text-[var(--text-secondary)]">表单数据统计</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出数据
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Eye className="w-5 h-5" />}
            label="总浏览量"
            value={stats.total_views}
            color="purple"
          />
          <StatsCard
            icon={<Users className="w-5 h-5" />}
            label="总提交数"
            value={stats.total_responses}
            color="green"
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="完成率"
            value={stats.completion_rate}
            unit="%"
            color="cyan"
          />
          <StatsCard
            icon={<Calendar className="w-5 h-5" />}
            label="平均时长"
            value={Math.floor(stats.avg_duration / 60)}
            unit="分钟"
            color="orange"
          />
        </div>

        {/* 每日统计 */}
        {stats.daily_stats.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">最近7天提交趋势</h2>
            <div className="relative h-48">
              {/* Y轴坐标线 */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-white/5 w-full h-0"></div>
                <div className="border-b border-white/5 w-full h-0"></div>
                <div className="border-b border-white/5 w-full h-0"></div>
                <div className="border-b border-white/5 w-full h-0"></div>
                <div className="border-b border-white/10 w-full h-0"></div>
              </div>
              {/* 柱状图区域 */}
              <div className="absolute inset-0 flex items-end justify-around px-2 pb-6">
                {stats.daily_stats.map((day, index) => {
                  const maxValue = Math.max(...stats.daily_stats.map(d => d.responses))
                  const hasData = maxValue > 0
                  const heightPercent = hasData ? (day.responses / maxValue) * 85 : 0
                  const isToday = index === stats.daily_stats.length - 1
                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full w-12">
                      {/* 数值标签 */}
                      <div className="text-sm font-semibold text-white mb-2 h-5">
                        {day.responses}
                      </div>
                      {/* 柱子 */}
                      <div
                        className={cn(
                          'w-10 rounded-t-lg transition-all duration-500 relative group',
                          day.responses > 0
                            ? 'bg-gradient-to-t from-purple-600 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border border-white/10'
                        )}
                        style={{ height: day.responses > 0 ? `${Math.max(heightPercent, 8)}%` : '4px' }}
                      >
                        {/* Hover tooltip */}
                        {day.responses > 0 && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/90 text-white text-sm px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-10">
                            {day.responses} 次
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                          </div>
                        )}
                      </div>
                      {/* 日期标签 */}
                      <div className="text-xs text-[var(--text-muted)] text-center mt-2">
                        <div className={cn(
                          day.responses === 0 && 'text-white/30'
                        )}>
                          {day.date.split('/')[2]}日
                        </div>
                        {isToday && (
                          <div className="text-[10px] text-purple-400">今天</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {Math.max(...stats.daily_stats.map(d => d.responses)) === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] mt-2">
                最近7天暂无提交数据
              </p>
            )}
          </div>
        )}

        {/* 题目统计 */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">答题统计</h2>
          {stats.question_stats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.question_stats.map((stat, index) => (
                <QuestionStatCard key={stat.question_id} stat={stat} index={index} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-[var(--text-muted)]">
              暂无题目数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
