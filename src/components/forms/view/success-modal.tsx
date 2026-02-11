/* ============================================
   MultiForms Success Modal Component

   提交成功弹窗组件：
   - 成功动画
   - 提示消息
   - AI 智能分析展示
   - 查看结果按钮（如果允许）
   - 截图复制功能
============================================ */

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Eye, X, Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { domToPng } from 'modern-screenshot'

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
  /** AI 分析结果（null=加载中，undefined=不支持分析，空字符串=失败/无结果） */
  aiAnalysis?: string | null | undefined
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
  aiAnalysis = null,
  message = '提交成功！',
  onClose,
}: SuccessModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
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

  const handleCopyScreenshot = async () => {
    const modal = modalRef.current
    if (!modal || isCopying) return

    setIsCopying(true)

    try {
      // 使用 modern-screenshot 库，它对现代 CSS（如 oklab）有更好的支持
      // 从 CSS 变量获取背景色以支持主题
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-secondary')?.trim() || '#1A1A2E'

      const dataUrl = await domToPng(modal, {
        scale: 2,
        backgroundColor,
      })

      // 将 dataUrl 转换为 blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Screenshot failed:', err)
    } finally {
      // 无论成功或失败，都要重置 isCopying 状态
      setIsCopying(false)
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Background overlay - 只显示遮罩，不允许点击关闭 */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 opacity-100 pointer-events-none"
      />

      {/* Modal content container - 只能通过 X 按钮或关闭按钮关闭 */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          data-screenshot="true"
          className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/0.08 p-8 text-center transition-all duration-300 transform pointer-events-auto"
        >
          {/* Header Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Copy Screenshot Button */}
            <button
              type="button"
              onClick={handleCopyScreenshot}
              disabled={isCopying}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              title={copied ? '已复制！' : '复制截图'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className={isCopying ? 'animate-pulse' : 'w-4 h-4'} />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Icon with Animation */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center transition-all duration-500">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white transition-all duration-500 delay-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            {message}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            感谢您的参与，您的回答已成功提交。
          </p>

          {/* AI Analysis Section */}
          {aiAnalysis !== undefined && (
            <div className="mb-6">
              {aiAnalysis === null ? (
                /* Loading state */
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>AI 正在分析您的回答...</span>
                  </div>
                </div>
              ) : aiAnalysis ? (
                /* Analysis result */
                <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300">AI 分析</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {aiAnalysis}
                  </p>
                </div>
              ) : (
                /* Analysis failed or timed out */
                <div className="rounded-xl bg-white/5 border border-white/0.08 p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-sm font-medium text-[var(--text-muted)]">AI 分析</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    分析暂时不可用
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:bg-white/10 hover:text-[var(--text-primary)]"
            >
              关闭
            </button>

            {showResults && (
              <button
                type="button"
                onClick={handleViewResults}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <Eye className="w-4 h-4" />
                查看结果
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/0.08">
            <p className="text-xs text-[var(--text-muted)]">
              由 <span className="text-[var(--primary-glow)]">MultiForms</span> 提供支持
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
