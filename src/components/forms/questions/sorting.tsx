/* ============================================
   MultiForms Sorting Question Component

   排序题组件：
   - 编辑状态：配置排序项
   - 填写状态：拖拽排序
   - 支持触摸拖拽
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortingQuestionProps, SortableItem, QuestionMode } from './types'

// ============================================
// Types
// ============================================

interface SortingProps extends SortingQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Helpers
// ============================================

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// ============================================
// Draggable Item Component
// ============================================

interface DraggableItemProps {
  item: SortableItem
  index: number
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  disabled?: boolean
  showHandle?: boolean
}

function DraggableItem({
  item,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  disabled = false,
  showHandle = true
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(index)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={handleDragEnd}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
        'glass-card',
        isDragging
          ? 'opacity-50 scale-[1.02] border-indigo-500/50'
          : 'border-white/10 hover:border-indigo-500/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* 序号 */}
      <span className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold',
        'bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] text-white'
      )}>
        {index + 1}
      </span>

      {/* 拖拽手柄 */}
      {showHandle && (
        <div className={cn(
          'cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          disabled && 'cursor-default'
        )}>
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* 内容 */}
      <span className="flex-1 text-sm text-[var(--text-primary)]">
        {item.label}
      </span>
    </div>
  )
}

// ============================================
// Editable Item Component
// ============================================

interface EditableItemProps {
  item: SortableItem
  index: number
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onChange: (index: number, label: string) => void
  onRemove: (index: number) => void
}

function EditableItem({
  item,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onChange,
  onRemove
}: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
    >
      <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
        <GripVertical className="w-4 h-4" />
      </div>

      <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm text-[var(--text-muted)]">
        {index + 1}
      </span>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={item.label}
          onChange={(e) => onChange(index, e.target.value)}
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
          {item.label || '点击编辑选项'}
        </span>
      )}

      <button
        onClick={() => onRemove(index)}
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

export function Sorting({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  value,
  onChange,
  error,
  disabled = false,
  items = [
    { id: '1', label: '选项 1', order: 0 },
    { id: '2', label: '选项 2', order: 1 },
    { id: '3', label: '选项 3', order: 2 }
  ],
  className
}: SortingProps) {
  const [internalItems, setInternalItems] = useState<SortableItem[]>(items)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const currentItems = mode === 'edit' ? internalItems : items
  const sortedItems = [...currentItems].sort((a, b) => a.order - b.order)

  // 获取当前排序后的 ID 数组
  const getCurrentOrder = (): string[] => {
    return sortedItems.map(item => item.id)
  }

  const currentValue = value !== undefined ? value : getCurrentOrder()

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...sortedItems]
    const [removed] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, removed)

    // 更新 order 值
    const reordered = updated.map((item, i) => ({ ...item, order: i }))

    if (mode === 'edit') {
      setInternalItems(reordered)
    } else {
      // 更新值
      const newOrder = reordered.map(item => item.id)
      onChange?.(newOrder)
    }

    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleAddItem = () => {
    const newItem: SortableItem = {
      id: generateId(),
      label: `选项 ${currentItems.length + 1}`,
      order: currentItems.length
    }
    setInternalItems([...internalItems, newItem])
  }

  const handleRemoveItem = (index: number) => {
    const updated = internalItems.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i }))
    setInternalItems(updated)
  }

  const handleItemChange = (index: number, label: string) => {
    const updated = [...internalItems]
    updated[index].label = label
    setInternalItems(updated)
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

        <div className="space-y-2">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            排序选项（拖拽调整顺序）
          </span>
          {sortedItems.map((item, index) => (
            <EditableItem
              key={item.id}
              item={item}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
            />
          ))}

          <button
            onClick={handleAddItem}
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
      {error && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 说明提示 */}
      <p className="text-sm text-[var(--text-muted)] mb-4">
        拖拽以下选项进行排序
      </p>

      {/* 排序列表 */}
      <div className="space-y-2">
        {sortedItems.map((item, index) => (
          <DraggableItem
            key={item.id}
            item={item}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            disabled={disabled}
          />
        ))}
      </div>

      {/* 完成提示 */}
      {!disabled && sortedItems.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          共 {sortedItems.length} 个选项，按优先级从高到低排序
        </p>
      )}
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

interface SortingSkeletonProps {
  itemCount?: number
}

export function SortingSkeleton({ itemCount = 3 }: SortingSkeletonProps) {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-white/5" />
            <div className="w-4 h-4 bg-white/5 rounded" />
            <div className="flex-1 h-5 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
