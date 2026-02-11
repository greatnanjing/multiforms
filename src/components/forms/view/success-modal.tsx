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
      // Get computed styles for the modal
      const rect = modal.getBoundingClientRect()
      const scaleX = 2 // Retina/High-DPI scaling
      const scaleY = 2

      // Create canvas with scaling
      const canvas = document.createElement('canvas')
      canvas.width = rect.width * scaleX
      canvas.height = rect.height * scaleY
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Scale context for high DPI
      ctx.scale(scaleX, scaleY)

      // Get CSS variable values
      const computedStyle = getComputedStyle(document.body)
      const bgSecondary = computedStyle.getPropertyValue('--bg-secondary').trim() || '#1A1A2E'
      const textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#F8FAFC'
      const textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#94A3B8'
      const textMuted = computedStyle.getPropertyValue('--text-muted').trim() || '#64748B'
      const primaryGlow = computedStyle.getPropertyValue('--primary-glow').trim() || '#A78BFA'

      // Draw background
      ctx.fillStyle = bgSecondary
      ctx.roundRect(0, 0, rect.width, rect.height, 16)
      ctx.fill()

      // Draw green success icon circles
      const iconX = rect.width / 2
      const iconY = 80

      // Outer circle
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
      ctx.beginPath()
      ctx.arc(iconX, iconY, 40, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      const gradient = ctx.createLinearGradient(iconX - 28, iconY - 28, iconX + 28, iconY + 28)
      gradient.addColorStop(0, '#22C55E')
      gradient.addColorStop(1, '#10B981')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(iconX, iconY, 28, 0, Math.PI * 2)
      ctx.fill()

      // Draw checkmark
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(iconX - 8, iconY)
      ctx.lineTo(iconX - 2, iconY + 6)
      ctx.lineTo(iconX + 8, iconY - 6)
      ctx.stroke()

      // Draw title
      ctx.fillStyle = textPrimary
      ctx.font = '600 24px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(message, rect.width / 2, 160)

      // Draw subtitle
      ctx.fillStyle = textSecondary
      ctx.font = '400 14px "DM Sans", sans-serif'
      ctx.fillText('感谢您的参与，您的回答已成功提交。', rect.width / 2, 185)

      let currentY = 210

      // Draw AI analysis if present
      if (aiAnalysis && aiAnalysis !== undefined && aiAnalysis !== null) {
        // AI section background
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
        ctx.roundRect(24, currentY, rect.width - 48, 0, 12)
        const aiBoxHeight = Math.max(80, aiAnalysis.length * 3.5 + 50)
        ctx.roundRect(24, currentY, rect.width - 48, aiBoxHeight, 12)
        ctx.fill()

        // AI header with icon
        ctx.fillStyle = '#818CF8'
        ctx.font = '500 14px "DM Sans", sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('✨ AI 分析', 44, currentY + 30)

        // AI analysis text (word wrap)
        ctx.fillStyle = textPrimary
        ctx.font = '400 14px "DM Sans", sans-serif'
        const maxWidth = rect.width - 96
        const words = aiAnalysis.split('')
        let line = ''
        let textY = currentY + 55

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i]
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 44, textY)
            line = words[i]
            textY += 22
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, 44, textY)

        currentY += aiBoxHeight + 20
      }

      // Draw buttons
      const buttonY = currentY + 10
      const buttonWidth = rect.width / 2 - 24

      // Close button
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.roundRect(24, buttonY, buttonWidth, 48, 12)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = textSecondary
      ctx.font = '500 14px "DM Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('关闭', 24 + buttonWidth / 2, buttonY + 29)

      // View Results button (if shown)
      if (showResults) {
        const buttonGradient = ctx.createLinearGradient(rect.width / 2 + 36, buttonY, rect.width - 24 + 36, buttonY)
        buttonGradient.addColorStop(0, '#6366F1')
        buttonGradient.addColorStop(1, '#8B5CF6')
        ctx.fillStyle = buttonGradient
        ctx.roundRect(rect.width / 2 + 12, buttonY, buttonWidth, 48, 12)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('👁 查看结果', rect.width / 2 + 12 + buttonWidth / 2, buttonY + 29)
      }

      // Draw footer
      const footerY = buttonY + 80
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.beginPath()
      ctx.moveTo(24, footerY)
      ctx.lineTo(rect.width - 24, footerY)
      ctx.stroke()

      ctx.fillStyle = textMuted
      ctx.font = '400 12px "DM Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`由 ${primaryGlow === '#A78BFA' ? '' : ''}MultiForms 提供支持`, rect.width / 2, footerY + 24)

      // Convert to blob and copy
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          setIsCopying(false)
          return
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error('Clipboard write failed:', err)
          // Download as fallback
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `multiforms-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
        setIsCopying(false)
      }, 'image/png')
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      setIsCopying(false)
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Background overlay - clicks here close the modal */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 opacity-100"
        onClick={handleClose}
      />

      {/* Modal content container - no onClick to prevent interference */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/0.08] p-8 text-center transition-all duration-300 transform pointer-events-auto"
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
