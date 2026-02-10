/* ============================================
   MultiForms Form Preview Modal Component

   表单预览弹窗组件：
   - 模拟真实填写效果
   - 单页显示所有题目，可滚动
   - 支持测试填写
   - 无需发布即可预览
============================================ */

'use client'

import { useMemo, useState, useCallback } from 'react'
import { ArrowLeft, Send, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import type { BuilderQuestion } from './question-card'
import type { QuestionType } from '@/types'
import { QuestionRenderer } from '@/components/forms/view/question-renderer'

// ============================================
// Types
// ============================================

interface FormPreviewModalProps {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 发布回调 */
  onPublish?: () => void
  /** 表单标题 */
  title: string
  /** 表单描述 */
  description: string
  /** 题目列表 */
  questions: BuilderQuestion[]
}

// ============================================
// Helper Functions
// ============================================

/**
 * 将 BuilderQuestion 转换为预览所需的格式
 */
function convertBuilderToPreview(question: BuilderQuestion) {
  return {
    id: question.id,
    question_text: question.question_text,
    question_type: question.type as QuestionType,
    validation: {
      required: question.required,
    },
    options: question.options || {},
  }
}

// ============================================
// Main Component
// ============================================

export function FormPreviewModal({
  isOpen,
  onClose,
  onPublish,
  title,
  description,
  questions,
}: FormPreviewModalProps) {
  // 答案状态（仅用于预览，不保存）
  const [answers, setAnswers] = useState<Record<string, any>>({})

  // 关闭时清空答案
  const handleClose = useCallback(() => {
    setAnswers({})
    onClose()
  }, [onClose])

  // 答案变更处理
  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }, [])

  // 计算进度
  const requiredQuestions = questions.filter((q) => q.required)
  const answeredRequired = requiredQuestions.filter((q) => answers[q.id]).length

  // 预览题目渲染
  const renderQuestion = (question: BuilderQuestion, index: number) => {
    const questionData = convertBuilderToPreview(question)
    const value = answers[question.id]

    return (
      <QuestionRenderer
        key={question.id}
        question={questionData as any}
        questionNumber={index + 1}
        value={value}
        onChange={(val: any) => handleAnswerChange(question.id, val)}
        disabled={true}  // 预览模式下禁用所有题目
      />
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">表单预览</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {questions.length} 道题目 • {requiredQuestions.length} 道必选
              </p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Form Header Preview */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
                {title || '未命名表单'}
              </h1>
              {description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((question, index) => renderQuestion(question, index))
              ) : (
                <div className="text-center py-12">
                  <p className="text-[var(--text-muted)]">暂无题目</p>
                </div>
              )}
            </div>

            {/* Preview Notice */}
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-300">
                预览模式：预览时不允许填选操作。
              </p>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          <div className="px-6 py-4 border-t border-white/10 bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between gap-4">
              {/* Progress Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {answeredRequired >= requiredQuestions.length
                      ? '已完成所有必填题'
                      : `已完成 ${answeredRequired}/${requiredQuestions.length} 道必选题`}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {requiredQuestions.length > 0
                      ? Math.round((answeredRequired / requiredQuestions.length) * 100)
                      : 100}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300 ease-out',
                      answeredRequired >= requiredQuestions.length
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]'
                    )}
                    style={{
                      width: `${requiredQuestions.length > 0
                        ? (answeredRequired / requiredQuestions.length) * 100
                        : 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-sm font-medium',
                    'flex items-center gap-2',
                    'bg-white/5 border border-white/10',
                    'hover:bg-white/10 transition-colors',
                    'text-[var(--text-secondary)]'
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回编辑
                </button>
                <button
                  onClick={onPublish}
                  disabled={questions.length === 0}
                  className={cn(
                    'px-5 py-2.5 rounded-xl text-sm font-medium',
                    'flex items-center gap-2',
                    'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
                    'hover:opacity-90 transition-opacity',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                  发布表单
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
