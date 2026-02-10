/* ============================================
   MultiForms TypeScript Type Definitions
   基于 docs/requirements/02-技术需求文档-TRD.md
   ============================================ */

// ============================================
// Enums
// ============================================

/** 用户角色 */
export type UserRole = 'admin' | 'creator' | 'guest'

/** 用户状态 */
export type UserStatus = 'active' | 'inactive' | 'banned'

/** 表单类型 */
export type FormType = 'vote' | 'rating' | 'survey' | 'collection' | 'feedback'

/** 表单状态 */
export type FormStatus = 'draft' | 'published' | 'closed' | 'archived'

/** 访问类型 */
export type AccessType = 'public' | 'private' | 'password'

/** 题目类型 */
export type QuestionType =
  | 'single_choice'    // 单选题
  | 'multiple_choice'  // 多选题
  | 'dropdown'         // 下拉选择
  | 'rating'           // 评分题
  | 'text'             // 文本题
  | 'textarea'         // 多行文本
  | 'number'           // 数字题
  | 'date'             // 日期题
  | 'email'            // 邮箱题
  | 'phone'            // 电话题
  | 'file_upload'      // 文件上传
  | 'matrix'           // 矩阵题
  | 'sorting'          // 排序题

/** 提交状态 */
export type SubmissionStatus = 'draft' | 'completed'

/** 模板分类 */
export type TemplateCategory = 'vote' | 'survey' | 'rating' | 'feedback' | 'collection'

/** 管理员操作类型 */
export type AdminAction =
  | 'login'
  | 'logout'
  | 'view_user'
  | 'update_user'
  | 'ban_user'
  | 'delete_user'
  | 'view_form'
  | 'update_form'
  | 'delete_form'
  | 'ban_form'
  | 'approve_template'
  | 'delete_template'
  | 'update_settings'
  | 'export_data'
  | 'view_logs'

/** 审核状态 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/** 举报类型 */
export type ReportType =
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'false_information'
  | 'copyright'
  | 'other'

/** 通知类型 */
export type NotificationType = 'new_response' | 'form_expiring' | 'system'

/** 主题ID */
export type ThemeId =
  | 'nebula'    // 星云紫
  | 'ocean'    // 海洋蓝
  | 'sunset'   // 日落橙
  | 'forest'   // 森林绿
  | 'sakura'   // 樱花粉
  | 'cyber'    // 赛博霓虹
  | 'minimal'  // 极简灰
  | 'royal'    // 皇家金

/** 模式 */
export type ThemeMode = 'dark' | 'light'

// ============================================
// User & Profile Types
// ============================================

/** 用户资料 */
export interface Profile {
  id: string
  email: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null

  // 角色与权限
  role: UserRole
  status: UserStatus

  // 使用统计
  form_count: number
  submission_count: number
  storage_used: number

  // 偏好设置
  preferences: UserPreferences
  email_verified: boolean

  // 时间戳
  created_at: string
  updated_at: string
  last_login_at: string | null
  banned_at: string | null
  banned_reason: string | null
}

/** 用户偏好设置 */
export interface UserPreferences {
  theme: ThemeId
  mode: ThemeMode
  language: 'zh-CN' | 'en-US'
  notifications_enabled: boolean
  email_notifications: boolean
  timezone: string
}

/** 用户输入（创建/更新） */
export type ProfileInput = Partial<Pick<Profile,
  'nickname' | 'avatar_url' | 'bio' | 'preferences'
>>

// ============================================
// Form Types
// ============================================

/** 表单 */
export interface Form {
  id: string
  user_id: string | null

  // 基本信息
  title: string
  description: string | null
  type: FormType
  status: FormStatus

  // 短链接（用于公开分享）
  short_id: string

  // 主题配置
  theme_config: ThemeConfig
  logo_url: string | null

  // 权限配置
  access_type: AccessType
  access_password: string | null    // 加密后的密码
  allowed_emails: string[] | null
  ip_restrictions: string[] | null

  // 限制配置
  max_responses: number | null
  max_per_user: number
  expires_at: string | null

  // 结果设置
  show_results: boolean
  results_password: string | null

  // 统计
  view_count: number
  response_count: number

  // 时间戳
  created_at: string
  updated_at: string
  published_at: string | null
}

/** 表单输入（创建） */
export interface FormInput {
  title: string
  description?: string
  type: FormType
  theme_config?: ThemeConfig
  access_type?: AccessType
  access_password?: string
  max_responses?: number
  max_per_user?: number
  expires_at?: string | null
  show_results?: boolean
}

/** 表单更新输入 */
export type FormUpdateInput = Partial<FormInput & { status: FormStatus }>

