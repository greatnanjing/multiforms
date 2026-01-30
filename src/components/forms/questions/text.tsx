/* ============================================
   MultiForms Text Question Component

   文本题组件：
   - 编辑状态：配置输入类型和限制
   - 填写状态：单行/多行/邮箱/电话输入
   - 支持字数限制和实时计数
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Mail, Phone, Type, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TextQuestionProps, TextType, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface TextProps extends TextQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Helpers
// ============================================

const inputTypeConfig: Record<TextType, {
  icon: React.ReactNode
  placeholder: string
  inputType?: string
  pattern?: RegExp
}> = {
  text: {
    icon: <Type className="w-4 h-4" />,
    placeholder: '请输入文本',
    inputType: 'text'
  },
  textarea: {
    icon: <AlignLeft className="w-4 h-4" />,
    placeholder: '请输入内容',
  },
  email: {
    icon: <Mail className="w-4 h-4" />,
    placeholder: '请输入邮箱地址',
    inputType: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    icon: <Phone className="w-4 h-4" />,
    placeholder: '请输入手机号码',
    inputType: 'tel',
    pattern: /^1[3-9]\d{9}$/
  }
}

// ============================================
// Main Component
// ============================================

export function Text({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  placeholder,
  defaultValue,
  value,
  onChange,
  error,
  disabled = false,
  textType = 'text',
  maxLength,
  minLength,
  rows = 4,
  className
}: TextProps) {
  const [internalValue, setInternalValue] = useState<string>(
    (typeof value === 'string' ? value : '') || (typeof defaultValue === 'string' ? defaultValue : '')
  )
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const config = inputTypeConfig[textType]
  const currentPlaceholder = placeholder || config.placeholder

  const currentValue = value !== undefined ? value : internalValue
  const currentLength = String(currentValue || '').length

  // 字符计数显示
  const showCounter = maxLength !== undefined

  // 验证
  const validate = (val: string): string | undefined => {
    if (required && !val.trim()) {
      return '此题为必填项'
    }
    if (minLength && val.length < minLength) {
      return `至少需要 ${minLength} 个字符`
    }
    if (maxLength && val.length > maxLength) {
      return `最多 ${maxLength} 个字符`
    }
    if (textType === 'email' && val && config.pattern instanceof RegExp && !config.pattern.test(val)) {
      return '请输入有效的邮箱地址'
    }
    if (textType === 'phone' && val && config.pattern instanceof RegExp && !config.pattern.test(val)) {
      return '请输入有效的手机号码'
    }
    return undefined
  }

  const validationError = touched ? validate(String(currentValue || '')) : undefined
  const displayError = error || validationError

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value

    // 长度限制
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
    }

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  // 编辑模式：显示配置
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
          {/* 输入类型选择 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <span className="text-sm font-medium text-[var(--text-primary)] mb-3 block">
              输入类型
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['text', 'textarea', 'email', 'phone'] as TextType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 text-sm',
                    textType === type
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/10 text-[var(--text-secondary)] hover:border-indigo-500/30'
                  )}
                >
                  {inputTypeConfig[type].icon}
                  {type === 'text' && '单行文本'}
                  {type === 'textarea' && '多行文本'}
                  {type === 'email' && '邮箱'}
                  {type === 'phone' && '电话'}
                </button>
              ))}
            </div>
          </div>

          {/* 长度限制 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              长度限制
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最小长度</span>
              <span className="text-sm text-[var(--text-primary)]">
                {minLength || '不限制'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最大长度</span>
              <span className="text-sm text-[var(--text-primary)]">
                {maxLength || '不限制'}
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-xl border border-dashed border-white/20">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3 block">
              预览
            </span>
            <div className="glass-card p-3 rounded-lg">
              <input
                type={textType === 'textarea' ? 'text' : config.inputType}
                placeholder={currentPlaceholder}
                disabled
                className={cn(
                  'w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none',
                  textType === 'textarea' && 'hidden'
                )}
              />
              {textType === 'textarea' && (
                <textarea
                  placeholder={currentPlaceholder}
                  disabled
                  rows={rows}
                  className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none"
                />
              )}
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

      {/* 输入框 */}
      <div className="relative">
        {textType === 'textarea' ? (
          <div className="relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={String(currentValue || '')}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={currentPlaceholder}
              rows={rows}
              disabled={disabled}
              className={cn(
                'w-full px-4 py-3 rounded-xl border resize-none',
                'bg-white/5 backdrop-blur-sm',
                'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                displayError ? 'border-red-500/50' : 'border-white/10',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
            {showCounter && (
              <div className={cn(
                'absolute bottom-2 right-3 text-xs',
                currentLength > maxLength ? 'text-red-400' : 'text-[var(--text-muted)]'
              )}>
                {currentLength}{maxLength && ` / ${maxLength}`}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {config.icon}
            </div>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={config.inputType}
              value={String(currentValue || '')}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={currentPlaceholder}
              disabled={disabled}
              className={cn(
                'w-full pl-11 pr-4 py-3 rounded-xl border',
                'bg-white/5 backdrop-blur-sm',
                'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                displayError ? 'border-red-500/50' : 'border-white/10',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
            {showCounter && (
              <div className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
                currentLength > maxLength ? 'text-red-400' : 'text-[var(--text-muted)]'
              )}>
                {currentLength}{maxLength && ` / ${maxLength}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

interface TextSkeletonProps {
  type?: TextType
}

export function TextSkeleton({ type = 'text' }: TextSkeletonProps) {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className={cn(
        'rounded-xl bg-white/5 animate-pulse',
        type === 'textarea' ? 'h-24' : 'h-12'
      )} />
    </div>
  )
}
