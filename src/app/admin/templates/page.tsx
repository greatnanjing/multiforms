/* ============================================
   MultiForms Admin Templates Page

   模板管理页面：
   - 管理所有模板（无预置概念，全部可增删改查）
   - 创建新模板
   - 编辑现有模板（包括题目和选项）
   - 查看模板详情
   - 删除模板
   - 批量启用/禁用模板
   - 特色标记

   路径: /admin/templates
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Star,
  TrendingUp,
  FolderOpen,
  ListTodo,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { TemplateCategory, QuestionType, QuestionOptions, QuestionValidation } from '@/types'

// ============================================
// Types
// ============================================

/** 模板题目定义 */
export interface TemplateQuestion {
  question_text: string
  question_type: QuestionType
  options?: QuestionOptions
  validation?: QuestionValidation
}

// ============================================
// Types
// ============================================

interface TemplateWithFeatured {
  id: string
  name: string
  description: string
  type: string
  category: TemplateCategory
  iconName: string
  questionsCount: number
  useCount: number
  is_featured: boolean
  is_active: boolean
  tags?: string[]
  questions?: TemplateQuestion[]
}

interface TemplateFormData {
  title: string
  description: string
  category: TemplateCategory
  tags: string[]
  is_featured: boolean
  is_active: boolean
  sort_order: number
  questions: TemplateQuestion[]
}

const categoryLabels: Record<TemplateCategory, string> = {
  vote: '投票',
  survey: '问卷',
  rating: '评分',
  feedback: '反馈',
  collection: '收集',
}

const categoryEmojis: Record<TemplateCategory, string> = {
  vote: '🗳️',
  survey: '📋',
  rating: '⭐',
  feedback: '💬',
  collection: '📝',
}

const questionTypeLabels: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  dropdown: '下拉选择',
  text: '文本题',
  textarea: '多行文本',
  number: '数字题',
  date: '日期题',
  rating: '评分题',
  email: '邮箱题',
  phone: '电话题',
}

// ============================================
// Components
// ============================================

