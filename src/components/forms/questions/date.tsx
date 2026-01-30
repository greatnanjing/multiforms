/* ============================================
   MultiForms Date Question Component

   日期题组件：
   - 编辑状态：配置日期格式和范围
   - 填写状态：日期选择器
   - 支持多种日期格式
============================================ */

'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateQuestionProps, DateFormat, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface DateProps extends DateQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Helpers
// ============================================

const formatDateForDisplay = (dateStr: string, format: DateFormat): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`
    case 'MM-DD':
      return `${month}-${day}`
    case 'YYYY-MM':
      return `${year}-${month}`
    default:
      return `${year}-${month}-${day}`
  }
}

// ============================================
// Main Component
// ============================================

export function Date({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  placeholder = '请选择日期',
  defaultValue,
  value,
  onChange,
  error,
  disabled = false,
  format = 'YYYY-MM-DD',
  minDate,
  maxDate,
  className
}: DateProps) {
  const [internalValue, setInternalValue] = useState<string>(
    (typeof value === 'string' ? value : '') || (typeof defaultValue === 'string' ? defaultValue : '')
  )
  const [touched, setTouched] = useState(false)

  const currentValue = value !== undefined ? value : internalValue

  // 转换为 input 需要的格式 (YYYY-MM-DD)
  const toInputFormat = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  const inputFormat = toInputFormat(currentValue)

  // 验证
  const validate = (val: string): string | undefined => {
    if (required && !val) {
      return '此题为必填项'
    }
    if (val) {
      const date = new Date(val)
      if (isNaN(date.getTime())) {
        return '请输入有效的日期'
      }
      if (minDate) {
        const min = new Date(minDate)
        if (date < min) {
          return `日期不能早于 ${formatDateForDisplay(minDate, format)}`
        }
      }
      if (maxDate) {
        const max = new Date(maxDate)
        if (date > max) {
          return `日期不能晚于 ${formatDateForDisplay(maxDate, format)}`
        }
      }
    }
    return undefined
  }

  const validationError = touched ? validate(currentValue) : undefined
  const displayError = error || validationError

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  // 编辑模式
  if (mode === 'edit') {
    return (
      <div className={cn('question-wrapper', className)}>
        <div className="mb-4">
          <span className="text-base font-medium text-[var(--text-primary)]">
            {questionText || '未命名题目'}
          </span>
          {required && (
            <span className="ml-1 text-red-400">*</span>
          )}
        </div>

        <div className="space-y-4">
          {/* 日期格式选择 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-sm font-medium text-[var(--text-primary)] mb-3 block">
              日期格式
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['YYYY-MM-DD', 'MM-DD-YYYY', 'DD-MM-YYYY', 'MM-DD', 'YYYY-MM'] as DateFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={cn(
                    'p-3 rounded-lg border transition-all duration-200 text-sm font-mono',
                    format === fmt
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/10 text-[var(--text-secondary)] hover:border-indigo-500/30'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* 日期范围 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              日期范围
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最早日期</span>
              <span className="text-sm text-[var(--text-primary)]">
                {minDate ? formatDateForDisplay(minDate, format) : '无限制'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最晚日期</span>
              <span className="text-sm text-[var(--text-primary)]">
                {maxDate ? formatDateForDisplay(maxDate, format) : '无限制'}
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-xl border border-dashed border-white/20">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3 block">
              预览
            </span>
            <div className="glass-card p-3 rounded-lg flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">
                {format}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('question-wrapper', className)}>
      {/* 题目标题 */}
      <div className="mb-4">
        <span className="text-base font-medium text-[var(--text-primary)]">
          {questionText || '未命名题目'}
        </span>
        {required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </div>

      {/* 错误提示 */}
      {displayError && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{displayError}</span>
        </div>
      )}

      {/* 日期选择器 */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          type="date"
          value={inputFormat}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          min={minDate}
          max={maxDate}
          className={cn(
            'w-full pl-11 pr-4 py-3 rounded-xl border',
            'bg-white/5 backdrop-blur-sm',
            'text-sm text-[var(--text-primary)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            displayError ? 'border-red-500/50' : 'border-white/10',
            disabled && 'opacity-50 cursor-not-allowed',
            // 深色主题日期选择器样式
            '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
            '[&::-webkit-calendar-picker-indicator]:hover:[&::-webkit-calendar-picker-indicator]:opacity-70'
          )}
        />

        {/* 显示格式化的日期值 */}
        {currentValue && (
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            已选择: {formatDateForDisplay(currentValue, format)}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

export function DateSkeleton() {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
    </div>
  )
}
