/* ============================================
   MultiForms Question Toolbox Component

   题型工具箱组件：
   - 9种题型卡片
   - 点击添加题目
============================================ */

'use client'

import { memo } from 'react'
import {
  Circle,
  Square,
  ChevronDown,
  Star,
  Minus,
  Hash,
  Calendar,
  Upload,
  Grid3x3,
  Plus,
  ArrowRight,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/types'

// ============================================
// Types
// ============================================

export interface QuestionTypeConfig {
  type: QuestionType
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

// ============================================
// Question Type Definitions
// ============================================

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    type: 'single_choice',
    name: '单选题',
    description: '从多个选项中选择一个',
    icon: <Circle className="w-4 h-4" />,
    color: 'rgba(99, 102, 241, 0.15)',
  },
  {
    type: 'multiple_choice',
    name: '多选题',
    description: '可以选择多个选项',
    icon: <Square className="w-4 h-4" />,
    color: 'rgba(139, 92, 246, 0.15)',
  },
  {
    type: 'dropdown',
    name: '下拉选择',
    description: '从下拉列表中选择',
    icon: <ChevronDown className="w-4 h-4" />,
    color: 'rgba(6, 182, 212, 0.15)',
  },
  {
    type: 'rating',
    name: '评分题',
    description: '星级或数字评分',
    icon: <Star className="w-4 h-4" />,
    color: 'rgba(251, 191, 36, 0.15)',
  },
  {
    type: 'text',
    name: '文本题',
    description: '单行或多行文本输入',
    icon: <Minus className="w-4 h-4" />,
    color: 'rgba(16, 185, 129, 0.15)',
  },
  {
    type: 'number',
    name: '数字题',
    description: '仅允许输入数字',
    icon: <Hash className="w-4 h-4" />,
    color: 'rgba(249, 115, 22, 0.15)',
  },
  {
    type: 'date',
    name: '日期题',
    description: '选择日期或时间',
    icon: <Calendar className="w-4 h-4" />,
    color: 'rgba(239, 68, 68, 0.15)',
  },
  {
    type: 'file_upload',
    name: '文件上传',
    description: '允许上传文件',
    icon: <Upload className="w-4 h-4" />,
    color: 'rgba(107, 114, 128, 0.15)',
  },
  {
    type: 'matrix',
    name: '矩阵题',
    description: '二维选择矩阵',
    icon: <Grid3x3 className="w-4 h-4" />,
    color: 'rgba(236, 72, 153, 0.15)',
  },
]

// Advanced features
export const ADVANCED_FEATURES = [
  {
    id: 'logic',
    name: '逻辑跳转',
    icon: <ArrowRight className="w-5 h-5" />,
  },
  {
    id: 'theme',
    name: '主题样式',
    icon: <Palette className="w-5 h-5" />,
  },
]

// ============================================
// Props
// ============================================

interface QuestionToolboxProps {
  /** 点击添加题型 */
  onAddQuestion?: (type: QuestionType) => void
  /** 点击高级功能 */
  onAdvancedFeature?: (featureId: string) => void
  /** 额外的类名 */
  className?: string
}

// ============================================
// Question Type Card
// ============================================

interface TypeCardProps {
  config: QuestionTypeConfig
  onClick: () => void
}

function TypeCard({ config, onClick }: TypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 w-full text-left group',
        'bg-white/[0.03] border-white/[0.08]',
        'hover:bg-white/[0.06] hover:border-indigo-500/30 hover:translate-x-1',
        'active:scale-95'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          config.color
        )}
      >
        {config.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)]">
          {config.name}
        </div>
        <div className="text-xs text-[var(--text-muted)] truncate">
          {config.description}
        </div>
      </div>

      {/* Plus Icon on hover */}
      <Plus className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export const QuestionToolbox = memo(function QuestionToolbox({
  onAddQuestion,
  onAdvancedFeature,
  className,
}: QuestionToolboxProps) {
  const handleAddQuestion = (type: QuestionType) => {
    onAddQuestion?.(type)
  }

  const handleAdvancedFeature = (featureId: string) => {
    onAdvancedFeature?.(featureId)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/[0.05]">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          题型工具箱
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">点击添加题目</p>
      </div>

      {/* Question Types */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {QUESTION_TYPES.map((config) => (
          <TypeCard
            key={config.type}
            config={config}
            onClick={() => handleAddQuestion(config.type)}
          />
        ))}
      </div>

      {/* Advanced Features */}
      <div className="px-4 py-4 border-t border-white/[0.05] space-y-1">
        {ADVANCED_FEATURES.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleAdvancedFeature(feature.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              'hover:bg-white/[0.05] transition-all duration-200'
            )}
          >
            <div className="text-[var(--text-muted)]">
              {feature.icon}
            </div>
            <span className="text-sm">{feature.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
})
