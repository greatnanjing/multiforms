/* ============================================
   MultiForms Template Definitions

   表单模板定义，包含预设的表单配置和题目。
   支持从模板快速创建表单。

   Usage:
   ```ts
   import { getTemplateById, TEMPLATE_IDS } from '@/lib/templates/definitions'

   const template = getTemplateById(TEMPLATE_IDS.ACTIVITY_VOTE)
   ```
============================================ */

import type { FormInput, QuestionType, QuestionOptions, QuestionValidation } from '@/types'

// ============================================
// Types
// ============================================

/** 模板题目定义 */
export interface TemplateQuestion {
  question_text: string
  question_type: QuestionType
  options?: QuestionOptions
  validation?: QuestionValidation
}

/** 表单模板定义 */
export interface FormTemplate {
  id: string
  name: string
  description: string
  category: 'vote' | 'survey' | 'rating' | 'feedback' | 'collection'
  type: FormInput['type']
  icon?: string
  /** 表单基础配置（不包含 type 和 theme_config） */
  formConfig: Omit<FormInput, 'theme_config' | 'type'>
  /** 预设题目 */
  questions: TemplateQuestion[]
}

// ============================================
// Template IDs
// ============================================

export const TEMPLATE_IDS = {
  ACTIVITY_VOTE: 'activity-vote',
  SATISFACTION_SURVEY: 'satisfaction-survey',
  EMPLOYEE_RATING: 'employee-rating',
  ACTIVITY_SIGNUP: 'activity-signup',
  USER_FEEDBACK: 'user-feedback',
  MEETING_BOOKING: 'meeting-booking',
  TEAM_RECRUITMENT: 'team-recruitment',
  QUESTIONNAIRE: 'questionnaire',
  // 新增模板
  PRODUCT_RESEARCH: 'product-research',
  COURSE_FEEDBACK: 'course-feedback',
  EVENT_FEEDBACK: 'event-feedback',
  CUSTOMER_SERVICE: 'customer-service',
  MARKET_RESEARCH: 'market-research',
  NPS_SURVEY: 'nps-survey',
  REGISTRATION_FORM: 'registration-form',
  CONTACT_US: 'contact-us',
} as const

export type TemplateId = (typeof TEMPLATE_IDS)[keyof typeof TEMPLATE_IDS]

// ============================================
// Template Definitions
// ============================================

