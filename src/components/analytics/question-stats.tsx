/* ============================================
   MultiForms Question Stats Component

   题目统计组件：
   - 选择题：横向柱状图
   - 评分题：星级分布图
   - 文本题：回复列表预览
============================================ */

'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionStats } from '@/types'

// ============================================
// Types
// ============================================

interface QuestionStatsCardProps {
  /** 题目统计数据 */
  stats: QuestionStats
  /** 题目序号 */
  index: number
  /** 是否展开 */
  defaultExpanded?: boolean
}

// ============================================
// Helper Components
// ============================================

/** 选择题统计 - 横向柱状图 */
function ChoiceDistribution({
  distribution,
  totalCount,
}: {
  distribution: QuestionStats['choice_distribution']
  totalCount: number
}) {
  if (!distribution || distribution.length === 0) {
    return <div className="text-sm text-[var(--text-muted)]">暂无数据</div>
  }

  return (
    <div className="flex flex-col gap-3">
      {distribution.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          {/* Label */}
          <div className="min-w-[100px] sm:min-w-[120px] text-sm text-[var(--text-secondary)]">
            {item.option}
          </div>

          {/* Bar Track */}
          <div className="flex-1 h-9 bg-white/5 rounded-lg overflow-hidden relative">
            {/* Bar Fill */}
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3 text-sm font-medium text-white transition-all duration-600"
              style={{
                width: `${item.percentage}%`,
                background: 'linear-gradient(90deg, var(--primary-start), var(--primary-end))',
              }}
            >
              {item.count}
            </div>
          </div>

          {/* Percentage */}
          <div className="min-w-[50px] text-sm text-[var(--text-secondary)] text-right">
            {item.percentage}%
          </div>
        </div>
      ))}
    </div>
  )
}

/** 评分题统计 - 星级分布 */
function RatingDistribution({
  stats,
}: {
  stats: NonNullable<QuestionStats['rating_stats']>
}) {
  const { avg, min, max, distribution } = stats
  const maxRating = Math.max(...Object.keys(distribution).map(k => Number(k)))

  // 计算总回复数
  const totalResponses = Object.values(distribution).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Average Rating */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-500/10">
        <span className="text-sm text-[var(--text-secondary)]">平均分</span>
        <span className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {avg}
          <span className="text-sm text-[var(--text-secondary)] ml-1">/ {maxRating}.0</span>
        </span>
      </div>

      {/* Distribution */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: maxRating }, (_, i) => {
          const rating = maxRating - i
          const count = distribution[rating] || 0
          const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0

          return (
            <div key={rating} className="flex items-center gap-3">
              {/* Stars */}
              <div className="min-w-[80px] sm:min-w-[100px] flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: maxRating }).map((_, j) => (
                  <Star
                    key={j}
                    className={cn(
                      'w-3.5 h-3.5 sm:w-4 sm:h-4',
                      j < rating ? 'fill-current' : 'fill-transparent'
                    )}
                  />
                ))}
              </div>

              {/* Bar Track */}
              <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center pl-3 text-sm font-medium text-white"
                  style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
                  }}
                >
                  {percentage > 10 && `${percentage}%`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 文本题统计 - 回复预览 */
function TextAnswers({
  answers,
}: {
  answers: string[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayCount = isExpanded ? answers.length : Math.min(3, answers.length)

  if (answers.length === 0) {
    return <div className="text-sm text-[var(--text-muted)]">暂无回复</div>
  }

  return (
    <div className="flex flex-col gap-2">
      {answers.slice(0, displayCount).map((answer, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg bg-white/5 text-sm text-[var(--text-secondary)]"
        >
          {answer.length > 100 ? `${answer.slice(0, 100)}...` : answer}
        </div>
      ))}

      {answers.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-1 py-2 text-sm text-[var(--primary-glow)] hover:underline"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              查看全部 {answers.length} 条回复
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function QuestionStatsCard({ stats, index, defaultExpanded = true }: QuestionStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="p-5 sm:p-6 rounded-2xl border bg-[var(--bg-secondary)] border-white/[0.08]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {index}. {stats.question_text}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 ml-2" />
        )}
      </button>

      {/* Response Info */}
      <div className="mt-2 text-sm text-[var(--text-muted)]">
        {stats.response_count} 人回答 · {stats.skip_count} 人跳过
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4">
          {/* Single/Multiple Choice */}
          {(stats.question_type === 'single_choice' || stats.question_type === 'multiple_choice') && (
            <ChoiceDistribution distribution={stats.choice_distribution} totalCount={stats.response_count} />
          )}

          {/* Rating */}
          {stats.question_type === 'rating' && stats.rating_stats && (
            <RatingDistribution stats={stats.rating_stats} />
          )}

          {/* Text/Textarea */}
          {/* Note: For text answers, we'd need to fetch actual responses. This is a placeholder */}
          {(stats.question_type === 'text' || stats.question_type === 'textarea') && (
            <div className="text-sm text-[var(--text-muted)]">
              文本题请在下方「查看原始回复」中查看详细内容
            </div>
          )}

          {/* Other types */}
          {!['single_choice', 'multiple_choice', 'rating', 'text', 'textarea'].includes(stats.question_type) && (
            <div className="text-sm text-[var(--text-muted)]">
              此题型暂不支持图表展示，请在下方「查看原始回复」中查看详细内容
            </div>
          )}
        </div>
      )}
    </div>
  )
}
