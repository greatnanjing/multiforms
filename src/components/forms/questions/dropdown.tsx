/* ============================================
   MultiForms Dropdown Question Component

   下拉选择组件：
   - 编辑状态：可添加/删除/编辑选项
   - 填写状态：下拉选择
   - 支持搜索/分组
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, GripVertical, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChoiceQuestionProps, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface DropdownProps extends Omit<ChoiceQuestionProps, 'optionStyle'> {
  mode?: QuestionMode
  /** 占位文本 */
  placeholder?: string
  /** 是否可搜索 */
  searchable?: boolean
}

// ============================================
// Helpers
// ============================================

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// ============================================
// Subcomponents
// ============================================

interface EditableDropdownOptionProps {
  label: string
  onRemove: () => void
  onDragStart: () => void
  index: number
}

function EditableDropdownOption({
  label,
  onRemove,
  onDragStart,
  index
}: EditableDropdownOptionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5"
      draggable
      onDragStart={onDragStart}
    >
      <span className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs text-[var(--text-muted)] flex-shrink-0">
        {index + 1}
      </span>

      <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
        <GripVertical className="w-4 h-4" />
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => {/* handled by parent */}}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="flex-1 bg-transparent border-b border-white/20 px-1 py-0.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
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
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function Dropdown({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  placeholder = '请选择',
  defaultValue,
  value,
  onChange,
  error,
  disabled = false,
  options = [],
  onOptionsChange,
  onAddOption,
  onRemoveOption,
  className
}: DropdownProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(
    (typeof value === 'string' ? value : null) || (typeof defaultValue === 'string' ? defaultValue : null)
  )
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [internalOptions, setInternalOptions] = useState(
    options.length > 0 ? options : [
      { id: '1', label: '选项 1', value: 'option-1' },
      { id: '2', label: '选项 2', value: 'option-2' }
    ]
  )

  const currentOptions = mode === 'edit' ? internalOptions : options
  const currentValue = value !== undefined ? value : selectedValue

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = currentOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange?.(newValue)
    setIsOpen(false)
    setSearchQuery('')
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

  const selectedOption = currentOptions.find(opt => opt.value === currentValue)

  return (
    <div className={cn('question-wrapper', className)} ref={dropdownRef}>
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
          <div className="p-3 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5">
              <span className="text-sm text-[var(--text-muted)]">预览下拉选择</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              选项列表
            </span>
            {currentOptions.map((option, index) => (
              <EditableDropdownOption
                key={option.id}
                label={option.label}
                onRemove={() => handleRemoveOption(option.id)}
                onDragStart={() => {}}
                index={index}
              />
            ))}
          </div>

          <button
            onClick={handleAddOption}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed',
              'transition-all duration-200',
              'text-sm font-medium',
              'border-white/20 text-[var(--text-secondary)] hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5'
            )}
          >
            <Plus className="w-4 h-4" />
            添加选项
          </button>
        </div>
      ) : (
        /* 填写/预览模式 */
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-xl border',
              'bg-white/5 backdrop-blur-sm',
              'transition-all duration-200',
              'text-left',
              error ? 'border-red-500/50' : 'border-white/10',
              isOpen && 'border-indigo-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'hover:border-indigo-500/30'
            )}
          >
            <span className={cn(
              'text-sm',
              selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
            )}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-[var(--text-muted)] transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>

          {/* 下拉面板 */}
          {isOpen && (
            <div className={cn(
              'absolute z-10 w-full mt-2 rounded-xl border',
              'bg-[#1A1A2E] backdrop-blur-xl shadow-xl',
              'border-white/10 overflow-hidden'
            )}>
              {/* 搜索框 */}
              <div className="p-2 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索选项..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* 选项列表 */}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">
                    {searchQuery ? '没有匹配的选项' : '暂无选项'}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleChange(option.value)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors',
                        'hover:bg-white/5',
                        option.value === currentValue
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-[var(--text-primary)]'
                      )}
                    >
                      {option.label || '未命名选项'}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

export function DropdownSkeleton() {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
    </div>
  )
}
