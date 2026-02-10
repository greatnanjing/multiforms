/* ============================================
   MultiForms Public Form View Page

   公开表单填写页：
   - 居中卡片布局（最大宽640px）
   - 表单头部（Logo、标题、描述）
   - 题目展示（单页滚动模式，所有题目一次性展示）
   - 底部固定提交按钮
   - 提交成功处理
   - 密码保护检查
============================================ */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFormByShortId, incrementFormViewCount } from '@/lib/api/forms'
import { getPublicQuestions } from '@/lib/api/questions'
import { submitFormAnswer } from '@/lib/api/submissions'
import type { Form, AnswerValue, SubmissionAnswers } from '@/types'
import {
  FormHeader,
  QuestionRenderer,
  FormProgress,
  SuccessModal,
  PasswordGate,
} from '@/components/forms/view'

// ============================================
// Types
// ============================================

interface FormQuestionWithId {
  id: string
  form_id: string
  question_text: string
  question_type: string
  options: any
  validation: any
  logic_rules: any[]
  order_index: number
}

// ============================================
// Main Component
// ============================================

export default function FormViewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shortId = params.shortId as string

  // 检查是否为预览模式（管理员查看）
  const isPreviewMode = searchParams.get('preview') === 'readonly'

  // Form state
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<FormQuestionWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Answer state
  const [answers, setAnswers] = useState<SubmissionAnswers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Start time for duration tracking
  const startTimeRef = useRef<number>(Date.now())

  // ============================================
  // Data Loading
  // ============================================

  useEffect(() => {
    const abortController = new AbortController()

    const loadForm = async () => {
      try {
        setLoading(true)

        // Fetch form by short_id
        const formData = await getFormByShortId(shortId)

        // 检查请求是否已取消
        if (abortController.signal.aborted) return

        // Check if form is published (skip check for admin preview mode)
        if (formData.status !== 'published' && !isPreviewMode) {
          setError('表单尚未发布，无法访问')
          return
        }

        setForm(formData)

        // Check password protection (skip for admin preview mode)
        if (!isPreviewMode && formData.access_type === 'password') {
          // 检查是否在浏览器环境中
          if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
            const isVerified = sessionStorage.getItem(`form_${shortId}_verified`)
            if (!isVerified) {
              // Redirect to password gate
              router.push(`/f/${shortId}/password-gate`)
              return
            }
          }
        }

        // Increment view count (skip for admin preview mode)
        if (!isPreviewMode) {
          await incrementFormViewCount(formData.id)
        }

        // 检查请求是否已取消
        if (abortController.signal.aborted) return

        // Fetch questions for this form
        const questionsData = await getPublicQuestions(formData.id)
        
        // 检查请求是否已取消
        if (abortController.signal.aborted) return
        
        setQuestions(questionsData as FormQuestionWithId[])
      } catch (err) {
        // 检查是否是取消错误
        if (abortController.signal.aborted) return

        console.error('Failed to load form:', err)
        setError('表单不存在或已关闭')
      } finally {
        // 只在未取消时设置加载状态
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadForm()

    // 清理函数：取消未完成的请求
    return () => {
      abortController.abort()
    }
  }, [shortId])

  // ============================================
  // Answer Handlers
  // ============================================

  const handleAnswerChange = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
    // Clear error for this question
    setErrors((prev) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }, [])


  const handleSubmit = useCallback(async () => {
    // Validate all required questions
    const newErrors: Record<string, string> = {}

    for (const question of questions) {
      const isRequired = question.validation?.required ?? false
      const answer = answers[question.id]

      if (isRequired && !answer) {
        newErrors[question.id] = '此题为必填项'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to first error
      const firstErrorQuestionId = Object.keys(newErrors)[0]
      const firstErrorElement = document.querySelector(`[data-question-id="${firstErrorQuestionId}"]`)
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Submit
    setIsSubmitting(true)

    try {
      // Calculate duration
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)

      // Submit to API
      await submitFormAnswer({
        formId: form!.id,
        answers,
        durationSeconds,
      })

      // Show success modal
      setShowSuccess(true)
    } catch (err) {
      console.error('Failed to submit form:', err)
      setError('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }, [answers, form, questions])

  // ============================================
  // Render Helpers
  // ============================================

  // Count answered required questions for progress
  // 只统计已填写的必答题数量
  const answeredCount = questions.filter(q => {
    const isRequired = q.validation?.required ?? false
    return isRequired && answers[q.id]  // 必填且已回答
  }).length

  // 总必填题数量
  const requiredCount = questions.filter(q => q.validation?.required ?? false).length

  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // Error State
  // ============================================

  if (error || !form) {
    const isUnpublished = error === '表单尚未发布，无法访问'
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-[var(--bg-secondary)] text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isUnpublished ? 'bg-amber-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
            <AlertCircle className={`w-8 h-8 ${isUnpublished ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {isUnpublished ? '表单尚未发布' : '无法访问表单'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {isUnpublished
              ? '此表单尚未发布，暂时无法访问。请联系表单创建者发布后重试。'
              : (error || '表单不存在或已关闭')
            }
          </p>
          <button
            onClick={() => router.push('/')}
            className={cn(
              'px-6 py-2.5 rounded-xl text-sm font-medium',
              'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
              'hover:opacity-90 transition-opacity'
            )}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-32">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
      </div>

      {/* 预览模式提示 */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 px-4 py-2 bg-amber-500/10 border-b border-amber-500/30">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-sm text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>管理员预览模式 - 不允许提交数据</span>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Form Header */}
        <FormHeader form={form} />

        {/* Questions */}
        <form onSubmit={(e) => { e.preventDefault(); if (!isPreviewMode) handleSubmit(); }}>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} data-question-id={question.id}>
                <QuestionRenderer
                  question={question as any}
                  value={answers[question.id]}
                  onChange={(value) => !isPreviewMode && handleAnswerChange(question.id, value)}
                  error={errors[question.id]}
                  disabled={isSubmitting || isPreviewMode}
                  questionNumber={index + 1}
                />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {questions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)]">此表单暂无题目</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            由 <span className="text-[var(--primary-glow)]">MultiForms</span> 提供支持
          </p>
        </div>
      </div>

      {/* Progress Bar / Submit Button - 隐藏预览模式 */}
      {questions.length > 0 && !isPreviewMode && (
        <FormProgress
          answeredCount={answeredCount}
          requiredCount={requiredCount}
          totalQuestions={questions.length}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        shortId={shortId}
        showResults={form.show_results}
        onClose={() => {
          setShowSuccess(false)
          // Optionally redirect or reset
        }}
      />
    </div>
  )
}
