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
  Trash2,
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
import { getFormById, getFormByShortId, getFormWithQuestions, updateForm, publishForm, generateShortId, deleteForm } from '@/lib/api/forms'
import { getQuestions, updateQuestions, createQuestions, deleteQuestions } from '@/lib/api/questions'
import type { FormQuestion } from '@/types'
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
import { useConfirm } from '@/components/shared/confirm-dialog'

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

// Compute hash for questions to detect changes
function computeQuestionsHash(qs: BuilderQuestion[]): string {
  return JSON.stringify(qs.map(q => ({
    id: q.id,
    text: q.question_text,
    type: q.type,
    required: q.required,
    order: q.order,
    opts: JSON.stringify(q.options),
  })))
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
  const { confirm } = useConfirm()

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
  // Track last saved state to avoid unnecessary updates
  const lastSavedStateRef = useRef<string | null>(null)
  // Track if initial data has been loaded (to skip auto-save on first render)
  const initialDataLoadedRef = useRef(false)
  // Refs for current values to avoid stale closures and dependency issues
  const titleRef = useRef(title)
  const descriptionRef = useRef(description)
  const questionsRef = useRef(questions)
  const privacySettingsRef = useRef(privacySettings)

  // Keep refs in sync with state
  useEffect(() => {
    titleRef.current = title
  }, [title])
  useEffect(() => {
    descriptionRef.current = description
  }, [description])
  useEffect(() => {
    questionsRef.current = questions
  }, [questions])
  useEffect(() => {
    privacySettingsRef.current = privacySettings
  }, [privacySettings])

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
      const loadStart = Date.now()

      try {
        // 优先使用 getFormWithQuestions 一次查询获取表单和题目
        let data: Form | null = null
        let questionsData: FormQuestion[] = []

        const t1 = Date.now()
        try {
          // 尝试使用 ID 查询（一次获取表单和题目）
          const result = await getFormWithQuestions(formId)
          data = result.form
          questionsData = result.questions
          console.log('[Load] getFormWithQuestions took:', Date.now() - t1, 'ms')
        } catch (idError) {
          console.log('[Load] getFormWithQuestions with ID failed, trying short_id...', idError)
          // 如果失败，可能是 short_id，尝试另一种方式
          try {
            data = await getFormByShortId(formId)
            // 获取到表单后，再获取题目
            const t2 = Date.now()
            questionsData = await getQuestions(data.id)
            console.log('[Load] getFormByShortId + getQuestions took:', Date.now() - t1, 'ms')
          } catch {
            throw new Error('表单不存在')
          }
        }

        if (data) {
          setForm(data)
          const formTitle = data.title
          const formDescription = data.description || ''
          setTitle(formTitle)
          setDescription(formDescription)

          // Load privacy settings from form data
          const formPrivacySettings = {
            requirePassword: data.access_type === 'password',
            password: data.access_password || '',
            limitResponses: data.max_responses !== null,
            maxResponses: data.max_responses || 100,
            allowAnonymous: true, // Default to true - not stored in Form type
          }
          setPrivacySettings(formPrivacySettings)

          // Process questions data
          const builderQuestions = questionsData.map((q) => {
            const required = q.validation?.required || false
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

          // Initialize lastSavedStateRef after data is loaded
          // This prevents auto-save from triggering on initial load
          lastSavedStateRef.current = JSON.stringify({
            title: formTitle,
            description: formDescription,
            questions: computeQuestionsHash(builderQuestions),
            privacy: JSON.stringify(formPrivacySettings),
          })
          // Mark initial data as loaded
          initialDataLoadedRef.current = true
          console.log('[Load] Total load time:', Date.now() - loadStart, 'ms', `(${builderQuestions.length} questions)`)
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
    if (isSavingRef.current) {
      console.log('[handleSave] Skipped - already saving')
      return
    }

    // Use current values from refs to avoid stale closures
    const currentTitle = titleRef.current
    const currentDescription = descriptionRef.current
    const currentQuestions = questionsRef.current
    const currentPrivacySettings = privacySettingsRef.current

    // Check if anything actually changed
    const currentStateHash = JSON.stringify({
      title: currentTitle,
      description: currentDescription,
      questions: computeQuestionsHash(currentQuestions),
      privacy: JSON.stringify(currentPrivacySettings),
    })

    console.log('[handleSave] Checking for changes...', {
      lastSaved: lastSavedStateRef.current?.substring(0, 50),
      current: currentStateHash.substring(0, 50),
      hasLastSaved: !!lastSavedStateRef.current,
      areEqual: lastSavedStateRef.current === currentStateHash,
    })

    if (lastSavedStateRef.current === currentStateHash) {
      // No changes, skip save and reset hasUnsavedChanges
      console.log('[handleSave] No changes detected, skipping save')
      setHasUnsavedChanges(false)
      return
    }

    console.log('[handleSave] Changes detected, starting save...')
    isSavingRef.current = true
    setSaving(true)

    const saveStartTime = Date.now()

    try {
      // Prepare privacy settings for database
      const updateData: any = {
        title: currentTitle,
        description: currentDescription || undefined,
      }

      // Update privacy settings
      if (currentPrivacySettings.requirePassword) {
        updateData.access_type = 'password' as const
        updateData.access_password = currentPrivacySettings.password || null
      } else {
        updateData.access_type = 'public' as const
        updateData.access_password = null
      }

      if (currentPrivacySettings.limitResponses) {
        updateData.max_responses = currentPrivacySettings.maxResponses || 100
      } else {
        updateData.max_responses = null
      }

      // Update form metadata - only if something changed
      const formNeedsUpdate =
        updateData.title !== undefined ||
        updateData.description !== undefined ||
        updateData.access_type !== undefined ||
        updateData.max_responses !== undefined

      if (formNeedsUpdate) {
        console.log('[handleSave] Updating form metadata:', updateData)
        const t1 = Date.now()
        await updateForm(formId, updateData)
        console.log('[handleSave] updateForm took:', Date.now() - t1, 'ms')
      } else {
        console.log('[handleSave] Skipping form metadata update - no changes')
      }

      // Sync questions to database
      const t2 = Date.now()
      const existingQuestions = await getQuestions(formId)
      console.log('[handleSave] getQuestions took:', Date.now() - t2, 'ms')
      const existingQuestionsMap = new Map(existingQuestions.map((q) => [q.id, q]))

      // Separate questions into update and create batches
      const questionsToUpdate: Array<{ id: string } & any> = []
      const questionsToCreate: any[] = []
      const questionsToDelete: string[] = []

      // Find questions to delete
      const currentQuestionIds = new Set(currentQuestions.map(q => q.id))
      for (const existingQ of existingQuestions) {
        if (!currentQuestionIds.has(existingQ.id)) {
          questionsToDelete.push(existingQ.id)
        }
      }

      currentQuestions.forEach((q, index) => {
        const existingQ = existingQuestionsMap.get(q.id)

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

        if (existingQ) {
          // Check if question actually changed
          const hasChanged =
            existingQ.question_text !== q.question_text ||
            existingQ.question_type !== q.type ||
            existingQ.order_index !== index ||
            JSON.stringify(existingQ.options) !== JSON.stringify(q.options) ||
            existingQ.validation?.required !== q.required

          if (hasChanged) {
            questionsToUpdate.push(questionData)
          }
        } else {
          // New question, create it
          questionsToCreate.push(questionData)
        }
      })

      // Only update if there are actual changes
      if (questionsToUpdate.length > 0) {
        const t3 = Date.now()
        await updateQuestions(questionsToUpdate)
        console.log('[handleSave] updateQuestions took:', Date.now() - t3, 'ms')
      }

      // Create new questions
      if (questionsToCreate.length > 0) {
        // Remove 'id' field and add form_id for new questions
        const questionsForCreation = questionsToCreate.map(({ id: _id, ...rest }) => ({
          ...rest,
          form_id: formId,
        }))
        console.log('[handleSave] Creating new questions:', questionsForCreation.length)
        const t4 = Date.now()
        // Skip validation since we already validated access in updateQuestions
        await createQuestions(formId, questionsForCreation, { skipValidation: true })
        console.log('[handleSave] createQuestions took:', Date.now() - t4, 'ms')
      }

      // Delete questions that were removed
      if (questionsToDelete.length > 0) {
        console.log('[handleSave] Deleting questions:', questionsToDelete.length)
        const t5 = Date.now()
        // Batch delete - skip validation since we already validated access
        await deleteQuestions(formId, questionsToDelete, { skipValidation: true })
        console.log('[handleSave] deleteQuestions took:', Date.now() - t5, 'ms')
      }

      // Update saved state ref
      lastSavedStateRef.current = JSON.stringify({
        title: currentTitle,
        description: currentDescription,
        questions: computeQuestionsHash(currentQuestions),
        privacy: JSON.stringify(currentPrivacySettings),
      })
      console.log('[handleSave] Save complete! Total time:', Date.now() - saveStartTime, 'ms')

      // Update saved state
      setHasUnsavedChanges(false)
      setLastSavedTime(new Date())
    } catch (error) {
      console.error('Failed to save form:', error)
      throw error
    } finally {
      setSaving(false)
      isSavingRef.current = false
    }
  }, [formId]) // Only depend on formId, not on the state values

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
    // Only trigger auto-save after initial data has been loaded
    // This prevents saving on first render when data is being set
    console.log('[Auto-save useEffect] Triggered', {
      loading,
      initialDataLoaded: initialDataLoadedRef.current,
      willTrigger: !loading && initialDataLoadedRef.current,
    })
    if (!loading && initialDataLoadedRef.current) {
      triggerAutoSave()
    }
    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, questions, privacySettings, loading]) // Remove triggerAutoSave from deps

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

  // Delete form handler
  const handleDelete = useCallback(async () => {
    if (!form) return

    const confirmed = await confirm({
      title: '删除表单',
      message: `确定要删除表单"${form.title}"吗？此操作不可撤销，删除后将无法恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteForm(form.id)
        toast.success('表单已删除')
        router.push('/dashboard')
      } catch (error) {
        console.error('Failed to delete form:', error)
        toast.error('删除失败，请稍后重试')
      }
    }
  }, [form, confirm, toast, router])

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
                onClick={async () => {
                  if (hasUnsavedChanges) {
                    const confirmed = await confirm({
                      title: '未保存的更改',
                      message: '您有未保存的更改，确定要离开吗？未保存的内容将丢失。',
                      confirmText: '离开',
                      cancelText: '留下',
                      variant: 'warning',
                    })
                    if (confirmed) {
                      router.push('/dashboard')
                    }
                  } else {
                    router.push('/dashboard')
                  }
                }}
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
                  onClick={async () => {
                    if (hasUnsavedChanges) {
                      const confirmed = await confirm({
                        title: '未保存的更改',
                        message: '您有未保存的更改，确定要离开吗？未保存的内容将丢失。',
                        confirmText: '离开',
                        cancelText: '留下',
                        variant: 'warning',
                      })
                      if (confirmed) {
                        router.push('/dashboard')
                      }
                    } else {
                      router.push('/dashboard')
                    }
                  }}
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

              <button
                onClick={handleDelete}
                className={cn(
                  'hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-white/5 border border-white/10 text-red-400',
                  'hover:bg-red-500/10 hover:border-red-500/30'
                )}
                title="删除表单"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
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
