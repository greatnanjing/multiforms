/* ============================================
   MultiForms Builder Question Card Component

   题目卡片组件（构建器中）：
   - 显示题目预览
   - 悬停显示操作按钮
   - 支持拖拽排序
   - 编辑/复制/删除功能
============================================ */

'use client'

import { memo, useState } from 'react'
import { GripVertical, Copy, Trash2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { QuestionType } from '@/types'
import * as QuestionComponents from '@/components/forms/questions'

// ============================================
// Types
// ============================================

interface BuilderQuestion {
  id: string
  type: QuestionType
  question_text: string
  required: boolean
  order: number
  // Question-specific options would go here
  options?: any
}

interface QuestionCardProps {
  question: BuilderQuestion
  index: number
  /** 是否为拖拽中 */
  isDragging?: boolean
  /** 编辑回调 */
  onEdit?: (questionId: string) => void
  /** 复制回调 */
  onCopy?: (questionId: string) => void
  /** 删除回调 */
  onDelete?: (questionId: string) => void
  /** 切换必填状态 */
  onToggleRequired?: (questionId: string) => void
  /** 额外的类名 */
  className?: string
}

// ============================================
// Question Preview Component
// ============================================

interface QuestionPreviewProps {
  type: QuestionType
  questionText: string
  required: boolean
}

function QuestionPreview({ type, questionText, required }: QuestionPreviewProps) {
  // Map question type to component
  const ComponentMap: Record<QuestionType, React.ComponentType<any>> = {
    single_choice: QuestionComponents.SingleChoice,
    multiple_choice: QuestionComponents.MultipleChoice,
    dropdown: QuestionComponents.Dropdown,
    rating: QuestionComponents.Rating,
    text: QuestionComponents.Text,
    textarea: QuestionComponents.Text,
    number: QuestionComponents.Number,
    date: QuestionComponents.Date,
    email: QuestionComponents.Text,
    phone: QuestionComponents.Text,
    file_upload: QuestionComponents.FileUpload,
    matrix: QuestionComponents.Matrix,
    sorting: QuestionComponents.Sorting,
  }

  const Component = ComponentMap[type]

  if (!Component) {
    return (
      <div className="text-sm text-[var(--text-muted)]">
        未知题型: {type}
      </div>
    )
  }

  // Render component in preview mode with default props
  const commonProps = {
    mode: 'preview' as const,
    questionId: 'preview',
    questionText,
    required,
    disabled: true,
  }

  // Type-specific default props
  const typeDefaults: Partial<Record<QuestionType, any>> = {
    single_choice: {
      options: [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
      optionStyle: 'text',
    },
    multiple_choice: {
      options: [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
      maxSelections: 2,
    },
    dropdown: {
      options: [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
    },
    rating: {
      ratingType: 'star',
      maxRating: 5,
    },
    text: {
      inputType: 'text',
      placeholder: '请输入文本',
    },
    number: {
      placeholder: '请输入数字',
    },
    date: {
      format: 'YYYY-MM-DD',
    },
    file_upload: {
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 1,
    },
    matrix: {
      rows: ['项目 1', '项目 2'],
      columns: ['选项 1', '选项 2', '选项 3'],
    },
    sorting: {
      items: [
        { id: '1', label: '选项 1', order: 0 },
        { id: '2', label: '选项 2', order: 1 },
      ],
    },
  }

  return (
    <div className="pointer-events-none">
      <Component {...commonProps} {...typeDefaults[type]} />
    </div>
  )
}

// ============================================
// Question Actions Component
// ============================================

interface QuestionActionsProps {
  required: boolean
  onToggleRequired?: () => void
  onCopy?: () => void
  onDelete?: () => void
  onEdit?: () => void
}

function QuestionActions({
  required,
  onToggleRequired,
  onCopy,
  onDelete,
  onEdit,
}: QuestionActionsProps) {
  return (
    <div
      className={cn(
        'absolute top-3 right-3 flex items-center gap-1.5',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
      )}
    >
      {/* Required Toggle */}
      <button
        type="button"
        onClick={onToggleRequired}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          'bg-white/[0.05] border border-white/[0.08]',
          'hover:bg-white/[0.1] hover:border-indigo-500/30',
          required && 'bg-indigo-500/10 border-indigo-500/30'
        )}
        title={required ? '必填' : '可选'}
      >
        <span
          className={cn(
            'text-xs font-bold',
            required ? 'text-indigo-400' : 'text-[var(--text-muted)]'
          )}
        >
          *
        </span>
      </button>

      {/* Edit */}
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          'bg-white/[0.05] border border-white/[0.08]',
          'hover:bg-white/[0.1] hover:border-indigo-500/30 text-[var(--text-secondary)]'
        )}
        title="编辑"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {/* Copy */}
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          'bg-white/[0.05] border border-white/[0.08]',
          'hover:bg-white/[0.1] hover:border-indigo-500/30 text-[var(--text-secondary)]'
        )}
        title="复制"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
          'bg-white/[0.05] border border-white/[0.08]',
          'hover:bg-red-500/10 hover:border-red-500/30',
          'hover:text-red-400 text-[var(--text-secondary)]'
        )}
        title="删除"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ============================================
