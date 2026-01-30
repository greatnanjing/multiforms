/* ============================================
   MultiForms Property Panel Component

   属性面板组件（右侧）：
   - 题目属性编辑
   - 选项管理
   - 验证规则
============================================ */

'use client'

import { useState } from 'react'
import { X, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/types'
import type { BuilderQuestion } from './question-card'

// ============================================
// Types
// ============================================

interface PropertyPanelProps {
  /** 当前选中的题目 */
  selectedQuestion: BuilderQuestion | null
  /** 更新题目回调 */
  onUpdateQuestion?: (questionId: string, updates: Partial<BuilderQuestion>) => void
  /** 关闭面板 */
  onClose?: () => void
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

  const handleTextChange = (value: string) => {
    setQuestionText(value)
    onUpdate({ question_text: value })
  }

  const handleRequiredChange = (value: boolean) => {
    setRequired(value)
    onUpdate({ required: value })
  }

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          题目内容
        </label>
        <textarea
          value={questionText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="请输入题目内容"
          rows={3}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl',
            'bg-white/5 border border-white/10',
            'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30',
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
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors duration-200',
            required ? 'bg-indigo-500' : 'bg-white/10'
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

      {/* Type-specific options placeholder */}
      <div className="p-4 rounded-xl border border-dashed border-white/20">
        <p className="text-sm text-[var(--text-muted)] text-center">
          更多选项配置即将推出...
        </p>
      </div>
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
  onClose,
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          题目属性
        </h2>
        <button
          onClick={onClose}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            'hover:bg-white/5',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'transition-colors'
          )}
        >
          <X className="w-4 h-4" />
        </button>
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

interface CollapsiblePropertyPanelProps extends PropertyPanelProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function CollapsiblePropertyPanel({
  selectedQuestion,
  onUpdateQuestion,
  onClose,
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
        className={cn(
          'absolute top-4 -left-5 w-5 h-10 rounded-l-xl',
          'bg-[var(--bg-secondary)] border border-l-0 border-r border-white/5',
          'flex items-center justify-center',
          'hover:bg-[var(--bg-tertiary)] transition-colors',
          isCollapsed && 'rotate-180'
        )}
      >
        <svg
          className="w-3 h-3 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {!isCollapsed && (
        <PropertyPanel
          selectedQuestion={selectedQuestion}
          onUpdateQuestion={onUpdateQuestion}
          onClose={onClose}
          isOpen={isOpen}
        />
      )}
    </div>
  )
}
