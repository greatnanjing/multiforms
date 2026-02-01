/* ============================================
   MultiForms Forgot Password Page

   忘记密码页面：
   - 输入邮箱获取重置链接
   - 发送密码重置邮件

   路径: /forgot-password
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================
// Validation Function
// ============================================

function validateEmail(email: string): string | null {
  if (!email) return '请输入邮箱'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

// ============================================
// Forgot Password Page Component
// ============================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message || '发送重置邮件失败')
        return
      }

      setSuccess(true)
    } catch (error) {
      setError('发送重置邮件失败，请稍后重试')
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* 背景渐变效果 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            var(--bg-primary)
          `,
        }}
      />

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="glass-card p-10 sm:p-12 shadow-2xl">
          {/* 返回登录链接 */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-glow)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white text-center mb-2">
              忘记密码
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              {success
                ? '重置邮件已发送'
                : '输入您的邮箱，我们将发送密码重置链接'}
            </p>
          </div>

          {/* 成功提示 */}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-[var(--text-primary)] mb-2">
                邮件已发送至 {email}
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                请检查您的邮箱并点击链接重置密码
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 text-base font-semibold text-white bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-xl shadow-lg hover:shadow-xl transition-all duration-250"
              >
                返回登录
              </Link>
            </div>
          ) : (
            <>
              {/* 错误提示 */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* 邮箱输入 */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
                    邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="请输入您的邮箱"
                    className={cn(
                      'w-full px-4 py-3.5',
                      'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                      'bg-[rgba(255,255,255,0.05)]',
                      'border border-[var(--input-border)] rounded-xl',
                      'outline-none transition-all duration-200',
                      'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
                    )}
                    disabled={isLoading}
                  />
                </div>

                {/* 发送按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full py-4 mt-2',
                    'text-base font-semibold text-white',
                    'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]',
                    'rounded-xl',
                    'shadow-[0_4px_20px_rgba(99,102,241,0.3)]',
                    'transition-all duration-250',
                    'hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]',
                    'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 spin" />
                      发送中...
                    </span>
                  ) : (
                    '发送重置邮件'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* 浮动动画样式 */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  )
}
