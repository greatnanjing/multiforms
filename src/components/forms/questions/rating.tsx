/* ============================================
   MultiForms Rating Question Component

   评分题组件：
   - 编辑状态：可配置评分类型和范围
   - 填写状态：星级/数字/滑块/emoji评分
============================================ */

'use client'

import { useState } from 'react'
import { Star, Minus, Plus as PlusIcon, Smile, Meh, Frown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RatingQuestionProps, RatingType, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface RatingProps extends RatingQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Constants
// ============================================

const QUESTION_TYPE_LABEL = '评分题'

// ============================================
// Helpers
// ============================================

const emojiRatingMap: Record<number, { icon: React.ReactNode; label: string }> = {
  1: { icon: <Frown className="w-6 h-6" />, label: '非常不满意' },
  2: { icon: <Meh className="w-6 h-6" />, label: '不满意' },
  3: { icon: <Meh className="w-6 h-6" />, label: '一般' },
  4: { icon: <Smile className="w-6 h-6" />, label: '满意' },
  5: { icon: <Star className="w-6 h-6 fill-current" />, label: '非常满意' },
}

// ============================================
// Subcomponents
// ============================================

/** 星级评分 */
function StarRating({
  value,
  max = 5,
  onChange,
  disabled,
  labels
}: {
  value?: number
  max?: number
  onChange?: (value: number) => void
  disabled?: boolean
  labels?: Record<number, string>
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const currentValue = value !== undefined ? value : 0
  const displayValue = hoverValue !== null ? hoverValue : currentValue

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => {
          const rating = i + 1
          const filled = rating <= displayValue
          return (
            <button
              key={i}
              type="button"
              onClick={() => !disabled && onChange?.(rating)}
              onMouseEnter={() => !disabled && setHoverValue(rating)}
              onMouseLeave={() => setHoverValue(null)}
              disabled={disabled}
              className={cn(
                'transition-all duration-150',
                !disabled && 'hover:scale-110',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Star
                className={cn(
                  'w-8 h-8',
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-white/20'
                )}
              />
            </button>
          )
        })}
      </div>
      {labels && displayValue > 0 && (
        <span className="ml-2 text-sm text-[var(--text-secondary)]">
          {labels[displayValue] || `${displayValue}星`}
        </span>
      )}
    </div>
  )
}

/** 数字评分 */
function NumberRating({
  value,
  min = 1,
  max = 10,
  onChange,
  disabled,
  labels
}: {
  value?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  disabled?: boolean
  labels?: Record<number, string>
}) {
  const currentValue = value !== undefined ? value : min

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={(e) => onChange?.(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'flex-1 h-2 rounded-full appearance-none cursor-pointer',
            'bg-white/10',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110'
          )}
        />
        <span className="w-12 text-center text-lg font-semibold text-[var(--text-primary)] font-mono">
          {currentValue}
        </span>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>{labels?.[min] || min}</span>
        <span>{labels?.[max] || max}</span>
      </div>
      {labels && labels[currentValue] && (
        <div className="text-center text-sm text-[var(--text-secondary)]">
          {labels[currentValue]}
        </div>
      )}
    </div>
  )
}

/** 滑块评分 */
function SliderRating({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled,
  labels
}: {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  disabled?: boolean
  labels?: Record<number, string>
}) {
  const currentValue = value !== undefined ? value : min
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className="space-y-4">
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{min}</span>
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xl font-semibold text-[var(--text-primary)] font-mono">
            {currentValue}
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{max}</span>
      </div>
      {labels && labels[currentValue] && (
        <div className="text-center text-sm text-[var(--text-secondary)]">
          {labels[currentValue]}
        </div>
      )}
    </div>
  )
}

