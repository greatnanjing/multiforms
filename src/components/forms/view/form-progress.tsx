/* ============================================
   MultiForms Form Progress Component

   进度条组件（公开填写页-单页滚动模式）：
   - 已完成必填题数/总必填题数
   - 固定底部提交按钮
   - 进度条显示
============================================ */

'use client'

import { cn } from '@/lib/utils'
import { Loader2, Check } from 'lucide-react'

// ============================================
// Types
// ============================================

interface FormProgressProps {
  /** 已完成必填题数 */
  answeredCount: number
  /** 总必填题数 */
  requiredCount: number
  /** 总题数 */
  totalQuestions: number
  /** 是否正在提交 */
  isSubmitting?: boolean
  /** 提交回调 */
  onSubmit?: () => void
  /** 额外的类名 */
  className?: string
}

// ============================================
// Main Component
// ============================================

export function FormProgress({
  answeredCount,
  requiredCount,
  totalQuestions,
  isSubmitting = false,
  onSubmit,
  className,
}: FormProgressProps) {
  // 计算进度百分比
  const progressPercent = requiredCount > 0 ? Math.round((answeredCount / requiredCount) * 100) : 100
  const isComplete = answeredCount >= requiredCount

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-[rgba(15,15,35,0.95)] backdrop-blur-xl',
        'border-t border-white/[0.08]',
        'px-4 sm:px-6 py-4',
        className
      )}
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress Info and Submit Button */}
        <div className="flex items-center justify-between gap-4">
          {/* Progress Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">
                {isComplete ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    已完成所有必填题
                  </span>
                ) : (
                  `已完成 ${answeredCount}/${requiredCount} 道必填题`
                )}
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {progressPercent}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300 ease-out',
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
              'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5',
              'disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0',
              'whitespace-nowrap'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span>提交表单</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