const templates: Record<TemplateId, FormTemplate> = {
  // 活动投票模板
  [TEMPLATE_IDS.ACTIVITY_VOTE]: {
    id: TEMPLATE_IDS.ACTIVITY_VOTE,
    name: '活动投票',
    description: '用于活动时间、地点、候选人等投票场景',
    category: 'vote',
    type: 'vote',
    icon: 'ThumbsUp',
    formConfig: {
      title: '活动投票',
      description: '请选择您认为最合适的选项',
      access_type: 'public',
      max_per_user: 1,
      show_results: true,
    },
    questions: [
      {
        question_text: '您认为最佳的活动时间是？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '本周六下午', value: 'saturday-afternoon' },
            { id: '2', label: '本周日下午', value: 'sunday-afternoon' },
            { id: '3', label: '下周六下午', value: 'next-saturday-afternoon' },
            { id: '4', label: '下周日下午', value: 'next-sunday-afternoon' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您希望的互动方式是？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '游戏互动', value: 'games' },
            { id: '2', label: '自由交流', value: 'networking' },
            { id: '3', label: '主题分享', value: 'sharing' },
            { id: '4', label: '团队协作', value: 'teamwork' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '其他建议或意见',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的建议或意见...',
        },
        validation: { required: false },
      },
    ],
  },

  // 满意度调研模板
  [TEMPLATE_IDS.SATISFACTION_SURVEY]: {
    id: TEMPLATE_IDS.SATISFACTION_SURVEY,
    name: '满意度调研',
    description: '收集用户对产品或服务的满意度反馈',
    category: 'survey',
    type: 'survey',
    icon: 'MessageSquare',
    formConfig: {
      title: '用户满意度调研',
      description: '您的意见对我们很重要，请花几分钟完成问卷',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您使用我们产品多久了？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '不到1个月', value: 'less-1-month' },
            { id: '2', label: '1-6个月', value: '1-6-months' },
            { id: '3', label: '6-12个月', value: '6-12-months' },
            { id: '4', label: '超过1年', value: 'over-1-year' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您对产品的整体满意度如何？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '您最喜欢产品的哪个方面？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '界面设计', value: 'ui-design' },
            { id: '2', label: '功能丰富', value: 'features' },
            { id: '3', label: '易用性', value: 'usability' },
            { id: '4', label: '性能表现', value: 'performance' },
            { id: '5', label: '客户服务', value: 'customer-service' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '请分享您的使用体验或改进建议',
        question_type: 'textarea',
        options: {
          placeholder: '请详细描述您的使用体验...',
        },
        validation: { required: false },
      },
    ],
  },

  // 员工评分模板
  [TEMPLATE_IDS.EMPLOYEE_RATING]: {
    id: TEMPLATE_IDS.EMPLOYEE_RATING,
    name: '员工评分',
    description: '对员工的工作表现进行多维度评分',
    category: 'rating',
    type: 'rating',
    icon: 'Star',
    formConfig: {
      title: '员工绩效评分',
      description: '请对以下方面进行客观评价',
      access_type: 'private',
    },
    questions: [
      {
        question_text: '被评分员工姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入员工姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '工作质量 - 交付成果的质量如何？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '工作效率 - 任务完成的及时性如何？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '团队协作 - 与同事合作配合度如何？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '创新能力 - 是否能提出新想法和解决方案？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '综合评价和建议',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的综合评价和建议...',
        },
        validation: { required: false },
      },
    ],
  },

  // 活动报名模板
  [TEMPLATE_IDS.ACTIVITY_SIGNUP]: {
    id: TEMPLATE_IDS.ACTIVITY_SIGNUP,
    name: '活动报名',
    description: '收集活动参与者的报名信息',
    category: 'collection',
    type: 'collection',
    icon: 'ClipboardList',
    formConfig: {
      title: '活动报名表',
      description: '请填写您的报名信息，我们会尽快与您联系',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您的姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入您的姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '联系电话',
        question_type: 'phone',
        options: {
          placeholder: '请输入手机号码',
        },
        validation: { required: true },
      },
      {
        question_text: '电子邮箱',
        question_type: 'email',
        options: {
          placeholder: '请输入邮箱地址',
        },
        validation: { required: true },
      },
      {
        question_text: '您想参加的活动场次',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '上午场 9:00-12:00', value: 'morning' },
            { id: '2', label: '下午场 14:00-17:00', value: 'afternoon' },
            { id: '3', label: '晚场 19:00-21:00', value: 'evening' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '特殊需求或备注',
        question_type: 'textarea',
        options: {
          placeholder: '如有特殊需求请在此说明...',
        },
        validation: { required: false },
      },
    ],
  },

  // 用户反馈模板
  [TEMPLATE_IDS.USER_FEEDBACK]: {
    id: TEMPLATE_IDS.USER_FEEDBACK,
    name: '用户反馈',
    description: '收集用户对产品功能或服务的反馈意见',
    category: 'feedback',
    type: 'feedback',
    icon: 'HelpCircle',
    formConfig: {
      title: '用户反馈表',
      description: '您的反馈帮助我们做得更好',
      access_type: 'public',
    },
    questions: [
      {
        question_text: '反馈类型',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '功能建议', value: 'feature-suggestion' },
            { id: '2', label: '问题反馈', value: 'bug-report' },
            { id: '3', label: '使用咨询', value: 'usage-help' },
            { id: '4', label: '其他', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '反馈内容',
        question_type: 'textarea',
        options: {
          placeholder: '请详细描述您的反馈内容...',
        },
        validation: { required: true, max_length: 1000 },
      },
      {
        question_text: '您的联系方式（可选）',
        question_type: 'email',
        options: {
          placeholder: '如需回复请留下邮箱',
        },
        validation: { required: false },
      },
      {
        question_text: '您对我们的产品满意度如何？',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: false },
      },
    ],
  },

  // 会议预约模板
  [TEMPLATE_IDS.MEETING_BOOKING]: {
    id: TEMPLATE_IDS.MEETING_BOOKING,
    name: '会议预约',
    description: '收集会议预约信息和时间偏好',
    category: 'collection',
    type: 'collection',
    icon: 'Calendar',
    formConfig: {
      title: '会议预约表',
      description: '请填写您希望预约的会议信息',
      access_type: 'public',
    },
    questions: [
      {
        question_text: '您的姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入您的姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '部门/团队',
        question_type: 'text',
        options: {
          placeholder: '请输入您的部门或团队',
        },
        validation: { required: true },
      },
      {
        question_text: '会议主题',
        question_type: 'text',
        options: {
          placeholder: '请输入会议主题',
        },
        validation: { required: true },
      },
      {
        question_text: '期望会议日期',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '本周', value: 'this-week' },
            { id: '2', label: '下周', value: 'next-week' },
            { id: '3', label: '本月内', value: 'this-month' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '期望会议时段',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '上午 (9:00-12:00)', value: 'morning' },
            { id: '2', label: '下午 (14:00-17:00)', value: 'afternoon' },
            { id: '3', label: '其他时间', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '会议时长（预期）',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '30分钟', value: '30min' },
            { id: '2', label: '1小时', value: '1hour' },
            { id: '3', label: '1.5小时', value: '1.5hours' },
            { id: '4', label: '2小时', value: '2hours' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '会议说明或备注',
        question_type: 'textarea',
        options: {
          placeholder: '请简要说明会议目的或需要准备的内容...',
        },
        validation: { required: false },
      },
    ],
  },

  // 团队招募模板
  [TEMPLATE_IDS.TEAM_RECRUITMENT]: {
    id: TEMPLATE_IDS.TEAM_RECRUITMENT,
    name: '团队招募',
    description: '收集团队成员招募申请信息',
    category: 'collection',
    type: 'collection',
    icon: 'Users',
    formConfig: {
      title: '团队成员招募申请',
      description: '欢迎加入我们的团队！请填写申请信息',
      access_type: 'public',
    },
    questions: [
      {
        question_text: '您的姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入您的姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '年龄',
        question_type: 'number',
        options: {
          number_min: 16,
          number_max: 100,
          number_step: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '联系电话',
        question_type: 'phone',
        options: {
          placeholder: '请输入手机号码',
        },
        validation: { required: true },
      },
      {
        question_text: '微信（可选）',
        question_type: 'text',
        options: {
          placeholder: '请输入微信号',
        },
        validation: { required: false },
      },
      {
        question_text: '您想申请的职位',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '技术组', value: 'tech' },
            { id: '2', label: '设计组', value: 'design' },
            { id: '3', label: '运营组', value: 'operations' },
            { id: '4', label: '内容组', value: 'content' },
            { id: '5', label: '其他', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您的相关经验',
        question_type: 'textarea',
        options: {
          placeholder: '请简述您与申请职位相关的经验...',
        },
        validation: { required: true },
      },
      {
        question_text: '您每周能投入多少时间？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '少于5小时', value: 'less-5' },
            { id: '2', label: '5-10小时', value: '5-10' },
            { id: '3', label: '10-20小时', value: '10-20' },
            { id: '4', label: '20小时以上', value: 'over-20' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '其他想说明的内容',
        question_type: 'textarea',
        options: {
          placeholder: '请输入其他想说明的内容...',
        },
        validation: { required: false },
      },
    ],
  },

  // 问卷调查模板
  [TEMPLATE_IDS.QUESTIONNAIRE]: {
    id: TEMPLATE_IDS.QUESTIONNAIRE,
    name: '问卷调查',
    description: '通用的问卷调查表单模板',
    category: 'survey',
    type: 'survey',
    icon: 'Tag',
    formConfig: {
      title: '问卷调查',
      description: '感谢您参与本次问卷调查',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您的年龄段',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '18岁以下', value: 'under-18' },
            { id: '2', label: '18-25岁', value: '18-25' },
            { id: '3', label: '26-35岁', value: '26-35' },
            { id: '4', label: '36-45岁', value: '36-45' },
            { id: '5', label: '46岁以上', value: 'over-46' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您的职业',
        question_type: 'dropdown',
        options: {
          choices: [
            { id: '1', label: '学生', value: 'student' },
            { id: '2', label: '企业职员', value: 'employee' },
            { id: '3', label: '自由职业', value: 'freelancer' },
            { id: '4', label: '企业管理者', value: 'manager' },
            { id: '5', label: '其他', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您是如何了解到我们的？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '社交媒体', value: 'social-media' },
            { id: '2', label: '朋友推荐', value: 'friend-referral' },
            { id: '3', label: '搜索引擎', value: 'search-engine' },
            { id: '4', label: '广告投放', value: 'advertisement' },
            { id: '5', label: '线下活动', value: 'offline-event' },
            { id: '6', label: '其他', value: 'other' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '您对我们产品的了解程度',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '非常了解', value: 'very-familiar' },
            { id: '2', label: '比较了解', value: 'quite-familiar' },
            { id: '3', label: '一般了解', value: 'somewhat-familiar' },
            { id: '4', label: '不太了解', value: 'not-familiar' },
            { id: '5', label: '完全不了解', value: 'not-at-all' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您最关心产品的哪些方面？（多选）',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '功能完整性', value: 'features' },
            { id: '2', label: '使用便捷性', value: 'ease-of-use' },
            { id: '3', label: '数据安全性', value: 'security' },
            { id: '4', label: '价格合理性', value: 'price' },
            { id: '5', label: '客户服务', value: 'service' },
            { id: '6', label: '品牌口碑', value: 'brand' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '您的建议或意见',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的建议或意见...',
        },
        validation: { required: false },
      },
    ],
  },

  // 产品调研模板
  [TEMPLATE_IDS.PRODUCT_RESEARCH]: {
    id: TEMPLATE_IDS.PRODUCT_RESEARCH,
    name: '产品调研',
    description: '了解用户对产品功能的需求和期望',
    category: 'survey',
    type: 'survey',
    icon: 'Tag',
    formConfig: {
      title: '产品需求调研',
      description: '您的反馈将帮助我们改进产品',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您目前使用类似产品的频率是？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '每天使用', value: 'daily' },
            { id: '2', label: '每周几次', value: 'weekly' },
            { id: '3', label: '偶尔使用', value: 'occasionally' },
            { id: '4', label: '很少使用', value: 'rarely' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您最希望产品新增的功能是？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '数据导出功能', value: 'export' },
            { id: '2', label: '多人协作', value: 'collaboration' },
            { id: '3', label: '移动端优化', value: 'mobile' },
            { id: '4', label: '自定义主题', value: 'theme' },
            { id: '5', label: 'API 接口', value: 'api' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您认为目前产品的痛点是什么？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '操作复杂', value: 'complex' },
            { id: '2', label: '功能不够完善', value: 'features' },
            { id: '3', label: '性能问题', value: 'performance' },
            { id: '4', label: '价格偏高', value: 'price' },
            { id: '5', label: '缺少文档支持', value: 'docs' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '您愿意为这个产品支付的价格范围是？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '免费使用', value: 'free' },
            { id: '2', label: '¥10-30/月', value: '10-30' },
            { id: '3', label: '¥30-100/月', value: '30-100' },
            { id: '4', label: '¥100+/月', value: '100+' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '其他建议',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的建议...',
        },
        validation: { required: false },
      },
    ],
  },

  // 课程反馈模板
  [TEMPLATE_IDS.COURSE_FEEDBACK]: {
    id: TEMPLATE_IDS.COURSE_FEEDBACK,
    name: '课程反馈',
    description: '收集学员对课程内容和讲师的评价',
    category: 'feedback',
    type: 'feedback',
    icon: 'MessageSquare',
    formConfig: {
      title: '课程反馈表',
      description: '帮助我们改进课程质量',
      access_type: 'public',
    },
    questions: [
      {
        question_text: '您对本次课程的整体满意度',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '课程内容是否符合您的预期？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '超出预期', value: 'exceeded' },
            { id: '2', label: '符合预期', value: 'met' },
            { id: '3', label: '基本符合', value: 'partially' },
            { id: '4', label: '不符合预期', value: 'not-met' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您认为课程内容的难度如何？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '太简单', value: 'too-easy' },
            { id: '2', label: '适中', value: 'appropriate' },
            { id: '3', label: '较难', value: 'difficult' },
            { id: '4', label: '太难', value: 'too-difficult' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '讲师的专业水平和表达能力',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '您最希望改进的方面',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '课程内容', value: 'content' },
            { id: '2', label: '讲师讲解', value: 'teaching' },
            { id: '3', label: '课程时长', value: 'duration' },
            { id: '4', label: '互动环节', value: 'interaction' },
            { id: '5', label: '课程资料', value: 'materials' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '其他反馈建议',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的反馈...',
        },
        validation: { required: false },
      },
    ],
  },

  // 活动反馈模板
  [TEMPLATE_IDS.EVENT_FEEDBACK]: {
    id: TEMPLATE_IDS.EVENT_FEEDBACK,
    name: '活动反馈',
    description: '收集参与者对活动的意见和建议',
    category: 'feedback',
    type: 'feedback',
    icon: 'Star',
    formConfig: {
      title: '活动反馈表',
      description: '感谢您参与本次活动，请留下宝贵意见',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您对本次活动的整体评价',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '您最喜欢的活动环节',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '主题演讲', value: 'keynote' },
            { id: '2', label: '互动游戏', value: 'games' },
            { id: '3', label: '小组讨论', value: 'discussion' },
            { id: '4', label: '茶歇交流', value: 'networking' },
            { id: '5', label: '抽奖环节', value: 'lottery' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '活动组织方面您觉得哪些需要改进？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '时间安排', value: 'schedule' },
            { id: '2', label: '场地环境', value: 'venue' },
            { id: '3', label: '签到流程', value: 'check-in' },
            { id: '4', label: '活动通知', value: 'notification' },
            { id: '5', label: '餐饮服务', value: 'catering' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '您是否愿意推荐给朋友参加类似活动？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '一定会', value: 'definitely' },
            { id: '2', label: '可能会', value: 'maybe' },
            { id: '3', label: '不确定', value: 'unsure' },
            { id: '4', label: '不会', value: 'no' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '其他建议或意见',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的建议...',
        },
        validation: { required: false },
      },
    ],
  },

  // 客服评价模板
  [TEMPLATE_IDS.CUSTOMER_SERVICE]: {
    id: TEMPLATE_IDS.CUSTOMER_SERVICE,
    name: '客服评价',
    description: '客户对服务质量的评价和反馈',
    category: 'rating',
    type: 'rating',
    icon: 'Star',
    formConfig: {
      title: '客服服务评价',
      description: '您的反馈将帮助我们提升服务质量',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '客服人员的响应速度',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '客服人员的专业能力',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '问题是否得到有效解决？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '完全解决', value: 'fully' },
            { id: '2', label: '部分解决', value: 'partially' },
            { id: '3', label: '未解决', value: 'not' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您对本次服务的整体满意度',
        question_type: 'rating',
        options: {
          rating_type: 'star',
          rating_max: 5,
          rating_min: 1,
        },
        validation: { required: true },
      },
      {
        question_text: '其他反馈',
        question_type: 'textarea',
        options: {
          placeholder: '请输入您的反馈...',
        },
        validation: { required: false },
      },
    ],
  },

  // 市场调研模板
  [TEMPLATE_IDS.MARKET_RESEARCH]: {
    id: TEMPLATE_IDS.MARKET_RESEARCH,
    name: '市场调研',
    description: '收集市场数据和消费者行为洞察',
    category: 'survey',
    type: 'survey',
    icon: 'Tag',
    formConfig: {
      title: '市场调研问卷',
      description: '感谢您参与市场调研',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您的年龄段',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '18岁以下', value: 'under-18' },
            { id: '2', label: '18-25岁', value: '18-25' },
            { id: '3', label: '26-35岁', value: '26-35' },
            { id: '4', label: '36-45岁', value: '36-45' },
            { id: '5', label: '46岁以上', value: 'over-46' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您的职业',
        question_type: 'dropdown',
        options: {
          choices: [
            { id: '1', label: '学生', value: 'student' },
            { id: '2', label: '企业职员', value: 'employee' },
            { id: '3', label: '自由职业', value: 'freelancer' },
            { id: '4', label: '企业管理者', value: 'manager' },
            { id: '5', label: '其他', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '您的月收入范围',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '5000元以下', value: 'under-5k' },
            { id: '2', label: '5000-10000元', value: '5k-10k' },
            { id: '3', label: '10000-20000元', value: '10k-20k' },
            { id: '4', label: '20000-50000元', value: '20k-50k' },
            { id: '5', label: '50000元以上', value: 'over-50k' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '您通常通过什么渠道了解产品信息？',
        question_type: 'multiple_choice',
        options: {
          choices: [
            { id: '1', label: '社交媒体', value: 'social-media' },
            { id: '2', label: '搜索引擎', value: 'search-engine' },
            { id: '3', label: '朋友推荐', value: 'referral' },
            { id: '4', label: '电视广告', value: 'tv-ad' },
            { id: '5', label: '线下门店', value: 'offline' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '购买产品时您最看重的因素',
        question_type: 'sorting',
        options: {
          sortable_items: ['价格', '质量', '品牌', '服务', '外观'],
        },
        validation: { required: true },
      },
    ],
  },

  // NPS净推荐值模板
  [TEMPLATE_IDS.NPS_SURVEY]: {
    id: TEMPLATE_IDS.NPS_SURVEY,
    name: 'NPS推荐值',
    description: '测量用户推荐意愿的经典NPS问卷',
    category: 'survey',
    type: 'survey',
    icon: 'TrendingUp',
    formConfig: {
      title: 'NPS净推荐值调研',
      description: '只需1分钟，帮助我们了解您的推荐意愿',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '您有多大可能向朋友或同事推荐我们的产品？',
        question_type: 'rating',
        options: {
          rating_type: 'number',
          rating_max: 10,
          rating_min: 0,
        },
        validation: { required: true },
      },
      {
        question_text: '您给出这个评分的主要原因是？',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '产品功能强大', value: 'features' },
            { id: '2', label: '使用体验好', value: 'ux' },
            { id: '3', label: '价格合理', value: 'price' },
            { id: '4', label: '客户服务好', value: 'service' },
            { id: '5', label: '品牌信任', value: 'brand' },
            { id: '6', label: '其他原因', value: 'other' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '我们需要在哪些方面改进才能提高您的评分？',
        question_type: 'textarea',
        options: {
          placeholder: '请告诉我们您的建议...',
        },
        validation: { required: false },
      },
    ],
  },

  // 注册申请模板
  [TEMPLATE_IDS.REGISTRATION_FORM]: {
    id: TEMPLATE_IDS.REGISTRATION_FORM,
    name: '注册申请',
    description: '通用的活动/服务注册申请表单',
    category: 'collection',
    type: 'collection',
    icon: 'ClipboardList',
    formConfig: {
      title: '注册申请表',
      description: '请填写您的注册信息',
      access_type: 'public',
      max_per_user: 1,
    },
    questions: [
      {
        question_text: '姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入您的姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '性别',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '男', value: 'male' },
            { id: '2', label: '女', value: 'female' },
            { id: '3', label: '不便透露', value: 'prefer-not' },
          ],
        },
        validation: { required: false },
      },
      {
        question_text: '出生日期',
        question_type: 'date',
        options: {
          date_format: 'YYYY-MM-DD',
        },
        validation: { required: true },
      },
      {
        question_text: '手机号码',
        question_type: 'phone',
        options: {
          placeholder: '请输入手机号码',
        },
        validation: { required: true },
      },
      {
        question_text: '电子邮箱',
        question_type: 'email',
        options: {
          placeholder: '请输入邮箱地址',
        },
        validation: { required: true },
      },
      {
        question_text: '所在城市',
        question_type: 'text',
        options: {
          placeholder: '请输入所在城市',
        },
        validation: { required: true },
      },
      {
        question_text: '备注信息',
        question_type: 'textarea',
        options: {
          placeholder: '如有其他需要说明的信息请在此填写...',
        },
        validation: { required: false },
      },
    ],
  },

  // 联系我们模板
  [TEMPLATE_IDS.CONTACT_US]: {
    id: TEMPLATE_IDS.CONTACT_US,
    name: '联系我们',
    description: '网站联系我们/联系表单模板',
    category: 'collection',
    type: 'collection',
    icon: 'MessageSquare',
    formConfig: {
      title: '联系我们',
      description: '有任何问题或建议，欢迎与我们联系',
      access_type: 'public',
    },
    questions: [
      {
        question_text: '您的姓名',
        question_type: 'text',
        options: {
          placeholder: '请输入您的姓名',
        },
        validation: { required: true },
      },
      {
        question_text: '联系邮箱',
        question_type: 'email',
        options: {
          placeholder: '请输入邮箱地址',
        },
        validation: { required: true },
      },
      {
        question_text: '联系电话（可选）',
        question_type: 'phone',
        options: {
          placeholder: '请输入手机号码',
        },
        validation: { required: false },
      },
      {
        question_text: '咨询类型',
        question_type: 'single_choice',
        options: {
          choices: [
            { id: '1', label: '产品咨询', value: 'product' },
            { id: '2', label: '商务合作', value: 'business' },
            { id: '3', label: '技术支持', value: 'support' },
            { id: '4', label: '投诉建议', value: 'feedback' },
            { id: '5', label: '其他', value: 'other' },
          ],
        },
        validation: { required: true },
      },
      {
        question_text: '留言内容',
        question_type: 'textarea',
        options: {
          placeholder: '请描述您的问题或需求...',
        },
        validation: { required: true, max_length: 500 },
      },
    ],
  },
}

// ============================================
// Export Functions
// ============================================

/**
 * 获取所有模板列表（原始 FormTemplate 格式）
 */
export function getAllFormTemplates(): FormTemplate[] {
  return Object.values(templates)
}

/**
 * 通过 ID 获取模板
 */
export function getTemplateById(id: TemplateId | string): FormTemplate | undefined {
  return templates[id as TemplateId]
}

/**
 * 通过分类获取模板
 */
export function getTemplatesByCategory(category: FormTemplate['category']): FormTemplate[] {
  return Object.values(templates).filter(t => t.category === category)
}

/**
 * 模板展示数据（用于首页和模板库页面展示）
 */
export interface TemplateShowcase {
  id: string
  name: string
  description: string
  type: string
  category: FormTemplate['category']
  iconName: string
  questionsCount: number
  useCount: number
}

/**
 * 获取模板列表（用于首页和模板库展示）
 * @returns 预置模板列表
 */
export function getTemplatesForShowcase(): TemplateShowcase[] {
  return [
    {
      id: TEMPLATE_IDS.ACTIVITY_VOTE,
      name: '活动投票',
      description: '用于活动时间、地点、候选人等投票场景',
      type: '投票',
      category: 'vote',
      iconName: 'ThumbsUp',
      questionsCount: 3,
      useCount: 12500,
    },
    {
      id: TEMPLATE_IDS.SATISFACTION_SURVEY,
      name: '满意度调研',
      description: '收集用户对产品或服务的满意度反馈',
      type: '问卷',
      category: 'survey',
      iconName: 'MessageSquare',
      questionsCount: 4,
      useCount: 8200,
    },
    {
      id: TEMPLATE_IDS.EMPLOYEE_RATING,
      name: '员工评分',
      description: '对员工的工作表现进行多维度评分',
      type: '评分',
      category: 'rating',
      iconName: 'Star',
      questionsCount: 6,
      useCount: 5600,
    },
    {
      id: TEMPLATE_IDS.ACTIVITY_SIGNUP,
      name: '活动报名',
      description: '收集活动参与者的报名信息',
      type: '信息收集',
      category: 'collection',
      iconName: 'ClipboardList',
      questionsCount: 5,
      useCount: 15300,
    },
    {
      id: TEMPLATE_IDS.USER_FEEDBACK,
      name: '用户反馈',
      description: '收集用户对产品功能或服务的反馈意见',
      type: '反馈',
      category: 'feedback',
      iconName: 'HelpCircle',
      questionsCount: 4,
      useCount: 18900,
    },
    {
      id: TEMPLATE_IDS.MEETING_BOOKING,
      name: '会议预约',
      description: '收集会议预约信息和时间偏好',
      type: '预约',
      category: 'collection',
      iconName: 'Calendar',
      questionsCount: 7,
      useCount: 6800,
    },
    {
      id: TEMPLATE_IDS.TEAM_RECRUITMENT,
      name: '团队招募',
      description: '收集团队成员招募申请信息',
      type: '报名',
      category: 'collection',
      iconName: 'Users',
      questionsCount: 8,
      useCount: 22100,
    },
    {
      id: TEMPLATE_IDS.QUESTIONNAIRE,
      name: '问卷调查',
      description: '通用的问卷调查表单模板',
      type: '问卷',
      category: 'survey',
      iconName: 'Tag',
      questionsCount: 6,
      useCount: 18700,
    },
    // 新增模板
    {
      id: TEMPLATE_IDS.PRODUCT_RESEARCH,
      name: '产品调研',
      description: '了解用户对产品功能的需求和期望',
      type: '问卷',
      category: 'survey',
      iconName: 'Tag',
      questionsCount: 5,
      useCount: 9200,
    },
    {
      id: TEMPLATE_IDS.COURSE_FEEDBACK,
      name: '课程反馈',
      description: '收集学员对课程内容和讲师的评价',
      type: '反馈',
      category: 'feedback',
      iconName: 'MessageSquare',
      questionsCount: 6,
      useCount: 7800,
    },
    {
      id: TEMPLATE_IDS.EVENT_FEEDBACK,
      name: '活动反馈',
      description: '收集参与者对活动的意见和建议',
      type: '反馈',
      category: 'feedback',
      iconName: 'Star',
      questionsCount: 5,
      useCount: 11200,
    },
    {
      id: TEMPLATE_IDS.CUSTOMER_SERVICE,
      name: '客服评价',
      description: '客户对服务质量的评价和反馈',
      type: '评分',
      category: 'rating',
      iconName: 'Star',
      questionsCount: 5,
      useCount: 15600,
    },
    {
      id: TEMPLATE_IDS.MARKET_RESEARCH,
      name: '市场调研',
      description: '收集市场数据和消费者行为洞察',
      type: '问卷',
      category: 'survey',
      iconName: 'Tag',
      questionsCount: 5,
      useCount: 8400,
    },
    {
      id: TEMPLATE_IDS.NPS_SURVEY,
      name: 'NPS推荐值',
      description: '测量用户推荐意愿的经典NPS问卷',
      type: '问卷',
      category: 'survey',
      iconName: 'TrendingUp',
      questionsCount: 3,
      useCount: 31200,
    },
    {
      id: TEMPLATE_IDS.REGISTRATION_FORM,
      name: '注册申请',
      description: '通用的活动/服务注册申请表单',
      type: '信息收集',
      category: 'collection',
      iconName: 'ClipboardList',
      questionsCount: 7,
      useCount: 24500,
    },
    {
      id: TEMPLATE_IDS.CONTACT_US,
      name: '联系我们',
      description: '网站联系我们/联系表单模板',
      type: '信息收集',
      category: 'collection',
      iconName: 'MessageSquare',
      questionsCount: 5,
      useCount: 35800,
    },
  ]
}

/**
 * 获取数据库中的模板（管理员创建的）
 * @returns 数据库模板列表
 */
export async function getDatabaseTemplates(): Promise<TemplateShowcase[]> {
  try {
    // 添加超时保护，防止数据库查询阻塞渲染
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database templates query timeout')), 5000)
    )

    // 动态导入以避免服务端导入问题
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const queryPromise = supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error || !data) {
      console.warn('Failed to fetch database templates:', error)
      return []
    }

    // 将数据库模板转换为 TemplateShowcase 格式
    return data.map((t: any) => ({
      id: t.id,
      name: t.title,
      description: t.description || '',
      type: t.category,
      category: t.category,
      iconName: 'FileText',
      questionsCount: 0, // TODO: 可以从 demo_form_id 关联获取
      useCount: t.use_count || 0,
      // 添加数据库标识
      ...(t as any),
    }))
  } catch (error) {
    // 超时或其他错误时，静默返回空数组
    if (error instanceof Error && error.message.includes('timeout')) {
      console.warn('[Templates] Database templates query timed out, using presets only')
    } else {
      console.warn('[Templates] Error fetching database templates:', error)
    }
    return []
  }
}

/**
 * 获取所有模板（预置 + 数据库）
 * @returns 所有模板列表
 */
export async function getAllTemplates(): Promise<TemplateShowcase[]> {
  const presetTemplates = getTemplatesForShowcase()
  const dbTemplates = await getDatabaseTemplates()
  return [...presetTemplates, ...dbTemplates]
}

/**
 * 订阅数据库模板的实时更新
 * @param callback 模板更新时的回调函数
 * @returns 取消订阅的函数
 */
export function subscribeToDatabaseTemplates(
  callback: (templates: TemplateShowcase[]) => void
): () => void {
  let channel: any = null

  // 使用动态导入避免在服务端执行
  const setupSubscription = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // 订阅 templates 表的变更
      channel = supabase
        .channel('templates-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // 监听所有变更：INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'templates',
          },
          async () => {
            // 当模板发生变化时，重新获取并回调
            const updatedTemplates = await getDatabaseTemplates()
            callback(updatedTemplates)
          }
        )
        .subscribe()

      console.log('[Templates] Realtime subscription established')
    } catch (error) {
      console.warn('[Templates] Failed to setup realtime subscription:', error)
    }
  }

  setupSubscription()

  // 返回取消订阅的函数
  return () => {
    if (channel) {
      channel.unsubscribe()
      console.log('[Templates] Realtime subscription cancelled')
    }
  }
}
