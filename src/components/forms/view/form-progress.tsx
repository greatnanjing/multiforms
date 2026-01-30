/* ============================================
   MultiForms Form Progress Component

   进度条组件（公开填写页）：
   - 当前题数/总题数
   - 上一步/下一步/提交按钮
   - 进度点显示
============================================ */

'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, Loader2 } from 'lucide-react'

// ============================================
// Types
// ============================================

interface FormProgressProps {
  /** 当前题号（从1开始） */
  currentQuestion: number
  /** 总题数 */
  totalQuestions: number
  /** 是否在第一页 */
  isFirstPage?: boolean
  /** 是否在最后一页 */
  isLastPage?: boolean
  /** 是否正在提交 */
  isSubmitting?: boolean
  /** 上一步回调 */
  onPrevious?: () => void
  /** 提交回调 */
  onSubmit?: () => void
  /** 额外的类名 */
  className?: string
}

// ============================================
// Main Component
// ============================================

export function FormProgress({
  currentQuestion,
  totalQuestions,
  isFirstPage = false,
  isLastPage = false,
  isSubmitting = false,
  onPrevious,
  onSubmit,
  className,
}: FormProgressProps) {
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
        {/* Progress Info and Actions */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--text-secondary)]">
            第 {currentQuestion} 题，共 {totalQuestions} 题
          </span>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            {!isFirstPage && onPrevious && (
              <button
                type="button"
                onClick={onPrevious}
                disabled={isSubmitting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  'text-[var(--text-secondary)] bg-transparent border border-white/10',
                  'hover:text-[var(--text-primary)] hover:border-white/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">上一步</span>
              </button>
            )}

            {/* Submit Button */}
            <button
              type={isLastPage ? 'submit' : 'button'}
              onClick={isLastPage ? onSubmit : undefined}
              disabled={isSubmitting}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
                'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5',
                'disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <span>{isLastPage ? '提交' : '下一步'}</span>
                  {!isLastPage && <ChevronLeft className="w-4 h-4 rotate-180" />}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                'bg-white/10',
                index + 1 === currentQuestion && 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] shadow-[0_0_10px_rgba(99,102,241,0.5)]',
                index + 1 < currentQuestion && 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]'
              )}
              style={{ width: totalQuestions > 20 ? '8px' : '32px' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
