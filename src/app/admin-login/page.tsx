/* ============================================
   MultiForms Admin Login Page

   管理员登录页面：
   - 紫色渐变主题（区别于普通用户登录）
   - 管理员权限验证
   - 登录后跳转到 /admin/dashboard

   路径: /admin-login
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
// Admin Login Page Component
// ============================================

export default function AdminLoginPage() {
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        handleAuthError(error)
        return
      }

      // 检查用户角色是否为管理员
      let isAdmin = false
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        isAdmin = profile?.role === 'admin'
      } catch (err) {
        // 如果 profiles 表不存在，检查用户元数据中的角色
        const userMetadata = data.user.user_metadata
        isAdmin = userMetadata?.role === 'admin'
      }

      if (!isAdmin) {
        await supabase.auth.signOut()
        setAuthError('此账号没有管理员权限')
        return
      }

      // 登录成功，跳转到管理仪表盘
      router.push('/admin/dashboard')
      router.refresh()
    } catch (error) {
      setAuthError('登录失败，请稍后重试')
      console.error('Admin login error:', error)
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

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* 背景渐变效果 - 紫色主题 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            var(--bg-primary)
          `,
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div
          className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%]"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 25%),
              radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 25%)
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
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="p-10 sm:p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl bg-gradient-to-br from-purple-900/30 to-violet-900/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-center mb-2">
              管理后台
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              使用管理员账号登录
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
              <label htmlFor="admin-email" className="text-sm font-medium text-[var(--text-primary)]">
                管理员邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined })
                  }}
                  autoComplete="email"
                  placeholder="请输入管理员邮箱"
                  className={cn(
                    'w-full px-4 py-3.5 pl-12',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'bg-white/5',
                    'border border-white/10 rounded-xl',
                    'outline-none transition-all duration-200',
                    'focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]',
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
              <label htmlFor="admin-password" className="text-sm font-medium text-[var(--text-primary)]">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
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
                    'bg-white/5',
                    'border border-white/10 rounded-xl',
                    'outline-none transition-all duration-200',
                    'focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]',
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

            {/* 记住我 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="admin-remember"
                defaultChecked={true}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-[var(--bg-primary)] transition-all"
              />
              <label htmlFor="admin-remember" className="text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                记住我
              </label>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-4 mt-2',
                'text-base font-semibold text-white',
                'bg-gradient-to-r from-purple-500 to-pink-500',
                'rounded-xl',
                'shadow-lg shadow-purple-500/30',
                'transition-all duration-250',
                'hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-500/40',
                'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 spin" />
                  登录中...
                </span>
              ) : (
                '管理员登录'
              )}
            </button>
          </form>

          {/* 返回首页链接 */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
