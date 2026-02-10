/* ============================================
   MultiForms Matrix Question Component

   矩阵题组件：
   - 编辑状态：配置行和列
   - 填写状态：二维单选选择
   - 支持李克特量表
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatrixQuestionProps, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface MatrixProps extends MatrixQuestionProps {
  mode?: QuestionMode
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
// Editable Items
// ============================================

interface EditableItemProps {
  value: string
  onChange: (value: string) => void
  onRemove?: () => void
  placeholder?: string
  showRemove?: boolean
  dragHandle?: boolean
}

function EditableItem({
  value,
  onChange,
  onRemove,
  placeholder = '点击编辑',
  showRemove = true,
  dragHandle = false
}: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  return (
    <div className="flex items-center gap-2">
      {dragHandle && (
        <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
          placeholder={placeholder}
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="flex-1 min-w-0 text-sm text-[var(--text-primary)] truncate cursor-pointer hover:text-white transition-colors"
        >
          {value || placeholder}
        </span>
      )}
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function Matrix({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  value = {},
  onChange,
  error,
  disabled = false,
  rows = ['项目 1', '项目 2', '项目 3'],
  columns = ['非常不同意', '不同意', '中立', '同意', '非常同意'],
  className
}: MatrixProps) {
  const [internalRows, setInternalRows] = useState<string[]>(rows)
  const [internalColumns, setInternalColumns] = useState<string[]>(columns)
  const [internalValue, setInternalValue] = useState<Record<string, string>>(
    (typeof value === 'object' && value !== null) ? value : {}
  )

  const currentValue = value !== undefined ? value : internalValue

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (disabled) return

    const rowKey = internalRows[rowIndex]
    const colValue = internalColumns[colIndex]

    // 如果点击已选中的，则取消选择
    const newValue = { ...currentValue }
    if (newValue[rowKey] === colValue) {
      delete newValue[rowKey]
    } else {
      newValue[rowKey] = colValue
    }

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleAddRow = () => {
    setInternalRows([...internalRows, `项目 ${internalRows.length + 1}`])
  }

  const handleRemoveRow = (index: number) => {
    const updated = internalRows.filter((_, i) => i !== index)
    setInternalRows(updated)

    // 清除该行的答案
    const rowKey = internalRows[index]
    const newValue = { ...currentValue }
    delete newValue[rowKey]
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleRowChange = (index: number, value: string) => {
    const updated = [...internalRows]
    const oldKey = updated[index]
    updated[index] = value

    // 更新答案中的键
    const newAnswers = { ...currentValue }
    if (oldKey !== value && newAnswers[oldKey]) {
      newAnswers[value] = newAnswers[oldKey]
      delete newAnswers[oldKey]
    }

    setInternalRows(updated)
    setInternalValue(newAnswers)
    onChange?.(newAnswers)
  }

  const handleAddColumn = () => {
    setInternalColumns([...internalColumns, `选项 ${internalColumns.length + 1}`])
  }

  const handleRemoveColumn = (index: number) => {
    const updated = internalColumns.filter((_, i) => i !== index)
    setInternalColumns(updated)
  }

  const handleColumnChange = (index: number, value: string) => {
    const updated = [...internalColumns]
    updated[index] = value
    setInternalColumns(updated)
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
          {/* 行设置 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                行（项目）
              </span>
              <button
                onClick={handleAddRow}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加行
              </button>
            </div>
            <div className="space-y-2">
              {internalRows.map((row, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs text-[var(--text-muted)] flex-shrink-0">
                    {index + 1}
                  </span>
                  <EditableItem
                    value={row}
                    onChange={(v) => handleRowChange(index, v)}
                    onRemove={internalRows.length > 2 ? () => handleRemoveRow(index) : undefined}
                    placeholder="项目名称"
                    showRemove={internalRows.length > 2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 列设置 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                列（选项）
              </span>
              <button
                onClick={handleAddColumn}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加列
              </button>
            </div>
            <div className="space-y-2">
              {internalColumns.map((col, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <EditableItem
                    value={col}
                    onChange={(v) => handleColumnChange(index, v)}
                    onRemove={internalColumns.length > 2 ? () => handleRemoveColumn(index) : undefined}
                    placeholder="选项名称"
                    showRemove={internalColumns.length > 2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 计算完成状态
  const answeredCount = Object.keys(currentValue).length
  const isComplete = required && answeredCount === internalRows.length

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
          {!required && (
            <span className="ml-2 text-xs text-[var(--text-muted)]">
              (可选)
            </span>
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

      {/* 矩阵表格 */}
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* 表头 */}
          <div className="flex items-center mb-2">
            <div className="w-32 flex-shrink-0" />
            {internalColumns.map((col, index) => (
              <div
                key={index}
                className="flex-1 min-w-20 px-2 py-2 text-center text-xs font-medium text-[var(--text-secondary)]"
              >
                {col}
              </div>
            ))}
          </div>

          {/* 表格行 */}
          <div className="space-y-2">
            {internalRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {/* 行标题 */}
                <div className="w-32 flex-shrink-0 pr-4 text-sm text-[var(--text-primary)]">
                  {row}
                </div>

                {/* 选项单元格 */}
                {internalColumns.map((col, colIndex) => {
                  const isSelected = currentValue[row] === col
                  return (
                    <button
                      key={colIndex}
                      type="button"
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={disabled}
                      className={cn(
                        'flex-1 min-w-20 mx-1 h-10 rounded-lg border transition-all duration-200',
                        'flex items-center justify-center',
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-white/10 bg-white/5 hover:border-indigo-500/30',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 进度提示 */}
      {required && !isComplete && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          已完成 {answeredCount} / {internalRows.length} 项
        </p>
      )}
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

export function MatrixSkeleton() {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-24 h-6 bg-white/5 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="w-12 h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
