/* ============================================
   MultiForms Login Page

   登录页面：
   - 居中玻璃态卡片布局
   - 邮箱/密码表单（带验证）
   - 密码显示/隐藏切换
   - 社交登录按钮（暂时禁用）
   - 忘记密码/注册链接
   - 错误提示显示

   路径: /login
============================================ */

'use client'

// Force dynamic rendering to prevent build-time Supabase errors
// This page needs to access Supabase which requires runtime env vars
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================
// Validation Functions
// ============================================

function validateEmail(email: string): string | null {
  if (!email) return '请输入邮箱'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return '请输入密码'
  if (password.length < 6) return '密码至少需要6个字符'
  return null
}

// ============================================
// Login Page Component
// ============================================

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // Validate
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    const errors: { email?: string; password?: string } = {}
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        handleAuthError(error)
        return
      }

      // 登录成功，跳转到仪表盘
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setAuthError('登录失败，请稍后重试')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (error: { message?: string; status?: number }) => {
    if (error.message?.includes('Invalid login credentials')) {
      setAuthError('邮箱或密码错误')
    } else if (error.message?.includes('Email not confirmed')) {
      setAuthError('请先验证您的邮箱')
    } else {
      setAuthError(error.message || '登录失败，请稍后重试')
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'wechat') => {
    setAuthError(`${provider === 'google' ? 'Google' : '微信'}登录功能暂未开放`)
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
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 25%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 25%)
            `,
            animation: 'float 20s ease-in-out infinite',
          }}
        />
      </div>

      {/* 浮动动画样式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(5deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(-5deg);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="glass-card p-10 sm:p-12 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-white"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white text-center mb-2">
              欢迎回来
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              登录 MultiForms 开始创作
            </p>
          </div>

          {/* 错误提示 */}
          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 text-center">{authError}</p>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 邮箱输入 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined })
                  }}
                  autoComplete="email"
                  placeholder="请输入邮箱"
                  className={cn(
                    'w-full px-4 py-3.5 pl-12',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'bg-[rgba(255,255,255,0.05)]',
                    'border border-[var(--input-border)] rounded-xl',
                    'outline-none transition-all duration-200',
                    'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                    fieldErrors.email && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                  )}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
                密码
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
                  autoComplete="current-password"
                  placeholder="请输入密码"
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

            {/* 忘记密码链接 */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-glow)] transition-colors"
              >
                忘记密码？
              </a>
            </div>

            {/* 登录按钮 */}
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
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-[var(--text-muted)]">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 社交登录 */}
          <div className="flex justify-center gap-4">
            {/* 微信登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('wechat')}
              disabled
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/10 hover:border-[var(--primary-start)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="微信登录"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-[var(--text-secondary)]"
              >
                <path d="M8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-7 4.5c-2.485 0-4.5-1.57-4.5-3.5S4.015 8.5 6.5 8.5 11 10.07 11 12s-2.015 3.5-4.5 3.5zM8.5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6.5 10.5c-1.93 0-3.5-1.12-3.5-2.5s1.57-2.5 3.5-2.5 3.5 1.12 3.5 2.5-1.57 2.5-3.5 2.5zM15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              </svg>
            </button>

            {/* Google 登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/10 hover:border-[var(--primary-start)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Google 登录"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>
          </div>

          {/* 底部注册链接 */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              还没有账号？{' '}
              <a
                href="/register"
                className="text-[var(--primary-glow)] font-medium hover:underline"
              >
                立即注册
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