// Sortable Question Card
// ============================================

export const SortableQuestionCard = memo(function SortableQuestionCard({
  question,
  index,
  onEdit,
  onCopy,
  onDelete,
  onToggleRequired,
  className,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    data: {
      type: question.type,
      question,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('group relative', className)}
    >
      <div
        className={cn(
          'relative p-5 rounded-2xl border transition-all duration-200',
          'glass-card border-white/[0.08]',
          'hover:border-indigo-500/20',
          isDragging && 'opacity-50 scale-[0.98]'
        )}
      >
        {/* Question Number */}
        <div
          className={cn(
            'absolute top-4 left-4',
            'w-7 h-7 rounded-lg flex items-center justify-center',
            'text-xs font-semibold',
            'bg-indigo-500/15 text-indigo-400'
          )}
        >
          {index + 1}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'absolute top-4 left-14 cursor-grab active:cursor-grabbing',
            'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Actions */}
        <QuestionActions
          required={question.required}
          onToggleRequired={() => onToggleRequired?.(question.id)}
          onEdit={() => onEdit?.(question.id)}
          onCopy={() => onCopy?.(question.id)}
          onDelete={() => onDelete?.(question.id)}
        />

        {/* Question Content */}
        <div className="pl-9">
          <QuestionPreview
            type={question.type}
            questionText={question.question_text}
            required={question.required}
          />
        </div>
      </div>
    </div>
  )
})

// ============================================
// Non-Sortable Question Card (for static display)
// ============================================

export const QuestionCard = memo(function QuestionCard({
  question,
  index,
  onEdit,
  onCopy,
  onDelete,
  onToggleRequired,
  className,
}: QuestionCardProps) {
  return (
    <div className={cn('group relative', className)}>
      <div
        className={cn(
          'relative p-5 rounded-2xl border transition-all duration-200',
          'glass-card border-white/[0.08]',
          'hover:border-indigo-500/20'
        )}
      >
        {/* Question Number */}
        <div
          className={cn(
            'absolute top-4 left-4',
            'w-7 h-7 rounded-lg flex items-center justify-center',
            'text-xs font-semibold',
            'bg-indigo-500/15 text-indigo-400'
          )}
        >
          {index + 1}
        </div>

        {/* Actions */}
        <QuestionActions
          required={question.required}
          onToggleRequired={() => onToggleRequired?.(question.id)}
          onEdit={() => onEdit?.(question.id)}
          onCopy={() => onCopy?.(question.id)}
          onDelete={() => onDelete?.(question.id)}
        />

        {/* Question Content */}
        <div className="pl-9">
          <QuestionPreview
            type={question.type}
            questionText={question.question_text}
            required={question.required}
          />
        </div>
      </div>
    </div>
  )
})
