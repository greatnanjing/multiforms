/* ============================================
   MultiForms Builder Question Card Component

   题目卡片组件（构建器中）：
   - 显示题目预览
   - 悬停显示操作按钮
   - 支持拖拽排序
   - 编辑/复制/删除功能
============================================ */

'use client'

import { memo } from 'react'
import { GripVertical, Copy, Trash2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { QuestionType } from '@/types'
import * as QuestionComponents from '@/components/forms/questions'

// ============================================
// Types
// ============================================

export interface BuilderQuestion {
  id: string
  type: QuestionType
  question_text: string
  required: boolean
  order: number
  // Question-specific options would go here
  options?: {
    choices?: Array<{ id: string; label: string; value: string; image_url?: string | null }>
    max_selections?: number
    allow_other?: boolean
    other_label?: string
    [key: string]: any
  }
  validation?: any
}

interface QuestionCardProps {
  question: BuilderQuestion
  index: number
  /** 是否为拖拽中 */
  isDragging?: boolean
  /** 是否选中 */
  isSelected?: boolean
  /** 编辑回调 */
  onEdit?: (questionId: string) => void
  /** 复制回调 */
  onCopy?: (questionId: string) => void
  /** 删除回调 */
  onDelete?: (questionId: string) => void
  /** 切换必选状态 */
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
  options?: any
  showQuestionNumber?: boolean
  questionNumber?: number
}

// 题型显示名称映射
const QuestionTypeLabels: Record<QuestionType, string> = {
  single_choice: '单选',
  multiple_choice: '多选',
  dropdown: '下拉',
  rating: '评分',
  text: '文本',
  textarea: '多行',
  number: '数字',
  date: '日期',
  email: '邮箱',
  phone: '电话',
  file_upload: '上传',
  matrix: '矩阵',
  sorting: '排序',
}

// 题型颜色映射
const QuestionTypeColors: Record<QuestionType, string> = {
  single_choice: 'bg-blue-500/15 text-blue-400',
  multiple_choice: 'bg-purple-500/15 text-purple-400',
  dropdown: 'bg-cyan-500/15 text-cyan-400',
  rating: 'bg-amber-500/15 text-amber-400',
  text: 'bg-slate-500/15 text-slate-400',
  textarea: 'bg-slate-500/15 text-slate-400',
  number: 'bg-green-500/15 text-green-400',
  date: 'bg-rose-500/15 text-rose-400',
  email: 'bg-indigo-500/15 text-indigo-400',
  phone: 'bg-pink-500/15 text-pink-400',
  file_upload: 'bg-orange-500/15 text-orange-400',
  matrix: 'bg-teal-500/15 text-teal-400',
  sorting: 'bg-violet-500/15 text-violet-400',
}

function QuestionPreview({ type, questionText, required, options, showQuestionNumber = false, questionNumber }: QuestionPreviewProps) {
  // 题型标识 - 显示在题目文字后面
  const questionTypeLabel = QuestionTypeLabels[type]
  const questionTypeColor = QuestionTypeColors[type]

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
    questionText: '', // 题目文字已在外部显示，这里置空避免重复
    required: false,  // 必填标识已在外部显示
    disabled: true,
  }

  // Type-specific default props
  const typeDefaults: Partial<Record<QuestionType, any>> = {
    single_choice: {
      options: options?.choices || [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
      optionStyle: 'text',
    },
    multiple_choice: {
      options: options?.choices || [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
      maxSelections: options?.max_selections,
    },
    dropdown: {
      options: options?.choices || [
        { id: '1', label: '选项 1', value: '1' },
        { id: '2', label: '选项 2', value: '2' },
      ],
    },
    rating: {
      ratingType: options?.rating_type || 'star',
      maxRating: options?.rating_max || 5,
    },
    text: {
      inputType: 'text',
      placeholder: options?.placeholder || '请输入文本',
    },
    number: {
      placeholder: options?.placeholder || '请输入数字',
    },
    date: {
      format: options?.date_format || 'YYYY-MM-DD',
    },
    file_upload: {
      maxFileSize: options?.max_file_size || 10 * 1024 * 1024,
      maxFiles: options?.max_file_count || 1,
    },
    matrix: {
      rows: options?.matrix_rows || ['项目 1', '项目 2'],
      columns: options?.matrix_columns || ['选项 1', '选项 2', '选项 3'],
    },
    sorting: {
      items: options?.sortable_items || [
        { id: '1', label: '选项 1', order: 0 },
        { id: '2', label: '选项 2', order: 1 },
      ],
    },
  }

  return (
    <div className="pointer-events-none">
      {/* 题目标题行：编号 + 题目文字 + 必填标识 + 题型标签 */}
      <div className="flex items-baseline gap-2 mb-3">
        {showQuestionNumber && (
          <span className="text-sm font-semibold text-indigo-400 flex-shrink-0">
            {questionNumber}.
          </span>
        )}
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {questionText || '未命名题目'}
        </span>
        {required && (
          <span className="text-red-400">*</span>
        )}
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium flex-shrink-0',
          questionTypeColor
        )}>
          {questionTypeLabel}
        </span>
        {/* 多选题最多选数量 */}
        {type === 'multiple_choice' && options?.max_selections && (
          <span className="px-2 py-0.5 rounded text-xs font-medium text-violet-400/80 bg-violet-500/10 flex-shrink-0">
            最多选 {options.max_selections} 项
          </span>
        )}
      </div>
      {/* 题目组件预览 */}
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
        title={required ? '必选' : '可选'}
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
  isSelected = false,
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

  const handleCardClick = () => {
    onEdit?.(question.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('group relative', className)}
    >
      <div
        onClick={handleCardClick}
        className={cn(
          'relative p-4 rounded-2xl transition-all duration-200 cursor-pointer',
          'glass-card border-white/[0.08]',
          isSelected && '!border-indigo-500/60 !bg-indigo-500/8',
          !isSelected && 'hover:border-indigo-500/20',
          isDragging && 'opacity-50 scale-[0.98] pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3">
          {/* 左侧拖拽手柄 */}
          <div
            {...attributes}
            {...listeners}
            onDragStart={(e) => {
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
            className={cn(
              'w-8 h-10 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0',
              'bg-white/5 border border-white/10',
              'hover:bg-white/10 hover:border-indigo-500/30',
              'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              'transition-all duration-200'
            )}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* 题目内容区 */}
          <div className="flex-1 min-w-0 pointer-events-none">
            <QuestionPreview
              type={question.type}
              questionText={question.question_text}
              required={question.required}
              options={question.options}
              showQuestionNumber={true}
              questionNumber={index + 1}
            />
          </div>

          {/* 右侧操作按钮 */}
          <QuestionActions
            required={question.required}
            onToggleRequired={() => onToggleRequired?.(question.id)}
            onEdit={() => onEdit?.(question.id)}
            onCopy={() => onCopy?.(question.id)}
            onDelete={() => onDelete?.(question.id)}
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
  isSelected = false,
  onEdit,
  onCopy,
  onDelete,
  onToggleRequired,
  className,
}: QuestionCardProps) {
  const handleCardClick = () => {
    onEdit?.(question.id)
  }

  return (
    <div className={cn('group relative', className)}>
      <div
        onClick={handleCardClick}
        className={cn(
          'relative p-4 rounded-2xl transition-all duration-200 cursor-pointer',
          'glass-card border-white/[0.08]',
          isSelected && '!border-indigo-500/60 !bg-indigo-500/8',
          !isSelected && 'hover:border-indigo-500/20'
        )}
      >
        <div className="flex items-center gap-3">
          {/* 题目内容区 */}
          <div className="flex-1 min-w-0 pointer-events-none">
            <QuestionPreview
              type={question.type}
              questionText={question.question_text}
              required={question.required}
              options={question.options}
              showQuestionNumber={true}
              questionNumber={index + 1}
            />
          </div>

          {/* 右侧操作按钮 */}
          <QuestionActions
            required={question.required}
            onToggleRequired={() => onToggleRequired?.(question.id)}
            onEdit={() => onEdit?.(question.id)}
            onCopy={() => onCopy?.(question.id)}
            onDelete={() => onDelete?.(question.id)}
          />
        </div>
      </div>
    </div>
  )
})
