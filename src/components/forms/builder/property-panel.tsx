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

  // Track previous question ID to detect when switching questions
  const prevQuestionIdRef = useRef(question.id)

  // Sync local state only when switching to a different question
  useEffect(() => {
    if (question.id !== prevQuestionIdRef.current) {
      setQuestionText(question.question_text)
      setRequired(question.required)
      prevQuestionIdRef.current = question.id
    }
  }, [question.id, question.question_text, question.required])

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
    console.log('[PropertyPanel] handleRequiredChange:', {
      questionId: question.id,
      oldValue: required,
      newValue: value,
      questionValidation: question.validation,
    })
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
    onUpdate({
      options: {
        ...question.options,
        choices: [...(question.options?.choices || []), newOption],
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
      },
    })
  }

  const hasChoices = question.type === 'single_choice' ||
                     question.type === 'multiple_choice' ||
                     question.type === 'dropdown'

  return (
    <div className="space-y-6">
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
          rows={3}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary-start)]/20 focus:border-[var(--primary-start)]/30',
            'resize-none'
          )}
        />
      </div>

      {/* Required Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            必填项
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            用户必须回答此题目才能提交
          </div>
        </div>
        <button
          onClick={() => handleRequiredChange(!required)}
          role="switch"
          aria-checked={required}
          aria-label="切换必填状态"
          type="button"
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors duration-200',
            required ? 'bg-[var(--primary-start)]' : 'bg-white/10'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
              required ? 'left-7' : 'left-1'
            )}
          />
        </button>
      </div>

      {/* Question Type Info */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">题型类型</span>
        </div>
        <div className="text-sm text-[var(--text-primary)]">
          {getQuestionTypeName(question.type)}
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

          <div className="space-y-2">
            {currentOptions.map((option: ChoiceOption, index: number) => (
              <div
                key={option.id}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-lg',
                  'bg-white/5 border border-white/10',
                  'group hover:border-white/20',
                  'transition-colors'
                )}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-[var(--text-muted)]">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Option Label */}
                <input
                  id={`option-${option.id}`}
                  type="text"
                  value={option.label}
                  onChange={(e) => handleUpdateOption(option.id, e.target.value)}
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
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={currentOptions.length <= 1}
                  aria-label={`删除选项 ${option.label}`}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10',
                    'disabled:opacity-30 disabled:cursor-not-allowed',
                    'transition-colors'
                  )}
                  title={currentOptions.length <= 1 ? '至少保留一个选项' : '删除选项'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

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
          </div>

          <p className="text-xs text-[var(--text-muted)] px-1">
            提示：点击输入框编辑选项内容
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

// ============================================
// Main Component
// ============================================

export function PropertyPanel({
  selectedQuestion,
  onUpdateQuestion,
  isOpen = true,
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
        'w-72 border-l border-white/5 bg-[var(--bg-secondary)]',
        'flex flex-col h-full',
        'transition-all duration-300'
      )}
    >
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-white/5">
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
}

export function CollapsiblePropertyPanel({
  selectedQuestion,
  onUpdateQuestion,
  isOpen = true,
  isCollapsed = false,
  onToggleCollapse,
}: CollapsiblePropertyPanelProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'border-l border-white/5 bg-[var(--bg-secondary)] transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-72'
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
        />
      )}
    </div>
  )
}
