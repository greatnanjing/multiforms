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
import * as QuestionComponents from '@/components/forms/questions'

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

  // 题目类型组件映射
  // 注意：Email、Phone、Textarea 使用 Text 组件
  const QuestionComponentMap: Record<QuestionType, React.ComponentType<any>> = {
    single_choice: QuestionComponents.SingleChoice,
    multiple_choice: QuestionComponents.MultipleChoice,
    dropdown: QuestionComponents.Dropdown,
    rating: QuestionComponents.Rating,
    text: QuestionComponents.Text,
    textarea: QuestionComponents.Text,
    number: QuestionComponents.Number,
    date: QuestionComponents.Date,
    email: QuestionComponents.Text,
    phone: QuestionComponents.Text,
    file_upload: QuestionComponents.FileUpload,
    matrix: QuestionComponents.Matrix,
    sorting: QuestionComponents.Sorting,
  }

  // 预览题目渲染
  const renderQuestion = (question: BuilderQuestion, index: number) => {
    const Component = QuestionComponentMap[question.type]
    if (!Component) return null

    const questionData = convertBuilderToPreview(question)
    const value = answers[question.id]

    // 根据题目类型设置默认属性
    const commonProps = {
      mode: 'fill' as const,
      questionId: question.id,
      questionText: question.question_text,
      required: question.required,
      value,
      onChange: (val: any) => handleAnswerChange(question.id, val),
      disabled: false,
    }

    // 题目类型特定属性
    const typeSpecificProps: Partial<Record<QuestionType, any>> = {
      single_choice: {
        options: question.options?.choices || [
          { id: '1', label: '选项 1', value: '1' },
          { id: '2', label: '选项 2', value: '2' },
        ],
        optionStyle: 'text',
      },
      multiple_choice: {
        options: question.options?.choices || [
          { id: '1', label: '选项 1', value: '1' },
          { id: '2', label: '选项 2', value: '2' },
        ],
        maxSelections: question.options?.max_selections && question.options.max_selections > 0 ? question.options.max_selections : undefined,
      },
      dropdown: {
        options: question.options?.choices || [
          { id: '1', label: '选项 1', value: '1' },
          { id: '2', label: '选项 2', value: '2' },
        ],
      },
      rating: {
        ratingType: question.options?.rating_type || 'star',
        maxRating: question.options?.rating_max || 5,
      },
      text: {
        inputType: 'text',
        placeholder: question.options?.placeholder || '请输入文本',
      },
      textarea: {
        inputType: 'textarea',
        placeholder: question.options?.placeholder || '请输入详细内容',
      },
      number: {
        placeholder: question.options?.placeholder || '请输入数字',
      },
      date: {
        format: question.options?.date_format || 'YYYY-MM-DD',
      },
      email: {
        inputType: 'email',
        placeholder: question.options?.placeholder || 'example@email.com',
      },
      phone: {
        inputType: 'phone',
        placeholder: question.options?.placeholder || '请输入手机号码',
      },
      file_upload: {
        maxFileSize: question.options?.max_file_size || 10 * 1024 * 1024,
        maxFiles: question.options?.max_file_count || 1,
      },
      matrix: {
        rows: question.options?.matrix_rows || ['项目 1', '项目 2'],
        columns: question.options?.matrix_columns || ['选项 1', '选项 2', '选项 3'],
      },
      sorting: {
        items: question.options?.sortable_items || [
          { id: '1', label: '选项 1', order: 0 },
          { id: '2', label: '选项 2', order: 1 },
        ],
      },
    }

    return (
      <div
        key={question.id}
        className={cn(
          'p-5 rounded-2xl border transition-all duration-200',
          'glass-card border-white/[0.08]'
        )}
      >
        <Component {...commonProps} {...typeSpecificProps[question.type]} />
      </div>
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
                预览模式：此为表单预览，您可以测试填写效果。您的输入不会被保存。
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
