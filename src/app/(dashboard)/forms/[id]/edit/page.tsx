/* ============================================
   MultiForms Form Builder Page

   表单构建器页面：
   - 左侧题型工具箱（280px）
   - 中央表单预览区（最大宽720px）
   - 右侧属性面板（可选）
   - 移动端底部抽屉
============================================ */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
import { getFormById, getFormByShortId, updateForm, publishForm, generateShortId } from '@/lib/api/forms'
import { getQuestions, updateQuestions, createQuestions, deleteQuestion } from '@/lib/api/questions'
import type { QuestionType, Form } from '@/types'
import {
  QuestionToolbox,
  FormPreview,
  FormPreviewModal,
  MobileDrawer,
  MobileDrawerToggle,
  CollapsiblePropertyPanel,
  PublishModal,
} from '@/components/forms/builder'
import { useToast } from '@/components/shared/toast'

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
  validation?: any
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

  // Default options for choice-based questions
  const getDefaultOptions = (questionType: QuestionType) => {
    if (questionType === 'single_choice' || questionType === 'multiple_choice' || questionType === 'dropdown') {
      return {
        choices: [
          { id: `opt-${Date.now()}-1`, label: '选项 1', value: 'option-1' },
          { id: `opt-${Date.now()}-2`, label: '选项 2', value: 'option-2' },
        ],
      }
    }
    return {}
  }

  return {
    id: generateId(),
    type,
    question_text: defaultTexts[type] || '请输入题目',
    required: false,
    order,
    options: getDefaultOptions(type),
  }
}

