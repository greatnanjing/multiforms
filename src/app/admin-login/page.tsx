/* ============================================
   MultiForms Admin Login Page

   管理员登录页面：
   - 紫色渐变主题（区别于普通用户登录）
   - 管理员权限验证
   - 登录后跳转到 /admin/dashboard
   - 非管理员用户显示清晰错误和倒计时跳转

   路径: /admin-login
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Info } from 'lucide-react'
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

  // 权限不足状态
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const hasRedirectedRef = useRef(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  // 倒计时跳转
  useEffect(() => {
    if (permissionDenied && countdown > 0 && !hasRedirectedRef.current) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      // 跳转到 dashboard（用户已登录）而不是 login
      router.push('/dashboard')
    }
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [permissionDenied, countdown, router])

  // 清理状态
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [])

  // 检查已登录用户的权限
  useEffect(() => {
    const checkExistingUserPermission = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // 用户已登录，检查角色
          let isAdmin = false
          let userRole: string | null = null

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()

            userRole = profile?.role || null
            isAdmin = profile?.role === 'admin'
          } catch (err) {
            const userMetadata = session.user.user_metadata
            userRole = userMetadata?.role || null
            isAdmin = userMetadata?.role === 'admin'
          }

          if (!isAdmin) {
            // 非管理员已登录，显示权限提示
            setPermissionDenied(true)
            if (userRole === 'creator') {
              setAuthError('您的账号是「创作者」，无法访问管理后台。创作者请前往用户中心。')
            } else if (userRole === 'guest') {
              setAuthError('您的账号是「访客」，无法访问管理后台。访客请前往用户中心。')
            } else {
              setAuthError('您的账号没有管理员权限，无法访问管理后台。')
            }
          } else {
            // 已是管理员，直接跳转到管理后台
            router.replace('/admin/dashboard')
          }
        }
      } catch (error) {
        console.error('Error checking existing user:', error)
      }
    }

    checkExistingUserPermission()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setPermissionDenied(false)
    setCountdown(30)
    hasRedirectedRef.current = false

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

      console.log('[AdminLogin] Attempting login for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[AdminLogin] Login response:', { error, hasUser: !!data?.user })

      if (error) {
        console.error('[AdminLogin] Login error:', error)
        handleAuthError(error)
        setIsLoading(false)
        return
      }

      // 存储记住我偏好
      if (rememberMe) {
        // 记住我：移除临时会话标记
        sessionStorage.removeItem('temp_session')
        localStorage.removeItem('was_temp_session')
      } else {
        // 不记住我：标记为临时会话
        sessionStorage.setItem('temp_session', 'true')
        localStorage.setItem('was_temp_session', 'true')
      }

      // 检查用户角色是否为管理员
      let isAdmin = false
      let userRole: string | null = null

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        userRole = profile?.role || null
        isAdmin = profile?.role === 'admin'
      } catch (err) {
        // 如果 profiles 表不存在，检查用户元数据中的角色
        const userMetadata = data.user.user_metadata
        userRole = userMetadata?.role || null
        isAdmin = userMetadata?.role === 'admin'
      }

      if (!isAdmin) {
        // 不调用 signOut()，因为会触发 auth-provider 的 SIGNED_OUT 事件导致立即跳转
        // 让用户自己决定去向，保持 session 以便在其他页面使用
        setIsLoading(false)

        // 显示权限不足提示
        setPermissionDenied(true)

        // 根据用户角色显示不同的错误信息
        if (userRole === 'creator') {
          setAuthError('您的账号是「创作者」，无法访问管理后台。创作者请前往用户中心。')
        } else if (userRole === 'guest') {
          setAuthError('您的账号是「访客」，无法访问管理后台。访客请前往用户中心。')
        } else {
          setAuthError('您的账号没有管理员权限，无法访问管理后台。')
        }
        return
      }

      // 登录成功，先设置 loading 为 false
      setIsLoading(false)

      // 使用 window.location.href 确保强制跳转
      window.location.href = '/admin/dashboard'
    } catch (error) {
      setAuthError('登录失败，请稍后重试')
      console.error('Admin login error:', error)
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

  // 处理登出后清理表单（当"记住我"未勾选时）
  useEffect(() => {
    const checkAndCleanForm = async () => {
      // 如果之前有临时会话标记但现在没有会话，说明已登出
      const wasTempSession = localStorage.getItem('was_temp_session')

      if (wasTempSession) {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            // 已登出且之前是临时会话，清理表单和标记
            setEmail('')
            setPassword('')
            setRememberMe(true) // 重置为默认勾选
            setPermissionDenied(false)
            setAuthError(null)
            localStorage.removeItem('was_temp_session')
          }
        } catch (error) {
          console.error('Error checking session:', error)
        }
      }
    }

    checkAndCleanForm()

    // 监听 storage 事件（其他标签页登出时同步清理）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase-auth-token' && !e.newValue) {
        checkAndCleanForm()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

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
          {authError && !permissionDenied && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 text-center">{authError}</p>
            </div>
          )}

          {/* 权限不足提示 */}
          {permissionDenied && (
            <div className="mb-5 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-400 font-medium mb-2">权限不足</p>
                  <p className="text-xs text-orange-300/80 mb-3">{authError}</p>
                  <div className="flex items-center gap-2 text-xs text-orange-300/60 bg-orange-500/5 rounded-lg p-2">
                    <Info className="w-3.5 h-3.5" />
                    <span>
                      {countdown > 0
                        ? `将在 ${countdown} 秒后跳转到用户中心...`
                        : '正在跳转...'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      hasRedirectedRef.current = true
                      router.push('/dashboard')
                    }}
                    className="mt-3 w-full py-2.5 px-4 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    前往用户中心 →
                  </button>
                </div>
              </div>
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
                  disabled={isLoading || permissionDenied}
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
                  disabled={isLoading || permissionDenied}
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
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || permissionDenied}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-[var(--bg-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
