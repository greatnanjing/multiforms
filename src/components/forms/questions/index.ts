/* ============================================
   MultiForms Question Components

   题型组件库导出文件

   Usage:
   ```ts
   import {
     SingleChoice,
     MultipleChoice,
     Dropdown,
     Rating,
     Text,
     Number,
     Date,
     FileUpload,
     Matrix,
     Sorting
   } from '@/components/forms/questions'
   ```
============================================ */

// ============================================
// Types
// ============================================
export * from './types'

// ============================================
// Question Components
// ============================================

// 单选题
export { SingleChoice, SingleChoiceSkeleton } from './single-choice'
export type { SingleChoiceProps } from './single-choice'

// 多选题
export { MultipleChoice, MultipleChoiceSkeleton } from './multiple-choice'
export type { MultipleChoiceProps } from './multiple-choice'

// 下拉选择
export { Dropdown, DropdownSkeleton } from './dropdown'
export type { DropdownProps } from './dropdown'

// 评分题
export { Rating, RatingSkeleton } from './rating'
export type { RatingProps } from './rating'

// 文本题
export { Text, TextSkeleton } from './text'
export type { TextProps } from './text'

// 数字题
export { Number, NumberSkeleton } from './number'
export type { NumberProps } from './number'

// 日期题
export { Date, DateSkeleton } from './date'
export type { DateProps } from './date'

// 文件上传
export { FileUpload, FileUploadSkeleton } from './file-upload'
export type { FileUploadProps } from './file-upload'

// 矩阵题
export { Matrix, MatrixSkeleton } from './matrix'
export type { MatrixProps } from './matrix'

// 排序题
export { Sorting, SortingSkeleton } from './sorting'
export type { SortingProps } from './sorting'

// ============================================
// Question Type Mappings
// ============================================

import type { QuestionType } from '@/types'

/** 题目类型到组件的映射 */
export const QuestionComponentMap = {
  single_choice: 'SingleChoice',
  multiple_choice: 'MultipleChoice',
  dropdown: 'Dropdown',
  rating: 'Rating',
  text: 'Text',
  textarea: 'Text',
  number: 'Number',
  date: 'Date',
  email: 'Text',
  phone: 'Text',
  file_upload: 'FileUpload',
  matrix: 'Matrix',
  sorting: 'Sorting',
} as const satisfies Record<QuestionType, string>

/** 获取题目类型的显示名称 */
export const QuestionTypeNames: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  dropdown: '下拉选择',
  rating: '评分题',
  text: '文本题',
  textarea: '多行文本',
  number: '数字题',
  date: '日期题',
  email: '邮箱题',
  phone: '电话题',
  file_upload: '文件上传',
  matrix: '矩阵题',
  sorting: '排序题',
}