// ============================================
// Form Question Types
// ============================================

/** 题目选项配置 */
export interface QuestionOptions {
  // 选项列表（用于选择题）
  choices?: ChoiceOption[]

  // 评分配置（用于评分题）
  rating_type?: 'star' | 'number' | 'emoji'
  rating_max?: number
  rating_min?: number

  // 矩阵题配置
  matrix_rows?: string[]
  matrix_columns?: string[]

  // 排序题配置
  sortable_items?: string[]

  // 文件上传配置
  max_file_size?: number
  allowed_file_types?: string[]
  max_file_count?: number

  // 日期配置
  date_format?: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY'
  min_date?: string
  max_date?: string

  // 数字配置
  number_min?: number
  number_max?: number
  number_step?: number

  // 多选题最多可选数量
  max_selections?: number

  // 其他配置
  placeholder?: string
  default_value?: string | number | boolean | string[] | null
  allow_other?: boolean  // 是否允许填写"其他"选项
  other_label?: string   // "其他"选项的标签
}

/** 选项 */
export interface ChoiceOption {
  id: string
  label: string
  value: string
  image_url?: string | null
}

/** 题目验证规则 */
export interface QuestionValidation {
  required: boolean
  min_length?: number
  max_length?: number
  pattern?: string   // 正则表达式
  custom_message?: string
}

/** 逻辑跳转规则 */
export interface LogicRule {
  condition: {
    question_id: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: string | number | boolean | string[]
  }
  action: 'show' | 'hide' | 'jump_to'
  target_question_ids?: string[]
  jump_to_question_id?: string
}

/** 表单题目 */
export interface FormQuestion {
  id: string
  form_id: string
  question_text: string
  question_type: QuestionType
  options: QuestionOptions
  validation: QuestionValidation
  logic_rules: LogicRule[]
  order_index: number
  created_at: string
}

/** 题目输入（创建/更新） */
export type QuestionInput = Omit<FormQuestion, 'id' | 'form_id' | 'created_at'>

// ============================================
// Form Submission Types
// ============================================

/** 提交答案值类型 */
export type AnswerValue =
  | string                     // 文本、单选、日期等
  | string[]                   // 多选、排序、文件上传
  | number                     // 数字、评分
  | Record<string, string>     // 矩阵题答案
  | null

/** 提交答案映射 */
export type SubmissionAnswers = Record<string, AnswerValue>

/** 表单提交 */
export interface FormSubmission {
  id: string
  form_id: string
  user_id: string | null
  session_id: string | null

  // 提交者信息
  submitter_ip: string | null
  submitter_user_agent: string | null
  submitter_location: GeoLocation | null

  // 提交数据
  answers: SubmissionAnswers
  duration_seconds: number | null

  status: SubmissionStatus

  created_at: string
  updated_at: string
}

/** 地理位置信息 */
export interface GeoLocation {
  country: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

/** 表单提交输入 */
export interface SubmissionInput {
  form_id: string
  answers: SubmissionAnswers
  duration_seconds?: number
}

// ============================================
// Template Types
// ============================================

/** 模板 */
export interface Template {
  id: string

  // 基本信息
  title: string
  description: string | null
  category: TemplateCategory
  tags: string[] | null

  // 模板预览
  preview_url: string | null
  demo_form_id: string | null

  // 使用统计
  use_count: number

  // 状态
  is_featured: boolean
  is_active: boolean
  sort_order: number

  // 创建者
  created_by: string | null

  created_at: string
  updated_at: string
}

/** 模板输入 */
export type TemplateInput = Omit<Template, 'id' | 'use_count' | 'created_at' | 'updated_at'>

// ============================================
// Theme Types
// ============================================

/** 主题配置 */
export interface ThemeConfig {
  theme: ThemeId
  mode: ThemeMode

  // 颜色覆盖
  primary_start?: string
  primary_end?: string
  accent_color?: string
  background?: string
  background_image?: string

  // 字体配置
  font_family?: string

  // 封面设置
  cover_image?: string
  cover_title?: string
  cover_description?: string
  cover_button_text?: string

  // 其他配置
  show_progress_bar: boolean
  show_question_numbers: boolean
  animation_enabled: boolean
}

/** 主题预设 */
export interface ThemePreset {
  id: ThemeId
  name: string
  nameEn: string
  description: string
  colors: {
    primary_start: string
    primary_end: string
    primary_glow: string
    accent_color: string
    bg_primary: string
    bg_secondary: string
    bg_tertiary: string
  }
}

// ============================================
// Notification Types
// ============================================

/** 通知 */
export interface Notification {
  id: string
  user_id: string
  form_id: string | null
  type: NotificationType
  content: NotificationContent
  read: boolean
  created_at: string
}

/** 通知内容 */
export interface NotificationContent {
  title: string
  message: string
  link?: string
}

// ============================================
// Admin & System Types
// ============================================

/** 管理员日志 */
export interface AdminLog {
  id: string
  admin_id: string | null

