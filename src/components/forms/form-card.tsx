/* ============================================
   MultiForms Form Card Component

   表单预览卡片组件：
   - 显示表单标题、类型图标
   - 显示回复数、更新时间
   - 操作按钮（编辑、分享、分析、删除）

   Usage:
   ```tsx
   import { FormCard } from '@/components/forms/form-card'

   <FormCard
     form={form}
     onEdit={() => navigate(`/forms/${form.id}/edit`)}
     onShare={() => shareForm(form.id)}
     onAnalyze={() => navigate(`/forms/${form.id}/analytics`)}
     onDelete={() => deleteForm(form.id)}
   />
   ```
============================================ */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  ListTodo,
  BarChart3,
  Share2,
  Edit,
  Trash2,
  MoreVertical,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Form, FormType } from '@/types'

// ============================================
// Types
// ============================================

interface FormCardProps {
  /** 表单数据 */
  form: Form
  /** 是否紧凑模式 */
  compact?: boolean
  /** 点击卡片回调 */
  onClick?: () => void
  /** 编辑回调 */
  onEdit?: (e: React.MouseEvent) => void
  /** 分享回调 */
  onShare?: (e: React.MouseEvent) => void
  /** 分析回调 */
  onAnalyze?: (e: React.MouseEvent) => void
  /** 删除回调 */
  onDelete?: (e: React.MouseEvent) => void
  /** 状态切换回调 */
  onCycleStatus?: (e: React.MouseEvent) => void
  /** 是否显示删除按钮 */
  showDelete?: boolean
  /** 额外的类名 */
  className?: string
}

// ============================================
// Helpers
// ============================================

/** 表单类型图标映射 */
const formTypeIcons: Record<FormType, React.ReactNode> = {
  survey: (
    <FileSearchIcon />
  ),
  vote: (
    <VoteIcon />
  ),
  rating: (
    <RatingIcon />
  ),
  collection: (
    <CollectionIcon />
  ),
  feedback: (
    <FeedbackIcon />
  ),
}

/** 表单类型样式映射 */
const formTypeStyles: Record<FormType, string> = {
  survey: 'bg-indigo-500/15 text-indigo-400',
  vote: 'bg-pink-500/15 text-pink-400',
  rating: 'bg-cyan-500/15 text-cyan-400',
  collection: 'bg-green-500/15 text-green-400',
  feedback: 'bg-amber-500/15 text-amber-400',
}

/** 表单类型名称 */
const formTypeNames: Record<FormType, string> = {
  survey: '问卷',
  vote: '投票',
  rating: '评分',
  collection: '信息收集',
  feedback: '反馈表',
}

// ============================================
// Icons
// ============================================

function FileSearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}

function VoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function RatingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CollectionIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <path d="M12 18h2" />
      <path d="M8 18h2" />
      <path d="M16 18h2" />
      <path d="M12 14h2" />
      <path d="M8 14h2" />
      <path d="M16 14h2" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// ============================================
// Form Card Component
// ============================================

export function FormCard({
  form,
  compact = false,
  onClick,
  onEdit,
  onShare,
  onAnalyze,
  onDelete,
  onCycleStatus,
  showDelete = true,
  className,
}: FormCardProps) {
  const handleAction = (e: React.MouseEvent, handler?: (e: React.MouseEvent) => void) => {
    e.preventDefault()
    e.stopPropagation()
    handler?.(e)
  }

  const timeAgo = formatDistanceToNow(new Date(form.updated_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const responseText = form.type === 'vote' ? '投票' : '回复'

  return (
    <div
      className={cn(
        'glass-card',
        'flex items-center gap-5',
        'transition-all duration-300',
        'hover:border-indigo-500/30',
        !compact && 'hover:translate-x-1',
        'cursor-pointer',
        compact ? 'p-4' : 'p-5 sm:p-6',
        className
      )}
      onClick={onClick}
    >
      {/* 表单图标 */}
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
          formTypeStyles[form.type]
        )}
      >
        {formTypeIcons[form.type]}
      </div>

      {/* 表单信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-full bg-white/5">
            {formTypeNames[form.type]}
          </span>
          {form.status === 'published' && (
            <span className="text-xs font-medium text-green-400 px-2 py-0.5 rounded-full bg-green-500/10">
              已发布
            </span>
          )}
          {form.status === 'archived' && (
            <span className="text-xs font-medium text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-500/10">
              已归档
            </span>
          )}
          {form.status === 'draft' && (
            <span className="text-xs font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-full bg-white/5">
              草稿
            </span>
          )}
        </div>
        <h3 className="text-base font-medium text-[var(--text-primary)] truncate mb-2">
          {form.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            {form.response_count} {responseText}
          </span>
          <span className="flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5" />
            {timeAgo}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {onCycleStatus && (
          <button
            onClick={(e) => handleAction(e, onCycleStatus)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-amber-500/10 hover:border-amber-500/50 group"
            title="切换状态"
          >
            <Archive className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-amber-400 transition-colors" />
          </button>
        )}
        <button
          onClick={(e) => handleAction(e, onEdit)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:border-indigo-500/50 group"
          title="编辑"
        >
          <Edit className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
        </button>
        <button
          onClick={(e) => handleAction(e, onShare)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:border-indigo-500/50 group"
          title="分享"
        >
          <Share2 className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
        </button>
        <button
          onClick={(e) => handleAction(e, onAnalyze)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:border-indigo-500/50 group"
          title="分析"
        >
          <BarChart3 className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
        </button>
        {showDelete && (
          <button
            onClick={(e) => handleAction(e, onDelete)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/50 group"
            title="删除"
          >
            <Trash2 className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-red-400 transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Form Card Skeleton (加载状态)
// ============================================

interface FormCardSkeletonProps {
  /** 数量 */
  count?: number
  /** 是否紧凑模式 */
  compact?: boolean
}

export function FormCardSkeleton({ count = 1, compact = false }: FormCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'glass-card',
            'flex items-center gap-5',
            compact ? 'p-4' : 'p-5 sm:p-6'
          )}
        >
          {/* 图标骨架 */}
          <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />

          {/* 信息骨架 */}
          <div className="flex-1 min-w-0">
            <div className="h-4 w-20 bg-white/5 rounded-full mb-2 animate-pulse" />
            <div className="h-5 w-48 bg-white/5 rounded-full mb-2 animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-white/5 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 按钮骨架 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </>
  )
}
