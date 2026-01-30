/* ============================================
   MultiForms Form Preview Component

   表单预览区组件：
   - 表单标题/描述编辑
   - 题目卡片列表
   - 添加题目区域
   - 放置拖拽区域
============================================ */

'use client'

import { useState, useCallback } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { QuestionType } from '@/types'
import { SortableQuestionCard } from './question-card'

// ============================================
// Types
// ============================================

interface BuilderQuestion {
  id: string
  type: QuestionType
  question_text: string
  required: boolean
  order: number
  options?: any
}

interface FormPreviewProps {
  /** 表单标题 */
  title: string
  /** 表单描述 */
  description: string
  /** 题目列表 */
  questions: BuilderQuestion[]
  /** 是否正在拖拽 */
  isDragging?: boolean
  /** 更新标题 */
  onTitleChange?: (title: string) => void
  /** 更新描述 */
  onDescriptionChange?: (description: string) => void
  /** 添加题目 */
  onAddQuestion?: (type: QuestionType) => void
  /** 编辑题目 */
  onEditQuestion?: (questionId: string) => void
  /** 复制题目 */
  onCopyQuestion?: (questionId: string) => void
  /** 删除题目 */
  onDeleteQuestion?: (questionId: string) => void
  /** 切换必填 */
  onToggleRequired?: (questionId: string) => void
  /** 重新排序 */
  onReorder?: (questions: BuilderQuestion[]) => void
  /** 额外的类名 */
  className?: string
}

// ============================================
// Form Header Component
// ============================================

interface FormHeaderProps {
  title: string
  description: string
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
}

function FormHeader({ title, description, onTitleChange, onDescriptionChange }: FormHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDesc, setEditDesc] = useState(description)

  const handleSave = () => {
    onTitleChange?.(editTitle)
    onDescriptionChange?.(editDesc)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="表单标题"
          className={cn(
            'w-full bg-transparent text-2xl font-semibold text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-3 py-2 -mx-3'
          )}
          autoFocus
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="表单描述（可选）"
          rows={2}
          className={cn(
            'w-full bg-transparent text-sm text-[var(--text-secondary)]',
            'placeholder:text-[var(--text-muted)] resize-none',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-3 py-2 -mx-3'
          )}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
              'hover:opacity-90 transition-opacity'
            )}
          >
            保存
          </button>
          <button
            onClick={() => {
              setEditTitle(title)
              setEditDesc(description)
              setIsEditing(false)
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10',
              'transition-colors'
            )}
          >
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      {/* Edit Button */}
      <button
        onClick={() => setIsEditing(true)}
        className={cn(
          'absolute top-0 right-0 w-8 h-8 rounded-lg',
          'flex items-center justify-center',
          'bg-white/5 border border-white/[0.08]',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-white/10 text-[var(--text-secondary)]'
        )}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>

      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
        {title || '未命名表单'}
      </h1>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

// ============================================
// Add Question Zone Component
// ============================================

interface AddQuestionZoneProps {
  isDragOver?: boolean
  onClick?: () => void
}

function AddQuestionZone({ isDragOver, onClick }: AddQuestionZoneProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
        isDragOver
          ? 'border-indigo-500 bg-indigo-500/5'
          : 'border-white/[0.1] hover:border-indigo-500/30 hover:bg-white/[0.02]'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4',
          'bg-indigo-500/15'
        )}
      >
        <Plus className="w-6 h-6 text-indigo-400" />
      </div>
      <p className="text-base font-medium text-[var(--text-primary)] mb-1">
        添加新题目
      </p>
      <p className="text-sm text-[var(--text-muted)]">
        拖拽左侧题型到此处，或点击添加
      </p>
    </div>
  )
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  onAddQuestion?: () => void
}

function EmptyState({ onAddQuestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
          'bg-white/[0.03] border border-white/[0.08]'
        )}
      >
        <Plus className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        开始创建你的表单
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">
        从左侧工具箱拖拽题型到此处，或点击下方按钮开始添加题目
      </p>
      <button
        onClick={onAddQuestion}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-xl',
          'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]',
          'text-white font-medium',
          'hover:opacity-90 transition-opacity'
        )}
      >
        <Plus className="w-4 h-4" />
        添加第一道题目
      </button>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function FormPreview({
  title,
  description,
  questions,
  isDragging = false,
  onTitleChange,
  onDescriptionChange,
  onAddQuestion,
  onEditQuestion,
  onCopyQuestion,
  onDeleteQuestion,
  onToggleRequired,
  onReorder,
  className,
}: FormPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Drop zone for adding questions
  const { setNodeRef: setDropZoneRef, isOver: isDropZoneOver } = useDroppable({
    id: 'add-question-zone',
    data: {
      accepts: ['question-type'],
    },
  })

  // Drop zone for reordering (entire form preview)
  const { setNodeRef: setFormRef, isOver: isFormOver } = useDroppable({
    id: 'form-preview',
    data: {
      accepts: ['question-card'],
    },
  })

  const handleAddQuestion = useCallback(() => {
    onAddQuestion?.('single_choice')
  }, [onAddQuestion])

  // Combine refs for form preview area
  const formPreviewRef = useCallback((node: HTMLElement | null) => {
    setFormRef(node)
    if (questions.length === 0) {
      setDropZoneRef(node)
    }
  }, [setFormRef, setDropZoneRef, questions.length])

  const questionIds = questions.map((q) => q.id)

  return (
    <div ref={formPreviewRef} className={cn('flex-1 overflow-y-auto', className)}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Form Header */}
        <div
          className={cn(
            'p-8 rounded-2xl border mb-4 transition-all duration-200',
            'glass-card border-white/[0.08]',
            'hover:border-indigo-500/20'
          )}
        >
          <FormHeader
            title={title}
            description={description}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
          />
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <SortableContext
            items={questionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 mb-4">
              {questions.map((question, index) => (
                <SortableQuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={onEditQuestion}
                  onCopy={onCopyQuestion}
                  onDelete={onDeleteQuestion}
                  onToggleRequired={onToggleRequired}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <EmptyState onAddQuestion={handleAddQuestion} />
        )}

        {/* Add Question Zone */}
        {questions.length > 0 && (
          <div ref={setDropZoneRef}>
            <AddQuestionZone isDragOver={isDropZoneOver} onClick={handleAddQuestion} />
          </div>
        )}
      </div>
    </div>
  )
}
