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

    // Map FormQuestion options to component props
    const componentProps: Record<string, any> = {
      mode: 'fill',
      questionId: question.id,
      questionText: question_text,
      required,
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
        componentProps.items = options?.sortable_items?.map((item, index) => ({
          id: `${index}`,
          label: item,
          value: item,
          order: index,
        })) || []
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
        {/* Question Number */}
        {questionNumber !== undefined && (
          <div
            className={cn(
              'inline-flex items-center justify-center',
              'w-7 h-7 rounded-lg text-xs font-semibold mb-3',
              'bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] text-white'
            )}
          >
            {questionNumber}
          </div>
        )}

        {/* Question Component */}
        <Component {...componentProps} />
      </div>
    )
  }
)
