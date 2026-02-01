/* ============================================
   MultiForms Reset Password Page

   重置密码页面：
   - 通过邮件链接访问
   - 设置新密码

   路径: /reset-password
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================
// Validation Functions
// ============================================

function validatePassword(password: string): string | null {
  if (!password) return '请输入新密码'
  if (password.length < 6) return '密码至少需要6个字符'
  return null
}

function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return '请确认新密码'
  if (password !== confirm) return '两次输入的密码不一致'
  return null
}

// ============================================
// Reset Password Page Component
// ============================================

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirm?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(password, confirmPassword)

    const errors: { password?: string; confirm?: string } = {}
    if (passwordError) errors.password = passwordError
    if (confirmError) errors.confirm = confirmError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message || '密码重置失败')
        return
      }

      setSuccess(true)
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setError('密码重置失败，请稍后重试')
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
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white text-center mb-2">
              {success ? '密码已重置' : '设置新密码'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              {success
                ? '正在跳转到登录页...'
                : '请输入您的新密码'}
            </p>
          </div>

          {/* 成功提示 */}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-[var(--text-primary)]">
                密码重置成功
              </p>
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
                {/* 新密码输入 */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
                    新密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined })
                      }}
                      autoComplete="new-password"
                      placeholder="请输入新密码（至少6个字符）"
                      className={cn(
                        'w-full px-4 py-3.5 pl-12 pr-12',
                        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                        'bg-[rgba(255,255,255,0.05)]',
                        'border border-[var(--input-border)] rounded-xl',
                        'outline-none transition-all duration-200',
                        'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                        fieldErrors.password && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* 确认密码输入 */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm" className="text-sm font-medium text-[var(--text-primary)]">
                    确认新密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      id="confirm"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (fieldErrors.confirm) setFieldErrors({ ...fieldErrors, confirm: undefined })
                      }}
                      autoComplete="new-password"
                      placeholder="请再次输入新密码"
                      className={cn(
                        'w-full px-4 py-3.5 pl-12 pr-12',
                        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                        'bg-[rgba(255,255,255,0.05)]',
                        'border border-[var(--input-border)] rounded-xl',
                        'outline-none transition-all duration-200',
                        'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                        fieldErrors.confirm && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirm && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.confirm}</p>
                  )}
                </div>

                {/* 提交按钮 */}
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
                      重置中...
                    </span>
                  ) : (
                    '重置密码'
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
