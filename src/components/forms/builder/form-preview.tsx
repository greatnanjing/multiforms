/* ============================================
   MultiForms Form Preview Component

   表单预览区组件：
   - 表单标题/描述编辑
   - 题目卡片列表
   - 添加题目区域
============================================ */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Lock, Eye, Clock, Shield, Plus } from 'lucide-react'
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
  /** 隐私设置 */
  privacySettings?: PrivacySettingsData
  /** 更新隐私设置 */
  onPrivacySettingsChange?: (settings: PrivacySettingsData) => void
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
  const [editTitle, setEditTitle] = useState(title)
  const [editDesc, setEditDesc] = useState(description)

  // Sync local state when props change
  useEffect(() => {
    setEditTitle(title)
    setEditDesc(description)
  }, [title, description])

  const handleTitleBlur = () => {
    onTitleChange?.(editTitle)
  }

  const handleDescBlur = () => {
    onDescriptionChange?.(editDesc)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        placeholder="未命名表单"
        className={cn(
          'w-full bg-transparent text-2xl font-bold',
          'placeholder:text-white/40',
          'focus:outline-none text-white'
        )}
      />
      <textarea
        value={editDesc}
        onChange={(e) => setEditDesc(e.target.value)}
        onBlur={handleDescBlur}
        placeholder="表单描述（可选）"
        rows={2}
        className={cn(
          'w-full bg-transparent text-sm',
          'placeholder:text-white/40 resize-none',
          'focus:outline-none text-white/80'
        )}
      />
    </div>
  )
}

// ============================================
// Privacy Settings Types
// ============================================

export interface PrivacySettingsData {
  requirePassword: boolean
  password?: string
  limitResponses: boolean
  maxResponses?: number
  allowAnonymous: boolean
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettingsData = {
  requirePassword: false,
  password: '',
  limitResponses: false,
  maxResponses: 100,
  allowAnonymous: true,
}

// ============================================
// Privacy Settings Component
// ============================================

interface PrivacySettingsProps {
  requirePassword: boolean
  password?: string
  limitResponses: boolean
  maxResponses?: number
  allowAnonymous: boolean
  onSettingsChange: (settings: PrivacySettingsData) => void
}

function PrivacySettings({
  requirePassword,
  password,
  limitResponses,
  maxResponses,
  allowAnonymous,
  onSettingsChange,
}: PrivacySettingsProps) {
  // Merge with defaults for safe handling
  const settings: PrivacySettingsData = {
    ...DEFAULT_PRIVACY_SETTINGS,
    requirePassword,
    password,
    limitResponses,
    maxResponses,
    allowAnonymous,
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20">
          <Lock className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">隐私设置</h3>
          <p className="text-xs text-[var(--text-muted)]">控制表单的访问和提交权限</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 密码保护 */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">密码保护</div>
              <div className="text-xs text-[var(--text-muted)]">需要密码才能访问表单</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={requirePassword}
            aria-label="切换密码保护"
            onClick={() => onSettingsChange({ ...settings, requirePassword: !requirePassword })}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              requirePassword ? 'bg-indigo-500' : 'bg-white/10'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                requirePassword ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {requirePassword && (
          <div className="pl-4">
            <input
              type="text"
              value={password || ''}
              onChange={(e) => onSettingsChange({ ...settings, password: e.target.value })}
              placeholder="设置访问密码"
              aria-label="访问密码"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg',
                'bg-black/30 border border-white/10',
                'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30'
              )}
            />
          </div>
        )}

        {/* 提交限制 */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/15">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">限制提交次数</div>
              <div className="text-xs text-[var(--text-muted)]">设置表单最大接收数量</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={limitResponses}
            aria-label="切换提交限制"
            onClick={() => onSettingsChange({ ...settings, limitResponses: !limitResponses })}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              limitResponses ? 'bg-indigo-500' : 'bg-white/10'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                limitResponses ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {limitResponses && (
          <div className="pl-4 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100000}
              value={maxResponses ?? 100}
              onChange={(e) => {
                const value = Math.max(1, Math.min(100000, parseInt(e.target.value) || 1))
                onSettingsChange({ ...settings, maxResponses: value })
              }}
              aria-label="最大提交次数"
              className={cn(
                'w-24 px-3 py-2 rounded-lg',
                'bg-black/30 border border-white/10',
                'text-sm text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30'
              )}
            />
            <span className="text-sm text-[var(--text-muted)]">次提交后关闭表单</span>
          </div>
        )}

        {/* 匿名提交 */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/15">
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">允许匿名提交</div>
              <div className="text-xs text-[var(--text-muted)]">不收集用户身份信息</div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={allowAnonymous}
            aria-label="切换匿名提交"
            onClick={() => onSettingsChange({ ...settings, allowAnonymous: !allowAnonymous })}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              allowAnonymous ? 'bg-indigo-500' : 'bg-white/10'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                allowAnonymous ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>

        {/* 提示信息 */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-black/20 border border-indigo-500/20">
          <Clock className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-300">
            更改隐私设置将立即生效。已提交的数据不受影响。
          </p>
        </div>
      </div>
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
        点击左侧题型工具添加题目
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
  privacySettings,
  onPrivacySettingsChange,
}: FormPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Drop zone for reordering (entire form preview)
  const { setNodeRef: setFormRef } = useDroppable({
    id: 'form-preview',
    data: {
      accepts: ['question-card'],
    },
  })

  const handleAddQuestion = useCallback(() => {
    onAddQuestion?.('single_choice')
  }, [onAddQuestion])

  const questionIds = questions.map((q) => q.id)

  return (
    <div ref={setFormRef} className={cn('flex-1 overflow-y-auto custom-scrollbar', className)}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Form Header */}
        <div
          className={cn(
            'p-6 rounded-2xl border mb-6 transition-all duration-200',
            'bg-gradient-to-br from-indigo-500/10 to-violet-500/10',
            'border-indigo-500/30'
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

        {/* Privacy Settings */}
        {questions.length > 0 && (
          <div className="mt-8">
            <PrivacySettings
              requirePassword={privacySettings?.requirePassword ?? false}
              password={privacySettings?.password}
              limitResponses={privacySettings?.limitResponses ?? false}
              maxResponses={privacySettings?.maxResponses}
              allowAnonymous={privacySettings?.allowAnonymous ?? true}
              onSettingsChange={(settings) => onPrivacySettingsChange?.(settings)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
