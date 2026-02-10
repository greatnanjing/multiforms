/* ============================================
   MultiForms Question Renderer Component

   题目渲染组件（公开填写页）：
   - 题目编号
   - 必填标记
   - 题目内容渲染
   - 错误状态显示
============================================ */

/* eslint-disable react-hooks/static-components */

'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { QuestionType, FormQuestion, AnswerValue } from '@/types'
import * as QuestionComponents from '../questions'

// ============================================
// Types
// ============================================

interface QuestionRendererProps {
  question: FormQuestion
  value?: AnswerValue
  onChange?: (value: AnswerValue) => void
  error?: string
  disabled?: boolean
  /** 题目编号（从1开始） */
  questionNumber?: number
  /** 额外的类名 */
  className?: string
}

// ============================================
// Helper Functions
// ============================================

function getQuestionComponent(questionType: QuestionType) {
  const componentMap: Record<QuestionType, React.ComponentType<any>> = {
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

  return componentMap[questionType] || QuestionComponents.Text
}

// ============================================
// Main Component
// ============================================

export const QuestionRenderer = forwardRef<HTMLDivElement, QuestionRendererProps>(
  function QuestionRenderer(
    {
      question,
      value,
      onChange,
      error,
      disabled = false,
      questionNumber,
      className,
    },
    ref
  ) {
    const {
      question_text,
      question_type,
      validation,
      options,
    } = question

    const required = validation?.required ?? false
    const Component = getQuestionComponent(question_type)

    // 题型标签映射
    const questionTypeLabels: Record<string, string> = {
      single_choice: '单选题',
      multiple_choice: '多选题',
      dropdown: '下拉题',
      rating: '评分题',
      text: '文本题',
      textarea: '多行文本',
      number: '数字题',
      date: '日期题',
      email: '邮箱题',
      phone: '电话题',
      file_upload: '上传题',
      matrix: '矩阵题',
      sorting: '排序题',
    }

    const questionTypeLabel = questionTypeLabels[question_type] || '未知'

    // Map FormQuestion options to component props
    const componentProps: Record<string, any> = {
      mode: 'fill',
      questionId: question.id,
      // 当有题号时，不显示题目组件自带的标题，避免重复
      questionText: questionNumber ? '' : question_text,
      required: questionNumber ? false : required, // 题号模式下的标题行包含必填标记
      value,
      onChange,
      error,
      disabled,
    }

    // Type-specific options
    switch (question_type) {
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        componentProps.options = options?.choices || []
        componentProps.allowOther = options?.allow_other
        componentProps.otherLabel = options?.other_label
        componentProps.optionStyle = 'text'
        if (question_type === 'multiple_choice') {
          componentProps.maxSelections = options?.max_selections
        }
        break

      case 'rating':
        componentProps.ratingType = options?.rating_type || 'star'
        componentProps.maxRating = options?.rating_max || 5
        componentProps.minRating = options?.rating_min || 1
        break

      case 'text':
      case 'textarea':
        componentProps.placeholder = options?.placeholder || '请输入您的回答'
        componentProps.inputType = question_type === 'textarea' ? 'textarea' : 'text'
        break

      case 'number':
        componentProps.placeholder = options?.placeholder || '请输入数字'
        componentProps.min = options?.number_min
        componentProps.max = options?.number_max
        componentProps.step = options?.number_step
        break

      case 'date':
        componentProps.format = options?.date_format || 'YYYY-MM-DD'
        componentProps.minDate = options?.min_date
        componentProps.maxDate = options?.max_date
        break

      case 'email':
        componentProps.placeholder = options?.placeholder || '请输入邮箱'
        componentProps.inputType = 'email'
        break

      case 'phone':
        componentProps.placeholder = options?.placeholder || '请输入手机号'
        componentProps.inputType = 'tel'
        break

      case 'file_upload':
        componentProps.maxFileSize = options?.max_file_size || 10 * 1024 * 1024
        componentProps.maxFiles = options?.max_file_count || 1
        componentProps.allowedTypes = options?.allowed_file_types
        break

      case 'matrix':
        componentProps.rows = options?.matrix_rows || []
        componentProps.columns = options?.matrix_columns || []
        break

      case 'sorting':
        // sortable_items can be string[] or {id, label, order}[]
        componentProps.items = options?.sortable_items?.map((item: any, index: number) => {
          if (typeof item === 'string') {
            return {
              id: `sort-${index}`,
              label: item,
              value: item,
              order: index,
            }
          }
          return item
        }) || []
        break
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative p-5 rounded-2xl border transition-all duration-200',
          'glass-card border-white/[0.08]',
          error && 'border-red-500/50',
          className
        )}
      >
        {/* 题目标题行：题号 + 题目文字 + 题型标签 + 必填标记 */}
        {questionNumber !== undefined && (
          <div className="mb-4 flex items-baseline gap-2 flex-wrap">
            {/* 题号 */}
            <span className="text-sm font-semibold text-[var(--primary-glow)]">
              {questionNumber}.
            </span>
            {/* 题目文字 */}
            <span className="text-base font-medium text-[var(--text-primary)]">
              {question_text || '未命名题目'}
            </span>
            {/* 题型标签 - 单选题用蓝色，多选题用紫罗兰色，其他用灰色 */}
            {question_type === 'single_choice' && (
              <span className="text-xs font-medium text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-md">
                {questionTypeLabel}
              </span>
            )}
            {question_type === 'multiple_choice' && (
              <span className="text-xs font-medium text-violet-400/80 bg-violet-500/10 px-2 py-0.5 rounded-md">
                {questionTypeLabel}
              </span>
            )}
            {question_type !== 'single_choice' && question_type !== 'multiple_choice' && (
              <span className="text-xs font-medium text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded-md">
                {questionTypeLabel}
              </span>
            )}
            {/* 多选题最多选数量 */}
            {question_type === 'multiple_choice' && options?.max_selections && (
              <span className="text-xs font-medium text-violet-400/80 bg-violet-500/10 px-2 py-0.5 rounded-md">
                最多选 {options.max_selections} 项
              </span>
            )}
            {/* 必填标记 */}
            {required && (
              <span className="text-red-400">*</span>
            )}
          </div>
        )}

        {/* Question Component */}
        <Component {...componentProps} />
      </div>
    )
  }
)
