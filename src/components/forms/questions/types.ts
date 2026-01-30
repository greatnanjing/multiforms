/* ============================================
   MultiForms Question Component Types

   题型组件通用类型定义
============================================ */

import type { QuestionType, AnswerValue, ChoiceOption } from '@/types'

// ============================================
// Question Component Modes
// ============================================

/** 题目组件模式 */
export type QuestionMode = 'edit' | 'fill' | 'preview' | 'result'

// ============================================
// Base Question Props
// ============================================

/** 题目组件基础属性 */
export interface BaseQuestionProps {
  /** 题目模式 */
  mode?: QuestionMode
  /** 题目ID */
  questionId: string
  /** 题目文本 */
  questionText: string
  /** 是否必填 */
  required?: boolean
  /** 占位提示 */
  placeholder?: string
  /** 默认值 */
  defaultValue?: AnswerValue
  /** 当前值 */
  value?: AnswerValue
  /** 值变化回调 */
  onChange?: (value: AnswerValue) => void
  /** 错误信息 */
  error?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 额外类名 */
  className?: string
}

// ============================================
// Choice Question Props
// ============================================

/** 选择题选项 */
export interface ChoiceOptionWithValue extends ChoiceOption {
  selected?: boolean
}

/** 选择题属性 */
export interface ChoiceQuestionProps extends BaseQuestionProps {
  /** 选项列表 */
  options: ChoiceOptionWithValue[]
  /** 是否允许其他选项 */
  allowOther?: boolean
  /** 其他选项标签 */
  otherLabel?: string
  /** 选项变化回调 */
  onOptionsChange?: (options: ChoiceOptionWithValue[]) => void
  /** 添加选项 */
  onAddOption?: () => void
  /** 删除选项 */
  onRemoveOption?: (optionId: string) => void
  /** 选项样式 */
  optionStyle?: 'text' | 'card' | 'image'
}

// ============================================
// Rating Question Props
// ============================================

/** 评分类型 */
export type RatingType = 'star' | 'number' | 'slider' | 'emoji'

/** 评分题属性 */
export interface RatingQuestionProps extends BaseQuestionProps {
  /** 评分类型 */
  ratingType: RatingType
  /** 最大值 */
  max: number
  /** 最小值 */
  min?: number
  /** 分数标签 */
  labels?: Record<number, string>
}

// ============================================
// Text Question Props
// ============================================

/** 文本题类型 */
export type TextType = 'text' | 'textarea' | 'email' | 'phone'

/** 文本题属性 */
export interface TextQuestionProps extends BaseQuestionProps {
  /** 输入类型 */
  textType: TextType
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number
  /** 行数（仅 textarea） */
  rows?: number
}

// ============================================
// Number Question Props
// ============================================

/** 数字题属性 */
export interface NumberQuestionProps extends BaseQuestionProps {
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 前缀 */
  prefix?: string
  /** 后缀 */
  suffix?: string
}

// ============================================
// Date Question Props
// ============================================

/** 日期格式 */
export type DateFormat = 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'MM-DD' | 'YYYY-MM'

/** 日期题属性 */
export interface DateQuestionProps extends BaseQuestionProps {
  /** 日期格式 */
  format?: DateFormat
  /** 最小日期 */
  minDate?: string
  /** 最大日期 */
  maxDate?: string
}

// ============================================
// File Upload Props
// ============================================

/** 上传的文件 */
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

/** 文件上传属性 */
export interface FileUploadQuestionProps extends BaseQuestionProps {
  /** 最大文件大小（字节） */
  maxFileSize?: number
  /** 允许的文件类型 */
  allowedTypes?: string[]
  /** 最大文件数量 */
  maxFiles?: number
  /** 已上传的文件 */
  files?: UploadedFile[]
  /** 上传状态 */
  uploading?: boolean
}

// ============================================
// Matrix Question Props
// ============================================

/** 矩阵题属性 */
export interface MatrixQuestionProps extends BaseQuestionProps {
  /** 行标题 */
  rows: string[]
  /** 列标题 */
  columns: string[]
  /** 答案格式：{ row: column } */
  value?: Record<string, string>
}

// ============================================
// Sorting Question Props
// ============================================

/** 排序项 */
export interface SortableItem {
  id: string
  label: string
  order: number
}

/** 排序题属性 */
export interface SortingQuestionProps extends BaseQuestionProps {
  /** 可排序项 */
  items: SortableItem[]
  /** 值为排序后的ID数组 */
  value?: string[]
}

// ============================================
// Question Renderer Props
// ============================================

/** 题目渲染器属性 */
export interface QuestionRendererProps {
  /** 题目类型 */
  type: QuestionType
  /** 基础属性 */
  props: BaseQuestionProps &
    Partial<ChoiceQuestionProps> &
    Partial<RatingQuestionProps> &
    Partial<TextQuestionProps> &
    Partial<NumberQuestionProps> &
    Partial<DateQuestionProps> &
    Partial<FileUploadQuestionProps> &
    Partial<MatrixQuestionProps> &
    Partial<SortingQuestionProps>
}
