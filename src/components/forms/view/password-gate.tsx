/* ============================================
   MultiForms Password Gate Component

   密码保护验证组件：
   - 锁图标
   - 表单信息展示
   - 密码输入与验证
   - 错误提示
   - 剩余尝试次数显示
============================================ */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Form } from '@/types'

// ============================================
// Types
// ============================================

interface PasswordGateProps {
  form: Form
  /** 验证成功回调 */
  onSuccess?: () => void
}

// ============================================
// Main Component
// ============================================

export function PasswordGate({ form, onSuccess }: PasswordGateProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts] = useState(5)

  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Replace with actual API verification
      // For demo: use simple hash comparison
      const isCorrect = await verifyPassword(password, form.access_password)

      if (isCorrect) {
        // Store verification in session storage
        sessionStorage.setItem(`form_${form.short_id}_verified`, 'true')
        sessionStorage.setItem(`form_${form.short_id}_timestamp`, Date.now().toString())
        onSuccess?.()
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (newAttempts >= maxAttempts) {
          setError('尝试次数过多，请稍后再试')
        } else {
          setError(`密码错误，还有 ${maxAttempts - newAttempts} 次尝试机会`)
        }
        setPassword('')
        inputRef.current?.focus()
      }
    } catch (err) {
      setError('验证失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 密码验证函数
  // 注意：这使用简单的字符串比较，仅用于演示。
  // 生产环境应该使用 bcrypt 进行安全的密码哈希比较：
  // import bcrypt from 'bcryptjs'
  // return bcrypt.compare(input, storedHash)
  const verifyPassword = async (input: string, storedHash: string | null): Promise<boolean> => {
    if (!storedHash) return false

    // 简单的字符串比较（不安全，仅供演示）
    // 生产环境应该使用 bcrypt.compare(input, storedHash)
    return input === storedHash
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
      </div>

      {/* Gate Card */}
      <div className="relative w-full max-w-[440px]">
        {/* SVG Gradients for lock icon */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>

        <div className="p-6 sm:p-8 rounded-2xl border bg-[var(--bg-secondary)] border-white/[0.08]">
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center">
            <Lock className="w-9 h-9 text-[var(--primary-glow)]" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-2">
              此表单受密码保护
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              请输入密码以访问此表单
            </p>
          </div>

          {/* Form Info */}
          <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-white/5">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {form.title?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {form.title || '未命名表单'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                由 MultiForms 创建
              </p>
            </div>
          </div>

          {/* Attempts Warning */}
          {attempts > 0 && attempts < maxAttempts && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl border bg-amber-500/10 border-amber-500/30">
              <TriangleAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-400">
                您还有 {maxAttempts - attempts} 次尝试机会
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl border bg-red-500/10 border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              {/* Lock Icon */}
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>

              {/* Password Input */}
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                disabled={isSubmitting || attempts >= maxAttempts}
                className={cn(
                  'w-full px-12 py-4 text-base',
                  'bg-white/5 border-2 border-white/10 rounded-xl',
                  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:border-indigo-500 focus:bg-white/5',
                  'focus:ring-2 focus:ring-indigo-500/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              />

              {/* Toggle Password Visibility */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || attempts >= maxAttempts}
              className={cn(
                'w-full py-4 text-base font-medium rounded-xl',
                'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
                'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0',
                'transition-all duration-200'
              )}
            >
              {isSubmitting ? '验证中...' : '访问表单'}
            </button>
          </form>

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            忘记密码？
            <button
              type="button"
              className="text-[var(--primary-glow)] hover:underline ml-1"
              onClick={() => router.push('/')}
            >
              联系表单创建者
            </button>
          </p>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              由 <span className="text-[var(--primary-glow)]">MultiForms</span> 提供支持
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
