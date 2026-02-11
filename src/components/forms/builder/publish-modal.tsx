/* ============================================
   MultiForms Publish Modal Component

   发布模态框组件：
   - 显示表单链接（可复制）
   - 生成二维码
   - 社交分享按钮
   - 发布/取消发布状态切换
============================================ */

'use client'

import { useState, useEffect } from 'react'
import { X, Link2, Download, Check, Share2, Mail, MessageSquare, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import QRCode from 'qrcode'
import type { Form } from '@/types'

// ============================================
// Constants
// ============================================

const COPY_FEEDBACK_DURATION = 2000 // 2 seconds for copy feedback

// ============================================
// Types
// ============================================

interface PublishModalProps {
  /** 表单数据 */
  form: Form | null
  /** 是否显示 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 发布状态变更回调，返回新的 short_id */
  onPublishToggle: (publish: boolean) => Promise<string | undefined>
}

// ============================================
// Social Share Config
// ============================================

interface SocialShare {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  getShareUrl: (url: string, title: string) => string
}

const SOCIAL_SHARES: SocialShare[] = [
  {
    id: 'copy',
    name: '复制链接',
    icon: <Link2 className="w-5 h-5" />,
    color: 'hover:bg-indigo-500/20 text-indigo-400',
    getShareUrl: (url) => url,
  },
  {
    id: 'wechat',
    name: '微信',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'hover:bg-green-500/20 text-green-400',
    getShareUrl: (url) => url, // 微信需要特殊处理，显示二维码
  },
  {
    id: 'dingtalk',
    name: '钉钉',
    icon: <Share2 className="w-5 h-5" />,
    color: 'hover:bg-blue-500/20 text-blue-400',
    getShareUrl: (url, title) => `https://dingtalk://dingtalkclient/page/link?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'feishu',
    name: '飞书',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'hover:bg-purple-500/20 text-purple-400',
    getShareUrl: (url, title) => `https://open.feishu.cn/client/zh-cn/changelog?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'email',
    name: '邮件',
    icon: <Mail className="w-5 h-5" />,
    color: 'hover:bg-amber-500/20 text-amber-400',
    getShareUrl: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`请填写表单：${url}`)}`,
  },
]

// ============================================
// Main Component
// ============================================

export function PublishModal({ form, isOpen, onClose, onPublishToggle }: PublishModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [qrCopied, setQrCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublished = form?.status === 'published'
  const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${form?.short_id || ''}` : ''

  // Generate QR Code
  useEffect(() => {
    if (isOpen && formUrl && isPublished) {
      QRCode.toDataURL(formUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#6366F1',
          light: '#1A1A2E',
        },
      }).then(setQrCodeDataUrl).catch(console.error)
    }
  }, [isOpen, formUrl, isPublished])

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Download QR Code
  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return
    const link = document.createElement('a')
    link.download = `qrcode-${form?.short_id || 'form'}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  // Copy QR Code to clipboard
  const handleCopyQR = async () => {
    if (!qrCodeDataUrl) return
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setQrCopied(true)
      setTimeout(() => setQrCopied(false), COPY_FEEDBACK_DURATION)
    } catch (err) {
      console.error('Failed to copy QR code:', err)
    }
  }

  // Toggle publish status
  const handleTogglePublish = async () => {
    setIsPublishing(true)
    try {
      const newShortId = await onPublishToggle(!isPublished)

      // If just published and got a new short_id, generate QR code immediately
      if (!isPublished && newShortId) {
        const newUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/f/${newShortId}`
          : ''

        if (newUrl) {
          QRCode.toDataURL(newUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#6366F1',
              light: '#1A1A2E',
            },
          }).then(setQrCodeDataUrl).catch(console.error)
        }
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    } finally {
      setIsPublishing(false)
    }
  }

  // Handle social share click
  const handleSocialShare = (share: SocialShare) => {
    if (share.id === 'copy') {
      handleCopyLink()
    } else if (share.id === 'wechat') {
      // 微信分享需要显示二维码提示
      handleCopyLink()
    } else {
      window.open(share.getShareUrl(formUrl, form?.title || '表单'), '_blank')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {isPublished ? '已发布表单' : '发布表单'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isPublished ? '表单已发布，可以通过链接访问' : '发布后生成可分享的链接'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Publish Status Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublished ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    <div className={`w-3 h-3 rounded-full ${isPublished ? 'bg-green-400' : 'bg-[var(--text-muted)]'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {isPublished ? '已发布' : '未发布'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {isPublished ? '表单链接已生成，可正常访问' : '表单尚未发布，无法通过链接访问'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  type="button"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isPublished
                      ? 'bg-white/10 text-[var(--text-secondary)] hover:bg-white/20'
                      : 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-90',
                    isPublishing && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {isPublishing ? '处理中...' : isPublished ? '取消发布' : '发布表单'}
                </button>
              </div>

              {/* Published Content */}
              {isPublished && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Form Link */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      表单链接
                    </label>
                    <div className="flex items-center gap-2">
                      <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex-1 px-4 py-2.5 rounded-lg flex items-center gap-2',
                          'bg-white/5 border border-white/10',
                          'text-sm text-indigo-400 hover:text-indigo-300',
                          'hover:border-indigo-500/30 hover:bg-indigo-500/5',
                          'transition-all',
                          'cursor-pointer'
                        )}
                      >
                        <span className="truncate flex-1">{formUrl}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 flex-shrink-0">
                          访问
                        </span>
                      </a>
                      <button
                        onClick={handleCopyLink}
                        type="button"
                        className={cn(
                          'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                          copied
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                        )}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 inline mr-1" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 inline mr-1" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-[var(--text-secondary)]">
                        二维码
                      </label>
                      {qrCodeDataUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyQR}
                            type="button"
                            className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                              'text-xs font-medium transition-colors',
                              qrCopied
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                            )}
                          >
                            {qrCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Link2 className="w-3.5 h-3.5" />
                                复制
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleDownloadQR}
                            type="button"
                            className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                              'text-xs font-medium',
                              'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10',
                              'transition-colors'
                            )}
                          >
                            <Download className="w-3.5 h-3.5" />
                            下载
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      'flex items-center justify-center p-4 rounded-xl border border-dashed border-white/20',
                      qrCodeDataUrl ? 'bg-white/5' : 'bg-transparent'
                    )}>
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="表单二维码"
                          className="w-40 h-40 rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8">
                          <Share2 className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                          <p className="text-xs text-[var(--text-muted)]">生成中...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Share */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                      分享到
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SOCIAL_SHARES.map((share) => (
                        <button
                          key={share.id}
                          onClick={() => handleSocialShare(share)}
                          type="button"
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10',
                            'text-sm font-medium transition-all',
                            'bg-white/5',
                            share.color
                          )}
                          title={share.name}
                        >
                          {share.icon}
                          <span>{share.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2 px-1">
                      提示：微信分享请复制链接或截图二维码
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Unpublished Hint */}
              {!isPublished && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                    <Share2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      发布后即可分享
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      发布后会生成专属链接和二维码，可分享到任意平台
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