/** Emoji 评分 */
function EmojiRating({
  value,
  max = 5,
  onChange,
  disabled
}: {
  value?: number
  max?: number
  onChange?: (value: number) => void
  disabled?: boolean
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const currentValue = value !== undefined ? value : 0
  const displayValue = hoverValue !== null ? hoverValue : currentValue

  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: max }).map((_, i) => {
        const rating = i + 1
        const selected = rating === displayValue
        const { icon, label } = emojiRatingMap[rating]

        return (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange?.(rating)}
            onMouseEnter={() => !disabled && setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
              selected
                ? 'border-indigo-500 bg-indigo-500/10 scale-110'
                : 'border-white/10 bg-white/5 hover:border-indigo-500/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={label}
          >
            <div className={cn(
              'transition-colors',
              selected ? 'text-yellow-400' : 'text-[var(--text-muted)]'
            )}>
              {icon}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function Rating({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  defaultValue,
  value,
  onChange,
  error,
  disabled = false,
  ratingType = 'star',
  max = 5,
  min = 1,
  labels,
  className
}: RatingProps) {
  const [internalValue, setInternalValue] = useState<number | undefined>(
    (typeof value === 'number' ? value : undefined) || (typeof defaultValue === 'number' ? defaultValue : undefined)
  )
  const [internalType, setInternalType] = useState<RatingType>(ratingType)

  // 确保 currentValue 始终是 number 类型
  const currentValue: number = value !== undefined
    ? (typeof value === 'number' ? value : parseFloat(String(value)) || 0)
    : internalValue ?? 0

  const handleChange = (newValue: number) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  // 编辑模式：显示配置面板
  if (mode === 'edit') {
    return (
      <div className={cn('question-wrapper', className)}>
        {questionText && (
          <div className="mb-4">
            <span className="text-base font-medium text-[var(--text-primary)]">
              {questionText}
            </span>
            {required && (
              <span className="ml-1 text-red-400">*</span>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* 评分类型选择 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-sm font-medium text-[var(--text-primary)] mb-3 block">
              评分类型
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['star', 'number', 'slider', 'emoji'] as RatingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInternalType(type)}
                  className={cn(
                    'p-3 rounded-lg border transition-all duration-200 text-sm font-medium',
                    internalType === type
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/10 text-[var(--text-secondary)] hover:border-indigo-500/30'
                  )}
                >
                  {type === 'star' && '星级'}
                  {type === 'number' && '数字'}
                  {type === 'slider' && '滑块'}
                  {type === 'emoji' && '表情'}
                </button>
              ))}
            </div>
          </div>

          {/* 范围设置 */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-sm text-[var(--text-secondary)]">
              评分范围
            </span>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => {/* handled by parent */}}
              >
                <Minus className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <span className="w-16 text-center text-sm text-[var(--text-primary)]">
                {min} - {max}
              </span>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => {/* handled by parent */}}
              >
                <PlusIcon className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-xl border border-dashed border-white/20">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3 block">
              预览
            </span>
            <RatingPreview
              type={internalType}
              min={min}
              max={max}
              labels={labels}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('question-wrapper', className)}>
      {/* 题目标题 - 仅在非 preview 模式且非空时显示 */}
      {mode !== 'preview' && questionText && (
        <div className="mb-4 flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-medium text-[var(--text-primary)]">
            {questionText}
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded-md">
            {QUESTION_TYPE_LABEL}
          </span>
          {required && (
            <span className="text-red-400">*</span>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 评分组件 */}
      <div>
        {ratingType === 'star' && (
          <StarRating
            value={currentValue}
            max={max}
            onChange={handleChange}
            disabled={disabled}
            labels={labels}
          />
        )}
        {ratingType === 'number' && (
          <NumberRating
            value={currentValue}
            min={min}
            max={max}
            onChange={handleChange}
            disabled={disabled}
            labels={labels}
          />
        )}
        {ratingType === 'slider' && (
          <SliderRating
            value={currentValue}
            min={min}
            max={max}
            onChange={handleChange}
            disabled={disabled}
            labels={labels}
          />
        )}
        {ratingType === 'emoji' && (
          <EmojiRating
            value={currentValue}
            max={max}
            onChange={handleChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  )
}

// ============================================
// Preview Component (for edit mode)
// ============================================

function RatingPreview({
  type,
  min,
  max,
  labels
}: {
  type: RatingType
  min: number
  max: number
  labels?: Record<number, string>
}) {
  if (type === 'star') {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(max, 5) }).map((_, i) => (
          <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
        ))}
      </div>
    )
  }

  if (type === 'number') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-[var(--text-primary)] font-mono">
          7
        </span>
        <span className="text-xs text-[var(--text-muted)]">/ {max}</span>
      </div>
    )
  }

  if (type === 'slider') {
    return (
      <div className="space-y-2">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-full" />
        </div>
        <div className="text-center text-sm font-semibold text-[var(--text-primary)] font-mono">
          60
        </div>
      </div>
    )
  }

  if (type === 'emoji') {
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const { icon } = emojiRatingMap[i + 1]
          return (
            <div key={i} className="text-[var(--text-muted)]">
              {icon}
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

// ============================================
// Skeleton Component
// ============================================

interface RatingSkeletonProps {
  type?: RatingType
}

export function RatingSkeleton({ type = 'star' }: RatingSkeletonProps) {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="h-10 w-40 bg-white/5 rounded-full animate-pulse" />
    </div>
  )
}
