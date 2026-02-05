/* ============================================
   MultiForms Form Builder Page

   表单构建器页面：
   - 左侧题型工具箱（280px）
   - 中央表单预览区（最大宽720px）
   - 右侧属性面板（可选）
   - 移动端底部抽屉
============================================ */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  Eye,
  Save,
  Play,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { getFormById, getFormByShortId } from '@/lib/api/forms'
import type { QuestionType, Form } from '@/types'
import {
  QuestionToolbox,
  FormPreview,
  MobileDrawer,
  MobileDrawerToggle,
  CollapsiblePropertyPanel,
} from '@/components/forms/builder'

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

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function createDefaultQuestion(type: QuestionType, order: number): BuilderQuestion {
  const defaultTexts: Partial<Record<QuestionType, string>> = {
    single_choice: '请选择一个选项',
    multiple_choice: '请选择适用的选项',
    dropdown: '请从下拉列表中选择',
    rating: '请进行评分',
    text: '请输入您的回答',
    textarea: '请输入您的详细回答',
    number: '请输入数字',
    date: '请选择日期',
    email: '请输入您的邮箱',
    phone: '请输入您的手机号',
    file_upload: '请上传文件',
    matrix: '请对以下项目进行评价',
    sorting: '请对以下选项进行排序',
  }

  return {
    id: generateId(),
    type,
    question_text: defaultTexts[type] || '请输入题目',
    required: false,
    order,
  }
}

// ============================================
// Main Component
// ============================================

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  // Form state
  const [form, setForm] = useState<Form | null>(null)
  const [title, setTitle] = useState('未命名表单')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<BuilderQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // UI state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isPropertyPanelCollapsed, setIsPropertyPanelCollapsed] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      try {
        // formId 可能是数据库 ID 或 short_id
        // 先尝试作为 ID 查询，失败则尝试作为 short_id
        let data: Form | null = null
        try {
          data = await getFormById(formId)
        } catch {
          // 如果 ID 查询失败，尝试用 short_id
          try {
            data = await getFormByShortId(formId)
          } catch {
            throw new Error('表单不存在')
          }
        }

        if (data) {
          setForm(data)
          setTitle(data.title)
          setDescription(data.description || '')

          // Load questions (would need API call)
          // For now, use sample questions
          setQuestions([
            {
              id: 'q1',
              type: 'single_choice',
              question_text: '您使用我们产品多久了？',
              required: true,
              order: 0,
            },
            {
              id: 'q2',
              type: 'rating',
              question_text: '您对产品的整体满意度如何？',
              required: true,
              order: 1,
            },
          ])
        }
      } catch (error) {
        console.error('Failed to load form:', error)
        // 可以跳转到 404 或显示错误
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [formId])

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Check if dragging from toolbox
      if (typeof activeId === 'string' && activeId.startsWith('toolbox-')) {
        const type = activeId.replace('toolbox-', '') as QuestionType
        handleAddQuestion(type)
        return
      }

      // Check if reordering questions
      if (activeId !== overId) {
        setQuestions((prev) => {
          const oldIndex = prev.findIndex((q) => q.id === activeId)
          const newIndex = prev.findIndex((q) => q.id === overId)

          return arrayMove(prev, oldIndex, newIndex).map((q, i) => ({
            ...q,
            order: i,
          }))
        })
      }
    },
    []
  )

  // Question handlers
  const handleAddQuestion = useCallback(
    (type: QuestionType) => {
      const newQuestion = createDefaultQuestion(type, questions.length)
      setQuestions((prev) => [...prev, newQuestion])
      setSelectedQuestionId(newQuestion.id)
    },
    [questions.length]
  )

  const handleEditQuestion = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId)
  }, [])

  const handleCopyQuestion = useCallback((questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      const newQuestion = {
        ...question,
        id: generateId(),
        order: questions.length,
      }
      setQuestions((prev) => [...prev, newQuestion])
    }
  }, [questions])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null)
    }
  }, [selectedQuestionId])

  const handleToggleRequired = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, required: !q.required } : q
      )
    )
  }, [])

  const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<BuilderQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    )
  }, [])

  // Form handlers
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Save form logic here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Show success indicator
    } finally {
      setSaving(false)
    }
  }, [formId, title, description, questions])

  const handlePreview = useCallback(() => {
    router.push(`/f/${form?.short_id || formId}`)
  }, [router, form, formId])

  const handlePublish = useCallback(async () => {
    // Publish form logic here
    router.push(`/f/${form?.short_id || formId}`)
  }, [router, form, formId])

  // Advanced features
  const handleAdvancedFeature = useCallback((featureId: string) => {
    switch (featureId) {
      case 'logic':
        // Open logic panel
        break
      case 'theme':
        // Open theme modal
        break
      case 'privacy':
        // Open privacy settings
        break
    }
  }, [])

  // Get selected question
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Main Layout */}
      <div className="flex h-full overflow-hidden">
        {/* Left Sidebar - Question Toolbox */}
        <aside className="hidden lg:flex w-72 bg-[var(--bg-secondary)] border-r border-white/5 flex-shrink-0">
          <QuestionToolbox
            onAddQuestion={handleAddQuestion}
            onAdvancedFeature={handleAdvancedFeature}
          />
        </aside>

        {/* Center - Form Preview */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
          {/* Header */}
          <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/5 bg-[rgba(15,15,35,0.8)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className={cn(
                  'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  'hover:bg-white/5 transition-colors'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">返回</span>
              </button>
              <div className="sm:hidden">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="未命名表单"
                className={cn(
                  'bg-transparent text-base font-semibold text-[var(--text-primary)]',
                  'placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:bg-white/5 focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-2 py-1 -mx-2',
                  'max-w-[200px] sm:max-w-md truncate'
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-white/5 border border-white/10 text-[var(--text-primary)]',
                  'hover:bg-white/10 hover:border-indigo-500/30',
                  saving && 'opacity-70'
                )}
              >
                <Save className={cn('w-4 h-4', saving && 'animate-spin')} />
                <span>{saving ? '保存中...' : '保存'}</span>
              </button>

              <button
                onClick={handlePreview}
                className={cn(
                  'hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-white/5 border border-white/10 text-[var(--text-primary)]',
                  'hover:bg-white/10 hover:border-indigo-500/30'
                )}
              >
                <Eye className="w-4 h-4" />
                <span>预览</span>
              </button>

              <button
                onClick={handlePublish}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
                  'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20',
                  'hover:-translate-y-0.5'
                )}
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">发布</span>
              </button>

              <button className="sm:hidden p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Form Preview Area */}
          <FormPreview
            title={title}
            description={description}
            questions={questions}
            isDragging={activeId !== null}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onCopyQuestion={handleCopyQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onToggleRequired={handleToggleRequired}
            onReorder={setQuestions}
          />
        </main>

        {/* Right Sidebar - Property Panel */}
        <CollapsiblePropertyPanel
          selectedQuestion={selectedQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          isCollapsed={isPropertyPanelCollapsed}
          onToggleCollapse={() => setIsPropertyPanelCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Toggle */}
      <MobileDrawerToggle
        onClick={() => setIsMobileDrawerOpen(true)}
        count={questions.length}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onAddQuestion={handleAddQuestion}
        onAdvancedFeature={handleAdvancedFeature}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && typeof activeId === 'string' && activeId.startsWith('toolbox-') && (
          <div className="px-4 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <p className="text-sm text-[var(--text-primary)]">拖放到此处添加题目</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