  // 操作信息
  action: AdminAction
  resource_type: string | null
  resource_id: string | null

  // 操作详情
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null

  created_at: string
}

/** 内容审核 */
export interface ContentReview {
  id: string

  // 被举报内容
  resource_type: string
  resource_id: string

  // 举报信息
  report_type: ReportType
  reporter_id: string | null
  report_reason: string | null
  report_evidence: Record<string, any>

  // 审核信息
  status: ReviewStatus
  reviewer_id: string | null
  review_notes: string | null
  reviewed_at: string | null

  // 处理结果
  action_taken: string | null
  resource_banned: boolean

  created_at: string
}

/** 系统设置 */
export interface SystemSetting {
  key: string
  value: any
  description: string | null
  updated_by: string | null
  updated_at: string
}

// ============================================
// Guest Form Types
// ============================================

/** 访客表单 */
export interface GuestForm {
  id: string
  form_id: string
  guest_email: string | null
  session_id: string
  access_token: string
  expires_at: string | null
  created_at: string
}

/** 访客表单输入 */
export interface GuestFormInput {
  guest_email?: string
  expires_at?: string
}

// ============================================
// Uploaded File Types
// ============================================

/** 上传文件 */
export interface UploadedFile {
  id: string
  submission_id: string
  question_id: string
  file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  storage_path: string | null
  created_at: string
}

// ============================================
// API Response Types
// ============================================

/** API 成功响应 */
export interface ApiSuccess<T = any> {
  success: true
  data: T
  message?: string
}

/** API 错误响应 */
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

/** API 响应 */
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError

/** 分页参数 */
export interface PaginationParams {
  page: number
  page_size: number
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/** 排序参数 */
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

/** 查询参数 */
export interface QueryParams extends Partial<PaginationParams> {
  sort?: SortParams
  filters?: Record<string, any>
  search?: string
}

// ============================================
// Statistics Types
// ============================================

/** 表单概览统计 */
export interface FormOverviewStats {
  total_views: number
  total_responses: number
  completion_rate: number
  avg_duration: number
  responses_today: number
  responses_this_week: number
  responses_this_month: number
}

/** 题目统计 */
export interface QuestionStats {
  question_id: string
  question_text: string
  question_type: QuestionType
  response_count: number
  skip_count: number

  // 选择题统计
  choice_distribution?: Array<{
    option: string
    count: number
    percentage: number
  }>

  // 评分题统计
  rating_stats?: {
    avg: number
    min: number
    max: number
    distribution: Record<number, number>
  }

  // 文本题统计
  text_stats?: {
    avg_length: number
    word_cloud?: Array<{ word: string; count: number }>
  }
}

/** 趋势数据点 */
export interface TrendDataPoint {
  date: string
  count: number
}

/** 时间范围 */
export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

// ============================================
// Auth Types
// ============================================

/** 登录输入 */
export interface LoginInput {
  email: string
  password: string
}

/** 注册输入 */
export interface RegisterInput {
  email: string
  password: string
  nickname?: string
}

/** OAuth 提供商 */
export type OAuthProvider = 'google' | 'github' | 'wechat'

/** 会话信息 */
export interface Session {
  user: {
    id: string
    email: string
    email_verified: boolean
  }
  access_token: string
  refresh_token: string
  expires_at: number
}

// ============================================
// Export Types
// ============================================

/** 导出格式 */
export type ExportFormat = 'csv' | 'xlsx' | 'json'

/** 导出选项 */
export interface ExportOptions {
  format: ExportFormat
  include_meta: boolean      // 是否包含提交时间、IP等元数据
  date_from?: string
  date_to?: string
}

// ============================================
// Component Props Types
// ============================================

/** 按钮变体 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'

/** 按钮大小 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** 输入框大小 */
export type InputSize = 'sm' | 'md' | 'lg'

/** 卡片类型 */
export type CardVariant = 'default' | 'glass' | 'bordered' | 'elevated'

/** 提示类型 */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

/** 弹窗大小 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** 加载状态 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ============================================
// Utility Types
// ============================================

/** 可选的 Partial（深度可选） */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 只读的 Readonly（深度只读） */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/** 提取数组元素类型 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/** 提取 Promise 返回类型 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/** 必需的字段 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/** 排除某些字段 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>
