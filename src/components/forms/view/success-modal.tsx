/* ============================================
   MultiForms Success Modal Component

   提交成功弹窗组件：
   - 成功动画
   - 提示消息
   - 查看结果按钮（如果允许）
============================================ */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CheckCircle2, Eye, X } from 'lucide-react'

// ============================================
// Types
// ============================================

interface SuccessModalProps {
  /** 是否显示 */
  isOpen?: boolean
  /** 表单 short_id */
  shortId: string
  /** 是否允许查看结果 */
  showResults?: boolean
  /** 自定义消息 */
  message?: string
  /** 关闭回调 */
  onClose?: () => void
}

// ============================================
// Main Component
// ============================================

export function SuccessModal({
  isOpen = false,
  shortId,
  showResults = false,
  message = '提交成功！',
  onClose,
}: SuccessModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true)
      setTimeout(() => setShowContent(true), 100)
    }
  }, [isOpen])

  const handleClose = () => {
    setShowContent(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  const handleViewResults = () => {
    router.push(`/f/${shortId}/result`)
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm transition-all duration-300',
        showContent ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/[0.08]',
          'p-8 text-center transition-all duration-300 transform',
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className={cn(
            'w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20',
            'flex items-center justify-center',
            'transition-all duration-500',
            showContent ? 'scale-100' : 'scale-0'
          )}>
            <div className={cn(
              'w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500',
              'flex items-center justify-center text-white',
              'transition-all duration-500 delay-100',
              showContent ? 'scale-100' : 'scale-0'
            )}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          {message}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          感谢您的参与，您的回答已成功提交。
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClose}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
              'text-sm font-medium transition-all duration-200',
              'bg-white/5 text-[var(--text-secondary)] border border-white/10',
              'hover:bg-white/10 hover:text-[var(--text-primary)]'
            )}
          >
            关闭
          </button>

          {showResults && (
            <button
              onClick={handleViewResults}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                'text-sm font-medium transition-all duration-200',
                'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
                'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20'
              )}
            >
              <Eye className="w-4 h-4" />
              查看结果
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08]">
          <p className="text-xs text-[var(--text-muted)]">
            由 <span className="text-[var(--primary-glow)]">MultiForms</span> 提供支持
          </p>
        </div>
      </div>
    </div>
  )
}