// ============================================
// Main Component
// ============================================

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  const toast = useToast()

  // Form state
  const [form, setForm] = useState<Form | null>(null)
  const [title, setTitle] = useState('未命名表单')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<BuilderQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    requirePassword: false,
    password: '',
    limitResponses: false,
    maxResponses: 100,
    allowAnonymous: true,
  })

  // UI state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isPropertyPanelCollapsed, setIsPropertyPanelCollapsed] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Auto-save refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)

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

          // Load privacy settings from form data
          setPrivacySettings({
            requirePassword: data.access_type === 'password',
            password: data.access_password || '',
            limitResponses: data.max_responses !== null,
            maxResponses: data.max_responses || 100,
            allowAnonymous: true, // Default to true - not stored in Form type
          })

          // Load questions from database
          try {
            const questionsData = await getQuestions(data.id)
            const builderQuestions = questionsData.map((q, index) => {
              const required = q.validation?.required || false
              console.log(`[Load] Question ${q.id}:`, {
                validation: q.validation,
                required,
              })
              return {
                id: q.id,
                type: q.question_type as QuestionType,
                question_text: q.question_text,
                required,
                order: q.order_index,
                options: q.options,
                validation: q.validation,
              }
            })
            setQuestions(builderQuestions)
          } catch (error) {
            console.error('Failed to load questions:', error)
            // Set empty questions if loading fails
            setQuestions([])
          }
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

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Drag handlers - only for question reordering
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

      // Only allow reordering existing questions
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
      prev.map((q) => {
        if (q.id === questionId) {
          const newRequired = !q.required
          return {
            ...q,
            required: newRequired,
            validation: {
              ...(q.validation || {}),
              required: newRequired,
            },
          }
        }
        return q
      })
    )
  }, [])

  const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<BuilderQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const updated = { ...q, ...updates }
          // Sync validation.required with required field
          if ('required' in updates) {
            updated.validation = {
              ...(q.validation || {}),
              required: updates.required,
            }
          }
          console.log(`[handleUpdateQuestion] Updated ${questionId}:`, {
            updates,
            oldRequired: q.required,
            newRequired: updated.required,
            oldValidation: q.validation,
            newValidation: updated.validation,
          })
          return updated
        }
        return q
      })
    )
  }, [])

  // Form handlers
  const handleSave = useCallback(async () => {
    // Prevent multiple simultaneous saves
    if (isSavingRef.current) return
    isSavingRef.current = true
    setSaving(true)
    try {
      // Prepare privacy settings for database
      const updateData: any = {
        title,
        description: description || undefined,
      }

      // Update privacy settings
      if (privacySettings.requirePassword) {
        updateData.access_type = 'password' as const
        updateData.access_password = privacySettings.password || null
      } else {
        updateData.access_type = 'public' as const
        updateData.access_password = null
      }

      if (privacySettings.limitResponses) {
        updateData.max_responses = privacySettings.maxResponses || 100
      } else {
        updateData.max_responses = null
      }

      // Update form metadata
      await updateForm(formId, updateData)

      // Sync questions to database
      // Get existing questions from database
      const existingQuestions = await getQuestions(formId)
      const existingQuestionIds = new Set(existingQuestions.map((q) => q.id))

      // Separate questions into update and create batches
      const questionsToUpdate: Array<{ id: string } & any> = []
      const questionsToCreate: any[] = []

      questions.forEach((q, index) => {
        const questionData = {
          id: q.id,
          question_text: q.question_text,
          question_type: q.type,
          options: q.options || {},
          validation: {
            ...q.validation,
            required: q.required,
          },
          logic_rules: [],
          order_index: index,
        }
        // Debug: Log the data being saved
        console.log(`[handleSave] Building question data for ${q.id}:`, {
          required: q.required,
          qValidation: q.validation,
          finalValidation: questionData.validation,
        })

        if (existingQuestionIds.has(q.id)) {
          // Question exists, update it
          questionsToUpdate.push(questionData)
          existingQuestionIds.delete(q.id)
        } else {
          // New question, create it
          questionsToCreate.push(questionData)
        }
      })

      // Update existing questions
      if (questionsToUpdate.length > 0) {
        console.log('[handleSave] Questions to update:', questionsToUpdate.map(q => ({
          id: q.id,
          required: q.required,
          validation: q.validation,
        })))
        await updateQuestions(questionsToUpdate)
      }

      // Create new questions
      if (questionsToCreate.length > 0) {
        // Add form_id to new questions
        const questionsWithFormId = questionsToCreate.map((q) => ({
          ...q,
          form_id: formId,
        }))
        await createQuestions(formId, questionsWithFormId)
      }

      // Delete questions that were removed
      const questionsToDelete = Array.from(existingQuestionIds)
      for (const questionId of questionsToDelete) {
        await deleteQuestion(questionId)
      }

      // Update saved state
      setHasUnsavedChanges(false)
      setLastSavedTime(new Date())
      console.log('Form saved successfully')
    } catch (error) {
      console.error('Failed to save form:', error)
      throw error
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }, [formId, title, description, questions, privacySettings])

  // Debounced auto-save
  const triggerAutoSave = useCallback(() => {
    setHasUnsavedChanges(true)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, 1500) // Auto-save after 1.5 seconds of inactivity
  }, [handleSave])

  // Trigger auto-save when title, description, questions, or privacy settings change
  useEffect(() => {
    if (!loading) {
      triggerAutoSave()
    }
    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, description, questions, privacySettings, loading, triggerAutoSave])

  const handlePreview = useCallback(() => {
    // 打开预览弹窗而不是跳转页面
    setIsPreviewModalOpen(true)
  }, [])

  const handlePublish = useCallback(async () => {
    // Check if there are any questions
    if (questions.length === 0) {
      toast.warning('请先添加题目后再发布表单')
      return
    }

    // Check if there's at least one required question
    const hasRequiredQuestion = questions.some(q => q.required)

    if (!hasRequiredQuestion) {
      // Show error toast
      toast.warning('发布表单前请至少设置一道必填题')
      return
    }

    // Open publish modal
    setIsPublishModalOpen(true)
  }, [questions, toast])

  const handlePublishToggle = useCallback(async (publish: boolean): Promise<string | undefined> => {
    try {
      // Save any pending changes first
      await handleSave()

      const supabase = createClient()

      if (publish) {
        // Publish: set status to 'published' and generate short_id if needed
        const updateData: { status: 'published'; short_id?: string; published_at?: string } = {
          status: 'published',
        }
        let newShortId: string | undefined = form?.short_id

        if (!form?.short_id) {
          // Generate a unique short ID
          let shortId = generateShortId()
          let isUnique = false
          let attempts = 0

          // Check for uniqueness (max 10 attempts)
          while (!isUnique && attempts < 10) {
            const { data } = await supabase
              .from('forms')
              .select('short_id')
              .eq('short_id', shortId)
              .single()

            if (!data) {
              isUnique = true
            } else {
              shortId = generateShortId()
              attempts++
            }
          }

          updateData.short_id = shortId
          updateData.published_at = new Date().toISOString()
          newShortId = shortId
        }

        const { data: updatedForm } = await supabase
          .from('forms')
          .update(updateData)
          .eq('id', formId)
          .select()
          .single()

        if (updatedForm) {
          setForm(updatedForm as Form)
        }

        return newShortId
      } else {
        // Unpublish: set status back to 'draft'
        const { data: updatedForm } = await supabase
          .from('forms')
          .update({ status: 'draft' })
          .eq('id', formId)
          .select()
          .single()

        if (updatedForm) {
          setForm(updatedForm as Form)
        }

        return undefined
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
      throw error
    }
  }, [form, formId, handleSave])

  // Advanced features
  const handleAdvancedFeature = useCallback((featureId: string) => {
    switch (featureId) {
      case 'logic':
        // Open logic panel
        break
      case 'theme':
        // Open theme modal
        break
    }
  }, [])

  // Privacy settings handler
  const handlePrivacySettingsChange = useCallback((settings: { requirePassword: boolean; password?: string; limitResponses: boolean; maxResponses?: number; allowAnonymous: boolean }) => {
    setPrivacySettings({
      requirePassword: settings.requirePassword,
      password: settings.password || '',
      limitResponses: settings.limitResponses,
      maxResponses: settings.maxResponses || 100,
      allowAnonymous: settings.allowAnonymous,
    })
    setHasUnsavedChanges(true)
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
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-primary)]">
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
              {/* Auto-save indicator */}
              {hasUnsavedChanges ? (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
                  <span>未保存</span>
                </div>
              ) : lastSavedTime ? (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                  <span>已保存</span>
                </div>
              ) : null}

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
                title="预览表单填写效果"
              >
                <Eye className="w-4 h-4" />
                <span>预览</span>
              </button>

              <button
                onClick={handlePublish}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  form?.status === 'published'
                    ? 'bg-white/10 text-[var(--text-primary)] border border-white/10 hover:bg-white/20'
                    : 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5'
                )}
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">{form?.status === 'published' ? '已发布' : '发布'}</span>
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
            privacySettings={privacySettings}
            onPrivacySettingsChange={handlePrivacySettingsChange}
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

      {/* Publish Modal */}
      <PublishModal
        form={form}
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublishToggle={handlePublishToggle}
      />

      {/* Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onPublish={() => {
          setIsPreviewModalOpen(false)
          handlePublish()
        }}
        title={title}
        description={description}
        questions={questions}
      />

      {/* Drag Overlay - only for question reordering */}
      <DragOverlay>
        {activeId && questions.find(q => q.id === activeId) && (
          <div className="px-4 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <p className="text-sm text-[var(--text-primary)]">移动到此处</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
