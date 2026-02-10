/* ============================================
   MultiForms Number Question Component

   数字题组件：
   - 编辑状态：配置范围、步长、前后缀
   - 填写状态：数字输入
   - 支持加减按钮
============================================ */

'use client'

import { useState } from 'react'
import { Minus, Plus as PlusIcon, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NumberQuestionProps, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface NumberProps extends NumberQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Main Component
// ============================================

export function Number({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  placeholder = '请输入数字',
  defaultValue,
  value,
  onChange,
  error,
  disabled = false,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  className
}: NumberProps) {
  const [internalValue, setInternalValue] = useState<number | string | undefined>(
    (typeof value === 'number' ? value : undefined) || (typeof defaultValue === 'number' ? defaultValue : undefined)
  )
  const [touched, setTouched] = useState(false)

  const currentValue = value !== undefined ? value : internalValue
  const numericValue = typeof currentValue === 'number' ? currentValue : parseFloat(String(currentValue)) || 0

  // 验证
  const validate = (val: number): string | undefined => {
    if (required && (isNaN(val) || val === 0 && !currentValue)) {
      return '此题为必填项'
    }
    if (min !== undefined && val < min) {
      return `最小值为 ${min}`
    }
    if (max !== undefined && val > max) {
      return `最大值为 ${max}`
    }
    return undefined
  }

  const validationError = touched ? validate(numericValue) : undefined
  const displayError = error || validationError

  const handleChange = (newValue: number) => {
    // 限制范围
    if (min !== undefined && newValue < min) newValue = min
    if (max !== undefined && newValue > max) newValue = max

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleIncrement = () => {
    handleChange(numericValue + step)
  }

  const handleDecrement = () => {
    handleChange(numericValue - step)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      setInternalValue('')
      onChange?.(null)
      return
    }

    const num = parseFloat(val)
    if (!isNaN(num)) {
      handleChange(num)
    }
  }

  const handleBlur = () => {
    setTouched(true)
  }

  // 编辑模式
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
          {/* 范围设置 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              数值范围
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最小值</span>
              <span className="text-sm text-[var(--text-primary)] font-mono">
                {min ?? '无限制'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最大值</span>
              <span className="text-sm text-[var(--text-primary)] font-mono">
                {max ?? '无限制'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">步长</span>
              <span className="text-sm text-[var(--text-primary)] font-mono">
                {step}
              </span>
            </div>
          </div>

          {/* 前后缀设置 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              前后缀
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">前缀</span>
              <span className="text-sm text-[var(--text-primary)]">
                {prefix || '无'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">后缀</span>
              <span className="text-sm text-[var(--text-primary)]">
                {suffix || '无'}
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-xl border border-dashed border-white/20">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3 block">
              预览
            </span>
            <NumberInputPreview
              prefix={prefix}
              suffix={suffix}
              min={min}
              max={max}
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
        <div className="mb-4">
          <span className="text-base font-medium text-[var(--text-primary)]">
            {questionText}
          </span>
          {required && (
            <span className="ml-1 text-red-400">*</span>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {displayError && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{displayError}</span>
        </div>
      )}

      {/* 数字输入 */}
      <div className="flex items-center gap-3">
        {/* 减按钮 */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && numericValue <= min)}
          className={cn(
            'w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-200',
            'bg-white/5 backdrop-blur-sm',
            'border-white/10',
            'hover:border-indigo-500/30 hover:bg-white/10',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <Minus className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>

        {/* 输入框 */}
        <div className="flex-1 relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {prefix}
            </span>
          )}
          <input
            type="number"
            value={numericValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              'w-full px-4 py-3 rounded-xl border',
              'bg-white/5 backdrop-blur-sm',
              'text-lg text-center text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
              displayError ? 'border-red-500/50' : 'border-white/10',
              disabled && 'opacity-50 cursor-not-allowed',
              prefix && 'pl-8',
              suffix && 'pr-8'
            )}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {suffix}
            </span>
          )}
        </div>

        {/* 加按钮 */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && numericValue >= max)}
          className={cn(
            'w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-200',
            'bg-white/5 backdrop-blur-sm',
            'border-white/10',
            'hover:border-indigo-500/30 hover:bg-white/10',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <PlusIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* 范围提示 */}
      {(min !== undefined || max !== undefined) && !displayError && (
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {min !== undefined && max !== undefined
            ? `范围: ${min} - ${max}`
            : min !== undefined
            ? `最小值: ${min}`
            : `最大值: ${max}`}
        </p>
      )}
    </div>
  )
}

// ============================================
// Preview Component
// ============================================

function NumberInputPreview({
  prefix,
  suffix,
  min,
  max
}: {
  prefix?: string
  suffix?: string
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
        <Minus className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
      <div className="flex-1 relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
            {prefix}
          </span>
        )}
        <div className={cn(
          'w-full h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center',
          prefix && 'pl-8',
          suffix && 'pr-8'
        )}>
          <span className="text-lg text-[var(--text-primary)] font-mono">0</span>
        </div>
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
            {suffix}
          </span>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
        <PlusIcon className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

export function NumberSkeleton() {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
        <div className="flex-1 h-12 bg-white/5 rounded-xl animate-pulse" />
        <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
