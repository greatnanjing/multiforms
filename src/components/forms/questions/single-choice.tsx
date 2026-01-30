/* ============================================
   MultiForms Single Choice Question Component

   单选题组件：
   - 编辑状态：可添加/删除/编辑选项
   - 填写状态：单选选择
   - 支持卡片/文本/图片样式
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChoiceQuestionProps, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface SingleChoiceProps extends ChoiceQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Helpers
// ============================================

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// ============================================
// Subcomponents
// ============================================

interface ChoiceRadioProps {
  label: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  error?: boolean
  imageUrl?: string | null
  optionStyle?: 'text' | 'card' | 'image'
}

function ChoiceRadio({
  label,
  checked,
  onChange,
  disabled,
  error,
  imageUrl,
  optionStyle = 'text'
}: ChoiceRadioProps) {
  const baseClasses = "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
  const uncheckedClasses = error
    ? "border-red-500 bg-transparent"
    : "border-white/20 bg-transparent hover:border-indigo-500/50"

  if (optionStyle === 'card' || optionStyle === 'image') {
    return (
      <label
        className={cn(
          'relative flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200',
          'glass-card',
          checked
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/10 hover:border-indigo-500/30 hover:bg-white/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          baseClasses,
          checked ? 'border-indigo-500' : uncheckedClasses
        )}>
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          )}
        </div>
        {optionStyle === 'image' && imageUrl ? (
          <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          </div>
        ) : null}
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
          {label || '未命名选项'}
        </span>
      </label>
    )
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className={cn(
        baseClasses,
        checked ? 'border-indigo-500' : uncheckedClasses
      )}>
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
        )}
      </div>
      <span className="text-sm text-[var(--text-primary)] group-hover:text-white transition-colors">
        {label || '未命名选项'}
      </span>
    </label>
  )
}

interface EditableChoiceProps {
  label: string
  imageUrl?: string | null
  checked: boolean
  onCheck: () => void
  onChange: (value: string) => void
  onRemove: () => void
  onDragStart: () => void
  error?: boolean
  showImage?: boolean
}

function EditableChoice({
  label,
  imageUrl,
  checked,
  onCheck,
  onChange,
  onRemove,
  onDragStart,
  error,
  showImage = false
}: EditableChoiceProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
        'glass-card',
        checked ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10',
        error && 'border-red-500/50'
      )}
      draggable
      onDragStart={onDragStart}
    >
      <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
        <GripVertical className="w-4 h-4" />
      </div>

      <div
        onClick={onCheck}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0',
          checked ? 'border-indigo-500 bg-indigo-500' : 'border-white/20'
        )}
      >
        {checked && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>

      {showImage && (
        <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
        </div>
      )}

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
          placeholder="选项内容"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="flex-1 text-sm text-[var(--text-primary)] cursor-pointer"
        >
          {label || '点击编辑选项'}
        </span>
      )}

      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function SingleChoice({
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
  options = [],
  allowOther = false,
  otherLabel = '其他',
  optionStyle = 'text',
  onOptionsChange,
  onAddOption,
  onRemoveOption,
  className
}: SingleChoiceProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    (typeof value === 'string' ? value : null) || (typeof defaultValue === 'string' ? defaultValue : null)
  )
  const [otherValue, setOtherValue] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)

  // 内部使用的选项列表（编辑模式）
  const [internalOptions, setInternalOptions] = useState(
    options.length > 0 ? options : [
      { id: '1', label: '选项 1', value: 'option-1' },
      { id: '2', label: '选项 2', value: 'option-2' }
    ]
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const currentOptions = mode === 'edit' ? internalOptions : options
  const currentValue = value !== undefined ? value : selectedValue

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange?.(newValue)
  }

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleAddOption = () => {
    const newOption = {
      id: generateId(),
      label: `选项 ${currentOptions.length + 1}`,
      value: `option-${generateId()}`
    }
    const updated = [...currentOptions, newOption]
    setInternalOptions(updated)
    onOptionsChange?.(updated)
    onAddOption?.()
  }

  const handleRemoveOption = (optionId: string) => {
    const updated = currentOptions.filter(opt => opt.id !== optionId)
    setInternalOptions(updated)
    onOptionsChange?.(updated)
    onRemoveOption?.(optionId)
    if (currentValue === currentOptions.find(opt => opt.id === optionId)?.value) {
      handleChange('')
    }
  }

  const handleOptionChange = (optionId: string, newLabel: string) => {
    const updated = currentOptions.map(opt =>
      opt.id === optionId ? { ...opt, label: newLabel } : opt
    )
    setInternalOptions(updated)
    onOptionsChange?.(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...currentOptions]
    const [removed] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, removed)
    setInternalOptions(updated)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onOptionsChange?.(internalOptions)
  }

  const isSelected = (optionValue: string) => {
    if (typeof currentValue === 'string') {
      return currentValue === optionValue
    }
    return false
  }

  const isOtherSelected = typeof currentValue === 'string' && !currentOptions.some(opt => opt.value === currentValue)

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
      {error && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 编辑模式 */}
      {mode === 'edit' ? (
        <div className="space-y-2">
          {currentOptions.map((option, index) => (
            <EditableChoice
              key={option.id}
              label={option.label}
              imageUrl={option.image_url}
              checked={false}
              onCheck={() => {}}
              onChange={(value) => handleOptionChange(option.id, value)}
              onRemove={() => handleRemoveOption(option.id)}
              onDragStart={() => handleDragStart(index)}
              showImage={optionStyle === 'image'}
            />
          ))}

          <button
            onClick={handleAddOption}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed',
              'transition-all duration-200',
              'text-sm font-medium',
              'border-white/20 text-[var(--text-secondary)] hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5'
            )}
          >
            <Plus className="w-4 h-4" />
            添加选项
          </button>

          {allowOther && (
            <div className="mt-3 p-3 rounded-xl border border-white/10 bg-white/5">
              <span className="text-sm text-[var(--text-secondary)]">
                允许填写"其他"选项
              </span>
            </div>
          )}
        </div>
      ) : (
        /* 填写/预览模式 */
        <div className={cn(
          'space-y-2',
          optionStyle === 'card' || optionStyle === 'image' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''
        )}>
          {currentOptions.map((option) => (
            <ChoiceRadio
              key={option.id}
              label={option.label}
              checked={isSelected(option.value)}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
              error={!!error}
              imageUrl={option.image_url}
              optionStyle={optionStyle}
            />
          ))}

          {allowOther && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                checked={isOtherSelected}
                onChange={() => {
                  setShowOtherInput(true)
                  handleChange(otherValue || 'other')
                }}
                disabled={disabled}
                className="sr-only"
              />
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                isOtherSelected ? 'border-indigo-500' : 'border-white/20'
              )}>
                {isOtherSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
              {showOtherInput || isOtherSelected ? (
                <input
                  type="text"
                  value={otherValue}
                  onChange={handleOtherChange}
                  placeholder={otherLabel || '其他'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
                  onClick={() => handleChange(otherValue || 'other')}
                />
              ) : (
                <span className="text-sm text-[var(--text-primary)] group-hover:text-white transition-colors">
                  {otherLabel || '其他'}
                </span>
              )}
            </label>
          )}

          {placeholder && !currentValue && (
            <p className="text-sm text-[var(--text-muted)] mt-2">{placeholder}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

interface SingleChoiceSkeletonProps {
  optionCount?: number
  optionStyle?: 'text' | 'card' | 'image'
}

export function SingleChoiceSkeleton({
  optionCount = 3,
  optionStyle = 'text'
}: SingleChoiceSkeletonProps) {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className={cn(
        'space-y-2',
        optionStyle === 'card' || optionStyle === 'image' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''
      )}>
        {Array.from({ length: optionCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3',
              optionStyle === 'card' || optionStyle === 'image' ? 'p-4 rounded-xl border border-white/10' : ''
            )}
          >
            <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
            <div className="h-4 w-24 bg-white/5 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
