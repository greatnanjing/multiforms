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

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Github } from 'lucide-react'
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
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 获取登录后要跳转的路径
  const returnTo = searchParams.get('returnTo')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
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

      // 登录成功，等待一小段时间让 auth provider 检测到会话变化
      // auth provider 会在 SIGNED_IN 事件中处理重定向
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证重定向路径是否安全（防止开放重定向漏洞）
      // 使用白名单方式，只允许特定的安全路径
      const validRedirectPaths = [
        '/dashboard',
        '/dashboard/',
        '/forms',
        '/forms/',
        '/settings',
        '/settings/',
      ]

      const isValidRedirect = (path: string | null): boolean => {
        if (!path) return false
        try {
          const decoded = decodeURIComponent(path)
          // 检查是否在白名单中（以允许的路径开头）
          return validRedirectPaths.some(allowed =>
            decoded === allowed || decoded.startsWith(allowed)
          )
        } catch {
          return false
        }
      }

      // 检查会话是否已建立
      const { data: { session } } = await supabase.auth.getSession()
      const redirectPath = isValidRedirect(returnTo) ? decodeURIComponent(returnTo!) : '/dashboard'

      if (session) {
        router.replace(redirectPath)
      } else {
        // 如果会话还没建立，等待 auth provider 处理
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('[Login] Unexpected error:', error)
      // 检测网络错误
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
          setAuthError('网络连接失败，请检查浏览器代理设置')
        } else {
          setAuthError(`登录失败: ${error.message}`)
        }
      } else {
        setAuthError('登录失败，请稍后重试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (error: { message?: string; status?: number }) => {
    if (error.message?.includes('Invalid login credentials')) {
      setAuthError('邮箱或密码错误')
    } else if (error.message?.includes('Email not confirmed')) {
      setAuthError('请先验证您的邮箱')
    } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('timeout')) {
      setAuthError('网络连接失败，请检查浏览器代理设置')
    } else {
      setAuthError(error.message || '登录失败，请稍后重试')
    }
  }

  const handleSocialLogin = async (provider: 'github') => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            skip_http_redirect: 'true'
          }
        }
      })

      if (error) {
        setAuthError(`GitHub登录失败: ${error.message}`)
      }
      // OAuth 会自动重定向，不需要手动处理
    } catch (error) {
      console.error('[GitHub Login] Error:', error)
      setAuthError('GitHub登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
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
    <div className="h-full flex items-center justify-center px-6 pt-16 bg-[var(--bg-primary)] relative overflow-hidden">
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
        <div className="glass-card p-6 sm:p-8 shadow-2xl max-h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
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
            <h1 className="text-xl font-semibold text-white text-center mb-2">
              欢迎回来
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              登录 MultiForms 开始创作
            </p>
          </div>

          {/* 错误提示 */}
          {authError && (
            <div className={`mb-5 p-3 rounded-lg flex items-start gap-2 ${
              authError.includes('网络') || authError.includes('代理')
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                authError.includes('网络') || authError.includes('代理')
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`} />
              <p className={`text-sm flex-1 ${
                authError.includes('网络') || authError.includes('代理')
                  ? 'text-yellow-200'
                  : 'text-red-400'
              }`}>
                {authError}
                {(authError.includes('网络') || authError.includes('代理')) && (
                  <span className="block mt-1 text-xs opacity-80">
                    请确保浏览器已配置代理（Clash/V2Ray 系统代理模式或浏览器代理扩展）
                  </span>
                )}
              </p>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 邮箱输入 */}
            <div className="flex flex-col gap-1.5">
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
                    'w-full px-4 py-3 pl-12',
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
            <div className="flex flex-col gap-1.5">
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
                    'w-full px-4 py-3 pl-12 pr-12',
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

            {/* 记住我 & 忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--primary-start)] focus:ring-2 focus:ring-[var(--primary-start)] focus:ring-offset-0 focus:ring-offset-[var(--bg-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  记住我
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-glow)] transition-colors"
              >
                忘记密码？
              </a>
            </div>

            {/* 登录按钮 */}
            <div className="ml-8 mr-8">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3',
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
            </div>
          </form>

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-[var(--text-muted)]">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 社交登录 */}
          <div className="flex justify-center gap-4">
            {/* GitHub 登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/10 hover:border-[var(--primary-start)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="GitHub 登录"
            >
              <Github className="w-6 h-6 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* 底部注册链接 */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
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
