/* ============================================
   MultiForms Question Toolbox Component

   题型工具箱组件：
   - 9种题型卡片
   - 拖拽功能
   - 点击添加功能
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
  GripVertical,
  ArrowRight,
  Palette,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
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
  {
    id: 'privacy',
    name: '隐私设置',
    icon: <Lock className="w-5 h-5" />,
  },
]

// ============================================
// Props
// ============================================

interface QuestionToolboxProps {
  /** 拖拽开始回调 */
  onDragStart?: (type: QuestionType) => void
  /** 点击添加题型 */
  onAddQuestion?: (type: QuestionType) => void
  /** 点击高级功能 */
  onAdvancedFeature?: (featureId: string) => void
  /** 是否为移动端 */
  isMobile?: boolean
  /** 额外的类名 */
  className?: string
}

// ============================================
// Draggable Question Type Card
// ============================================

interface DraggableTypeCardProps {
  config: QuestionTypeConfig
  onDragStart?: (type: QuestionType) => void
  onClick?: () => void
}

function DraggableTypeCard({ config, onDragStart, onClick }: DraggableTypeCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbox-${config.type}`,
    data: {
      type: config.type,
      source: 'toolbox',
    },
    onDragStart: () => onDragStart?.(config.type),
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-grab',
        'bg-white/[0.03] border-white/[0.08]',
        'hover:bg-white/[0.06] hover:border-indigo-500/30 hover:translate-x-1',
        'active:cursor-grabbing',
        isDragging && 'opacity-50 scale-95'
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

      {/* Drag Handle (visible on hover) */}
      <div className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  )
}

// ============================================
// Mobile Question Type Card (Clickable only)
// ============================================

interface MobileTypeCardProps {
  config: QuestionTypeConfig
  onClick: () => void
}

function MobileTypeCard({ config, onClick }: MobileTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 w-full text-left',
        'bg-white/[0.03] border-white/[0.08]',
        'hover:bg-white/[0.06] hover:border-indigo-500/30',
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
      </div>
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export const QuestionToolbox = memo(function QuestionToolbox({
  onDragStart,
  onAddQuestion,
  onAdvancedFeature,
  isMobile = false,
  className,
}: QuestionToolboxProps) {
  const handleAddQuestion = (type: QuestionType) => {
    onAddQuestion?.(type)
  }

  const handleAdvancedFeature = (featureId: string) => {
    onAdvancedFeature?.(featureId)
  }

  if (isMobile) {
    // Mobile simplified version
    return (
      <div className={cn('space-y-2', className)}>
        {QUESTION_TYPES.map((config) => (
          <MobileTypeCard
            key={config.type}
            config={config}
            onClick={() => handleAddQuestion(config.type)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/[0.05]">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          题型工具箱
        </h2>
      </div>

      {/* Question Types */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {QUESTION_TYPES.map((config) => (
          <DraggableTypeCard
            key={config.type}
            config={config}
            onDragStart={onDragStart}
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
