/* ============================================
   MultiForms Property Panel Component

   属性面板组件（右侧）：
   - 题目属性编辑
   - 选项管理
   - 验证规则
============================================ */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings2, Plus, GripVertical, Trash2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { QuestionType } from '@/types'
import type { BuilderQuestion } from './question-card'
import type { ChoiceOption } from '@/types'

// ============================================
// Types
// ============================================

interface PropertyPanelProps {
  /** 当前选中的题目 */
  selectedQuestion: BuilderQuestion | null
  /** 更新题目回调 */
  onUpdateQuestion?: (questionId: string, updates: Partial<BuilderQuestion>) => void
  /** 是否显示 */
  isOpen?: boolean
  /** 题目编号 */
  questionNumber?: number
}

// ============================================
// Question Properties Form
// ============================================

interface QuestionPropertiesProps {
  question: BuilderQuestion
  onUpdate: (updates: Partial<BuilderQuestion>) => void
}

function QuestionProperties({ question, onUpdate }: QuestionPropertiesProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [required, setRequired] = useState(question.required)

  // Track previous values to detect changes
  const prevQuestionIdRef = useRef(question.id)
  const prevRequiredRef = useRef(question.required)
  const prevOptionsRef = useRef(question.options)
  const isInternalUpdateRef = useRef(false)

  // DnD sensors for option reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Ensure multiple_choice questions always have max_selections set
  useEffect(() => {
    if (question.type === 'multiple_choice' && !question.options?.max_selections) {
      const choices = question.options?.choices || []
      if (choices.length > 0) {
        // Initialize max_selections to the number of choices
        onUpdate({
          options: {
            ...question.options,
            max_selections: choices.length,
          },
        })
      }
    }
  }, [question.id, question.type, question.options?.max_selections])

  // Sync local state when question changes or required updates from outside
  // Note: question_text is NOT in dependencies to prevent re-render on every keystroke
  // Text changes are handled directly by handleTextChange without syncing back
  useEffect(() => {
    if (question.id !== prevQuestionIdRef.current) {
      // Switching to a different question - sync all state
      setQuestionText(question.question_text)
      setRequired(question.required)
      prevQuestionIdRef.current = question.id
      prevRequiredRef.current = question.required
    } else if (!isInternalUpdateRef.current && question.required !== prevRequiredRef.current) {
      // Sync required state when toggled from question card (not from this panel)
      setRequired(question.required)
      prevRequiredRef.current = question.required
    }
    // Reset internal update flag after sync
    isInternalUpdateRef.current = false
  }, [question.id, question.required])

  // Get current options, provide defaults for choice-based questions if empty
  const getDefaultChoices = () => {
    if (question.options?.choices && question.options.choices.length > 0) {
      return question.options.choices
    }
    // Default options for choice-based questions
    if (question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'dropdown') {
      return [
        { id: `opt-${Date.now()}-1`, label: '选项 1', value: 'option-1' },
        { id: `opt-${Date.now()}-2`, label: '选项 2', value: 'option-2' },
      ]
    }
    return []
  }

  const currentOptions = getDefaultChoices()

  const handleTextChange = (value: string) => {
    setQuestionText(value)
    onUpdate({ question_text: value })
  }

  const handleRequiredChange = (value: boolean) => {
    isInternalUpdateRef.current = true
    setRequired(value)
    onUpdate({ required: value })
  }

  // Option management functions
  const handleAddOption = () => {
    const newOption: ChoiceOption = {
      id: `opt-${Date.now()}`,
      label: `选项 ${currentOptions.length + 1}`,
      value: `option-${currentOptions.length + 1}`,
    }
    const newChoices = [...(question.options?.choices || []), newOption]
    onUpdate({
      options: {
        ...question.options,
        choices: newChoices,
        max_selections: newChoices.length,
      },
    })
  }

  const handleUpdateOption = (optionId: string, label: string) => {
    const updatedChoices = currentOptions.map((opt: ChoiceOption) =>
      opt.id === optionId
        ? { ...opt, label, value: label }
        : opt
    )
    onUpdate({
      options: {
        ...question.options,
        choices: updatedChoices,
      },
    })
  }

  const handleDeleteOption = (optionId: string) => {
    if (currentOptions.length <= 1) return // At least keep one option
    const updatedChoices = currentOptions.filter((opt: ChoiceOption) => opt.id !== optionId)
    onUpdate({
      options: {
        ...question.options,
        choices: updatedChoices,
        max_selections: updatedChoices.length,
      },
    })
  }

  const handleOptionReorder = (oldIndex: number, newIndex: number) => {
    const updatedChoices = [...currentOptions]
    const [removed] = updatedChoices.splice(oldIndex, 1)
    updatedChoices.splice(newIndex, 0, removed)
    onUpdate({
      options: {
        ...question.options,
        choices: updatedChoices,
      },
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = currentOptions.findIndex((opt) => opt.id === active.id)
      const newIndex = currentOptions.findIndex((opt) => opt.id === over.id)
      handleOptionReorder(oldIndex, newIndex)
    }
  }

  const hasChoices = question.type === 'single_choice' ||
                     question.type === 'multiple_choice' ||
                     question.type === 'dropdown'

  const isMultipleChoice = question.type === 'multiple_choice'

  return (
    <div className="space-y-2">
      {/* Question Text */}
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          题目内容
        </label>
        <textarea
          id="question-text"
          value={questionText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="请输入题目内容"
          rows={2}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary-start)]/20 focus:border-[var(--primary-start)]/30',
            'resize-none'
          )}
        />
      </div>

      {/* Question Settings: Required + Type + Max Selections */}
      <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-6">
          {/* Required Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-primary)]">必选</span>
            <button
              onClick={() => handleRequiredChange(!required)}
              role="switch"
              aria-checked={required}
              aria-label="切换必选状态"
              type="button"
              className={cn(
                'relative w-8 h-4 rounded-full transition-colors duration-200',
                required ? 'bg-[var(--primary-start)]' : 'bg-white/10'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200',
                  required ? 'right-0.5' : 'left-0.5'
                )}
              />
            </button>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">题型</span>
            <span className="text-xs text-[var(--text-primary)]">
              {getQuestionTypeShortName(question.type)}
            </span>
          </div>

          {/* Max Selections for multiple choice */}
          {isMultipleChoice && (
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="text-xs text-[var(--text-muted)]">最多选项数</span>
              <input
                type="number"
                min={1}
                max={currentOptions.length}
                value={question.options?.max_selections ?? currentOptions.length}
                onChange={(e) => {
                  const value = e.target.value
                  const num = parseInt(value, 10)
                  if (!isNaN(num) && num >= 1 && num <= currentOptions.length) {
                    onUpdate({
                      options: {
                        ...question.options,
                        max_selections: num,
                      },
                    })
                  }
                }}
                className={cn(
                  'w-12 px-1.5 py-0.5 rounded',
                  'bg-white/5 border border-white/10',
                  'text-xs text-[var(--text-primary)]',
                  'text-center',
                  'focus:outline-none focus:ring-1 focus:ring-[var(--primary-start)]/20 focus:border-[var(--primary-start)]/30',
                  'transition-colors'
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Choices Editor for single/multiple choice and dropdown */}
      {hasChoices && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
              选项设置
            </label>
            <button
              onClick={handleAddOption}
              aria-label="添加选项"
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                'text-xs font-medium',
                'bg-indigo-500/10 text-indigo-400',
                'hover:bg-indigo-500/20',
                'transition-colors'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              添加选项
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentOptions.map(opt => opt.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {currentOptions.map((option: ChoiceOption, index: number) => (
                  <SortableOptionItem
                    key={option.id}
                    option={option}
                    index={index}
                    onUpdate={handleUpdateOption}
                    onDelete={handleDeleteOption}
                    totalCount={currentOptions.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {currentOptions.length === 0 && (
            <div className="p-4 rounded-lg border border-dashed border-white/20 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-2">
                暂无选项
              </p>
              <button
                onClick={handleAddOption}
                aria-label="添加第一个选项"
                type="button"
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'text-sm font-medium',
                  'bg-indigo-500/10 text-indigo-400',
                  'hover:bg-indigo-500/20',
                  'transition-colors'
                )}
              >
                <Plus className="w-4 h-4" />
                添加第一个选项
              </button>
            </div>
          )}

          <p className="text-xs text-[var(--text-muted)] px-1">
            提示：拖拽手柄可调整选项顺序
          </p>
        </div>
      )}

      {/* Placeholder for other question types */}
      {!hasChoices && (
        <div className="p-4 rounded-xl border border-dashed border-white/20">
          <p className="text-sm text-[var(--text-muted)] text-center">
            更多配置选项即将推出...
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// Helper Functions
// ============================================

function getQuestionTypeName(type: QuestionType): string {
  const names: Record<QuestionType, string> = {
    single_choice: '单选题',
    multiple_choice: '多选题',
    dropdown: '下拉选择',
    rating: '评分题',
    text: '文本题',
    textarea: '多行文本',
    number: '数字题',
    date: '日期题',
    email: '邮箱题',
    phone: '电话题',
    file_upload: '文件上传',
    matrix: '矩阵题',
    sorting: '排序题',
  }
  return names[type] || type
}

function getQuestionTypeShortName(type: QuestionType): string {
  const names: Record<QuestionType, string> = {
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
  return names[type] || type
}

// ============================================
// Sortable Option Item Component
// ============================================

interface SortableOptionItemProps {
  option: ChoiceOption
  index: number
  onUpdate: (optionId: string, label: string) => void
  onDelete: (optionId: string) => void
  totalCount: number
}

function SortableOptionItem({ option, index, onUpdate, onDelete, totalCount }: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: option.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg',
        'bg-white/5 border border-white/10',
        'group hover:border-white/20',
        'transition-colors'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Option Label */}
      <input
        id={`option-${option.id}`}
        type="text"
        value={option.label}
        onChange={(e) => onUpdate(option.id, e.target.value)}
        placeholder={`选项 ${index + 1}`}
        className={cn(
          'flex-1 px-2 py-1.5 rounded-md',
          'bg-white/5 border border-white/5',
          'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:ring-1 focus:ring-[var(--primary-start)]/20 focus:border-[var(--primary-start)]/30',
          'transition-colors'
        )}
      />

      {/* Delete Button */}
      <button
        onClick={() => onDelete(option.id)}
        disabled={totalCount <= 1}
        aria-label={`删除选项 ${option.label}`}
        type="button"
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 -mr-2',
          'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        title={totalCount <= 1 ? '至少保留一个选项' : '删除选项'}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function PropertyPanel({
  selectedQuestion,
  onUpdateQuestion,
  isOpen = true,
  questionNumber,
}: PropertyPanelProps) {
  const handleUpdate = (updates: Partial<BuilderQuestion>) => {
    if (selectedQuestion) {
      onUpdateQuestion?.(selectedQuestion.id, updates)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'w-80 border-l border-white/5 bg-[var(--bg-secondary)]',
        'flex flex-col h-full',
        'transition-all duration-300'
      )}
    >
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-white/5">
        {questionNumber !== undefined && (
          <span className="text-3xl font-bold text-indigo-400 mr-3">
            {questionNumber}
          </span>
        )}
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          题目属性
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {selectedQuestion ? (
          <QuestionProperties
            question={selectedQuestion}
            onUpdate={handleUpdate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                'bg-white/5'
              )}
            >
              <Settings2 className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              未选择题目
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              点击题目卡片以编辑属性
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Collapsible Property Panel
// ============================================

interface CollapsiblePropertyPanelProps {
  selectedQuestion: BuilderQuestion | null
  onUpdateQuestion?: (questionId: string, updates: Partial<BuilderQuestion>) => void
  isOpen?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  questionNumber?: number
}

export function CollapsiblePropertyPanel({
  selectedQuestion,
  onUpdateQuestion,
  isOpen = true,
  isCollapsed = false,
  onToggleCollapse,
  questionNumber,
}: CollapsiblePropertyPanelProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'border-l border-white/5 bg-[var(--bg-secondary)] transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-80'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? '展开面板' : '收起面板'}
        type="button"
        className={cn(
          'absolute top-4 -left-5 w-5 h-10 rounded-l-xl',
          'bg-[var(--bg-secondary)] border border-l-0 border-r border-white/5',
          'flex items-center justify-center',
          'hover:bg-[var(--bg-tertiary)] transition-colors',
          isCollapsed && 'rotate-180'
        )}
      >
        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {!isCollapsed && (
        <PropertyPanel
          selectedQuestion={selectedQuestion}
          onUpdateQuestion={onUpdateQuestion}
          isOpen={isOpen}
          questionNumber={questionNumber}
        />
      )}
    </div>
  )
}