// 题目编辑器组件
function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: TemplateQuestion
  index: number
  onUpdate: (index: number, question: TemplateQuestion) => void
  onRemove: (index: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleUpdate = (field: keyof TemplateQuestion, value: any) => {
    onUpdate(index, { ...question, [field]: value })
  }

  const handleOptionUpdate = (optionIndex: number, value: string) => {
    const choices = question.options?.choices || []
    const newChoices = [...choices]
    newChoices[optionIndex] = { ...newChoices[optionIndex], label: value, value: value.toLowerCase().replace(/\s+/g, '-') }
    onUpdate(index, {
      ...question,
      options: { ...question.options, choices: newChoices }
    })
  }

  const handleAddOption = () => {
    const choices = question.options?.choices || []
    const newChoice = {
      id: String(choices.length + 1),
      label: `选项 ${choices.length + 1}`,
      value: `option-${choices.length + 1}`
    }
    onUpdate(index, {
      ...question,
      options: { ...question.options, choices: [...choices, newChoice] }
    })
  }

  const handleRemoveOption = (optionIndex: number) => {
    const choices = question.options?.choices || []
    onUpdate(index, {
      ...question,
      options: { ...question.options, choices: choices.filter((_, i) => i !== optionIndex) }
    })
  }

  const hasOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.question_type)

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      {/* 题目头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => handleUpdate('question_text', e.target.value)}
            placeholder="题目标题"
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
            title="展开/收起"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="删除题目"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="space-y-3 pl-8">
          {/* 题目类型 */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs text-[var(--text-muted)]">类型:</label>
            <select
              value={question.question_type}
              onChange={(e) => {
                e.stopPropagation()
                handleUpdate('question_type', e.target.value)
              }}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500 cursor-pointer"
            >
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <option key={value} value={value} className="bg-[var(--bg-secondary)] text-white">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 选项列表（选择题） */}
          {hasOptions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[var(--text-muted)]">选项:</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                >
                  + 添加选项
                </button>
              </div>
              {(question.options?.choices || []).map((choice, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] w-4">{optIndex + 1}.</span>
                  <input
                    type="text"
                    value={choice.label}
                    onChange={(e) => handleOptionUpdate(optIndex, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500"
                    placeholder={`选项 ${optIndex + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIndex)}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 必填开关 */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-white">必填</span>
            <button
              type="button"
              onClick={() => handleUpdate('validation', {
                ...(question.validation || {}),
                required: !question.validation?.required
              })}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                question.validation?.required ? 'bg-purple-500' : 'bg-white/10'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                  question.validation?.required ? 'left-5' : 'left-0.5'
                )}
              />
            </button>
          </label>
        </div>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  onToggleFeatured,
  onToggleActive,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  template: TemplateWithFeatured
  onToggleFeatured: (id: string, featured: boolean) => void
  onToggleActive: (id: string, active: boolean) => void
  onEdit: (template: TemplateWithFeatured) => void
  onDelete: (id: string) => void
  onViewDetails: (template: TemplateWithFeatured) => void
}) {
  return (
    <div className={cn(
      'p-5 rounded-2xl border transition-all bg-white/5 border-white/10 hover:bg-white/10',
      !template.is_active && 'opacity-60 grayscale-[0.5]'
    )}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            {categoryEmojis[template.category] || '📄'}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-medium truncate">{template.name}</h3>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {categoryLabels[template.category] || template.category}
            </p>
          </div>
        </div>

        {/* 快速操作按钮 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 特色按钮 */}
          <button
            onClick={() => onToggleFeatured(template.id, !template.is_featured)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              template.is_featured
                ? 'text-yellow-400 hover:text-yellow-300'
                : 'text-[var(--text-muted)] hover:text-yellow-400'
            )}
            title={template.is_featured ? '取消特色' : '设为特色'}
          >
            <Star className={cn('w-4 h-4', template.is_featured && 'fill-current')} />
          </button>

          {/* 启用/禁用按钮 */}
          <button
            onClick={() => onToggleActive(template.id, !template.is_active)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              template.is_active
                ? 'text-green-400 hover:text-green-300'
                : 'text-[var(--text-muted)] hover:text-green-400'
            )}
            title={template.is_active ? '禁用模板' : '启用模板'}
          >
            {template.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 min-h-[40px]">
        {template.description}
      </p>

      {/* 统计 */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <TrendingUp className="w-4 h-4" />
          <span>{template.useCount} 次使用</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs ml-auto">
          <span>{template.questionsCount} 个题目</span>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {template.is_featured && (
            <span className="text-xs font-medium text-yellow-400">✨ 特色</span>
          )}
          {!template.is_active && (
            <span className="text-xs font-medium text-gray-400">已禁用</span>
          )}
          {!template.is_featured && template.is_active && (
            <span className="text-xs font-medium text-[var(--text-muted)]">普通</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(template)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
          >
            查看详情
          </button>
          <button
            onClick={() => onEdit(template)}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white text-sm transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="删除模板"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 模板详情对话框
function TemplateDetailDialog({
  template,
  isOpen,
  onClose,
}: {
  template: TemplateWithFeatured | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
              {categoryEmojis[template.category] || '📄'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{template.name}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {categoryLabels[template.category]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 描述 */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2">模板描述</h3>
            <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-white">{template.questionsCount}</p>
              <p className="text-xs text-[var(--text-muted)]">题目数量</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-white">{template.useCount}</p>
              <p className="text-xs text-[var(--text-muted)]">使用次数</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-white">
                {template.is_featured ? '特色' : '普通'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">模板类型</p>
            </div>
          </div>

          {/* 标签 */}
          {template.tags && template.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white mb-2">标签</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 题目列表 */}
          {template.questions && template.questions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white mb-3">包含题目</h3>
              <div className="space-y-2">
                {template.questions.map((q, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{q.question_text}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {questionTypeLabels[q.question_type] || '题目'}
                          {q.validation?.required && ' • 必填'}
                        </p>
                        {/* 选项预览 */}
                        {q.options?.choices && q.options.choices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.options.choices.map((choice, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-white/5 text-xs text-[var(--text-secondary)]"
                              >
                                {choice.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">状态:</span>
              <span className={cn(
                'text-sm font-medium',
                template.is_active ? 'text-green-400' : 'text-gray-400'
              )}>
                {template.is_active ? '启用中' : '已禁用'}
              </span>
            </div>
            {template.is_featured && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-400">✨ 特色模板</span>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// 模板编辑/创建对话框
function TemplateDialog({
  template,
  isOpen,
  onClose,
  onSave,
}: {
  template: TemplateWithFeatured | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: TemplateFormData) => Promise<void>
}) {
  const [formData, setFormData] = useState<TemplateFormData>({
    title: '',
    description: '',
    category: 'collection',
    tags: [],
    is_featured: false,
    is_active: true,
    sort_order: 0,
    questions: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [questionsTab, setQuestionsTab] = useState<'basic' | 'questions'>('basic')

  const isEditing = template !== null

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags || [],
        is_featured: template.is_featured || false,
        is_active: template.is_active !== false,
        sort_order: 0,
        questions: template.questions || [],
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'collection',
        tags: [],
        is_featured: false,
        is_active: true,
        sort_order: 0,
        questions: [],
      })
    }
    setQuestionsTab('basic')
    setTagInput('')
  }, [template, isOpen])

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleAddQuestion = () => {
    const newQuestion: TemplateQuestion = {
      question_text: '',
      question_type: 'single_choice',
      options: {
        choices: [
          { id: '1', label: '选项1', value: 'option-1' },
          { id: '2', label: '选项2', value: 'option-2' }
        ]
      },
      validation: { required: false }
    }
    setFormData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }))
  }

  const handleUpdateQuestion = (index: number, question: TemplateQuestion) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = question
    setFormData(prev => ({ ...prev, questions: newQuestions }))
  }

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-3xl rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? '编辑模板' : '新建模板'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 选项卡切换 */}
        <div className="flex border-b border-white/10 px-6 flex-shrink-0">
          <button
            onClick={() => setQuestionsTab('basic')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors relative',
              questionsTab === 'basic' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
            )}
          >
            基本信息
            {questionsTab === 'basic' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
          </button>
          <button
            onClick={() => setQuestionsTab('questions')}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors relative',
              questionsTab === 'questions' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
            )}
          >
            题目设置 ({formData.questions.length})
            {questionsTab === 'questions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* 基本信息选项卡 */}
          {questionsTab === 'basic' && (
            <div className="p-6 space-y-5">
              {/* 标题 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">模板名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入模板名称"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* 描述 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">模板描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述模板的用途和特点"
                  rows={3}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* 分类 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">模板分类 *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TemplateCategory }))}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[var(--bg-secondary)]">
                      {categoryEmojis[value as TemplateCategory]} {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 标签 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">标签</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后回车"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    添加
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 开关选项 */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white">设为特色模板</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      formData.is_featured ? 'bg-yellow-500' : 'bg-white/10'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                        formData.is_featured ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-white">启用模板</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      formData.is_active ? 'bg-green-500' : 'bg-white/10'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                        formData.is_active ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* 题目设置选项卡 */}
          {questionsTab === 'questions' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">
                  添加和编辑模板题目
                </p>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加题目
                </button>
              </div>

              {formData.questions.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/5 border border-dashed border-white/20">
                  <ListTodo className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">暂无题目</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">点击上方按钮添加题目</p>
                </div>
              ) : (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  {formData.questions.map((q, index) => (
                    <QuestionEditor
                      key={index}
                      question={q}
                      index={index}
                      onUpdate={handleUpdateQuestion}
                      onRemove={handleRemoveQuestion}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* 底部按钮 */}
        <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit(new Event('submit') as any)
            }}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// 删除确认对话框
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  templateName,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  templateName: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">确认删除</h3>
        </div>

        <p className="text-[var(--text-secondary)] mb-6">
          确定要删除模板 <span className="text-white font-medium">「{templateName}」</span> 吗？此操作无法撤销。
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Templates Page Component
// ============================================

export default function AdminTemplatesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 模板状态
  const [templates, setTemplates] = useState<TemplateWithFeatured[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithFeatured | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [viewingTemplate, setViewingTemplate] = useState<TemplateWithFeatured | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)

  // 加载模板
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: dbTemplates, error } = await supabase
        .from('templates')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      // 转换模板格式
      const convertedTemplates: TemplateWithFeatured[] = (dbTemplates || []).map((t: any) => ({
        id: t.id,
        name: t.title,
        description: t.description || '',
        type: 'custom',
        category: t.category,
        iconName: 'FileText',
        tags: t.tags || [],
        useCount: t.use_count || 0,
        questionsCount: t.questions?.length || 0,
        is_featured: t.is_featured || false,
        is_active: t.is_active !== false,
        questions: t.questions || [],
      }))

      setTemplates(convertedTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_featured: featured })
        .eq('id', id)

      if (error) throw error

      setTemplates(prev => prev.map(t =>
        t.id === id ? { ...t, is_featured: featured } : t
      ))
    } catch (error) {
      console.error('Failed to toggle featured:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_active: active })
        .eq('id', id)

      if (error) throw error

      setTemplates(prev => prev.map(t =>
        t.id === id ? { ...t, is_active: active } : t
      ))
    } catch (error) {
      console.error('Failed to toggle active:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const handleBatchActivate = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_active: true })
        .neq('is_active', true)

      if (error) throw error

      setTemplates(prev => prev.map(t => ({ ...t, is_active: true })))
    } catch (error) {
      console.error('Failed to batch activate:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const handleBatchDeactivate = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_active: false })
        .eq('is_active', true)

      if (error) throw error

      setTemplates(prev => prev.map(t => ({ ...t, is_active: false })))
    } catch (error) {
      console.error('Failed to batch deactivate:', error)
      alert('操作失败，请稍后重试')
    }
  }

  const handleEdit = (template: TemplateWithFeatured) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleViewDetails = async (template: TemplateWithFeatured) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('id', template.id)
        .single()

      if (data) {
        const detailTemplate: TemplateWithFeatured = {
          ...template,
          questions: data.questions || [],
        }
        setViewingTemplate(detailTemplate)
      } else {
        setViewingTemplate(template)
      }
      setDetailDialogOpen(true)
    } catch (error) {
      console.error('Failed to load template details:', error)
      setViewingTemplate(template)
      setDetailDialogOpen(true)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleSave = async (data: TemplateFormData) => {
    const supabase = createClient()

    if (!editingTemplate) {
      // 新建模板
      const { data: insertedData, error: insertError } = await supabase
        .from('templates')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          is_featured: data.is_featured,
          is_active: data.is_active,
          sort_order: data.sort_order,
          use_count: 0,
          questions: data.questions,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newTemplate: TemplateWithFeatured = {
        id: insertedData.id,
        name: insertedData.title,
        description: insertedData.description || '',
        category: insertedData.category,
        tags: insertedData.tags,
        type: 'custom',
        iconName: 'FileText',
        useCount: 0,
        questionsCount: data.questions.length,
        is_featured: insertedData.is_featured,
        is_active: insertedData.is_active,
        questions: data.questions,
      }
      setTemplates(prev => [...prev, newTemplate])
    } else {
      // 更新模板
      const { error } = await supabase
        .from('templates')
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          is_featured: data.is_featured,
          is_active: data.is_active,
          questions: data.questions,
        })
        .eq('id', editingTemplate.id)

      if (error) throw error

      setTemplates(prev => prev.map(t =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: data.title,
              description: data.description,
              category: data.category,
              tags: data.tags,
              is_featured: data.is_featured,
              is_active: data.is_active,
              questions: data.questions,
              questionsCount: data.questions.length,
            }
          : t
      ))
    }

    await loadTemplates()
  }

  const handleDelete = (id: string) => {
    setDeletingTemplateId(id)
    const template = templates.find(t => t.id === id)
    if (template) {
      setDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!deletingTemplateId) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', deletingTemplateId)

      if (error) throw error

      setTemplates(prev => prev.filter(t => t.id !== deletingTemplateId))
      setDeleteDialogOpen(false)
      setDeletingTemplateId(null)
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('删除失败，请稍后重试')
    }
  }

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [templates, search, categoryFilter])

  // 统计
  const stats = useMemo(() => ({
    total: templates.length,
    featured: templates.filter(t => t.is_featured).length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => t.is_active === false).length,
  }), [templates])

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[var(--text-secondary)]">
            管理所有模板，支持增删改查操作
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchActivate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            启用所有
          </button>
          <button
            onClick={handleBatchDeactivate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 text-sm font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            禁用所有
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            新建模板
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ListTodo className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-[var(--text-muted)]">全部模板</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.featured}</p>
              <p className="text-xs text-[var(--text-muted)]">特色模板</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-[var(--text-muted)]">启用中</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/20">
              <EyeOff className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inactive}</p>
              <p className="text-xs text-[var(--text-muted)]">已禁用</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 搜索 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all" className="bg-[var(--bg-secondary)]">全部分类</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[var(--bg-secondary)]">
              {categoryEmojis[value as TemplateCategory]} {label}
            </option>
          ))}
        </select>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          显示 <span className="text-white font-medium">{filteredTemplates.length}</span> 个模板
        </span>
        {isLoading && (
          <span className="flex items-center gap-2 text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载中...
          </span>
        )}
      </div>

      {/* 模板列表 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">
            {isLoading ? '加载中...' : search || categoryFilter !== 'all' ? '没有找到匹配的模板' : '暂无模板，点击新建模板创建'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggleFeatured={handleToggleFeatured}
              onToggleActive={handleToggleActive}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* 编辑/创建对话框 */}
      <TemplateDialog
        template={editingTemplate}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* 详情查看对话框 */}
      <TemplateDetailDialog
        template={viewingTemplate}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        templateName={templates.find(t => t.id === deletingTemplateId)?.name || ''}
      />
    </div>
  )
}
