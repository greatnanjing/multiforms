/* ============================================
   MultiForms Register Page

   注册页面：
   - 居中玻璃态卡片布局
   - 姓名/邮箱/密码/确认密码表单
   - 密码强度指示器
   - 服务条款勾选框
   - 注册成功后自动登录并跳转

   路径: /register
============================================ */

'use client'

// Force dynamic rendering to prevent build-time Supabase errors
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, Github } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ============================================
// Password Strength Calculation
// ============================================

type PasswordStrength = 'weak' | 'medium' | 'strong'

function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak'

  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return '弱'
    case 'medium': return '中'
    case 'strong': return '强'
  }
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return '#EF4444'
    case 'medium': return '#F59E0B'
    case 'strong': return '#10B981'
  }
}

function getStrengthWidth(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return '33%'
    case 'medium': return '66%'
    case 'strong': return '100%'
  }
}

// ============================================
// Validation Functions
// ============================================

function validateName(name: string): string | null {
  if (!name) return '请输入姓名'
  if (name.length < 2) return '姓名至少需要2个字符'
  if (name.length > 50) return '姓名不能超过50个字符'
  return null
}

function validateEmail(email: string): string | null {
  if (!email) return '请输入邮箱'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return '请输入密码'
  if (password.length < 8) return '密码至少需要8个字符'
  if (password.length > 100) return '密码不能超过100个字符'
  return null
}

function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return '请确认密码'
  if (password !== confirmPassword) return '两次输入的密码不一致'
  return null
}

// ============================================
// Register Page Component
// ============================================

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const passwordStrength = calculatePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // Validate all fields
    const errors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(password, confirmPassword)

    if (nameError) errors.name = nameError
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    if (confirmError) errors.confirmPassword = confirmError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const supabase = createClient()

      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        handleAuthError(error)
        return
      }

      // 注册成功
      setRegisterSuccess(true)

      // 如果不需要邮箱验证，自动登录
      if (data.session) {
        // 已自动登录，延迟跳转
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      } else {
        // 需要邮箱验证
        setTimeout(() => {
          router.push('/login?message=请检查您的邮箱以验证账号')
        }, 2000)
      }
    } catch (error) {
      setAuthError('注册失败，请稍后重试')
      console.error('Register error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthError = (error: { message?: string; status?: number }) => {
    if (error.message?.includes('User already registered')) {
      setAuthError('该邮箱已被注册，请直接登录')
    } else if (error.message?.includes('Invalid email')) {
      setAuthError('邮箱格式不正确')
    } else if (error.message?.includes('Password should be at least')) {
      setAuthError('密码长度不足')
    } else {
      setAuthError(error.message || '注册失败，请稍后重试')
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

  // 注册成功状态
  if (registerSuccess) {
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

        <div className="relative z-10 w-full max-w-[400px]">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              注册成功！
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              正在为您跳转到仪表盘...
            </p>
          </div>
        </div>
      </div>
    )
  }

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

      {/* 注册卡片 */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="glass-card p-5 sm:p-6 shadow-2xl max-h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center mb-3 shadow-lg">
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
              创建账号
            </h1>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              开始使用 MultiForms
            </p>
          </div>

          {/* 错误提示 */}
          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 text-center">{authError}</p>
            </div>
          )}

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* 姓名输入 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined })
                  }}
                  autoComplete="name"
                  placeholder="请输入您的姓名"
                  className={cn(
                    'w-full px-4 py-2.5 pl-12',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'bg-[rgba(255,255,255,0.05)]',
                    'border border-[var(--input-border)] rounded-xl',
                    'outline-none transition-all duration-200',
                    'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                    fieldErrors.name && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                  )}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
              )}
            </div>

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
                    'w-full px-4 py-2.5 pl-12',
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
                  autoComplete="new-password"
                  placeholder="请输入密码（至少8位）"
                  className={cn(
                    'w-full px-4 py-2.5 pl-12 pr-12',
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

              {/* 密码强度指示器 */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-[var(--text-secondary)]">密码强度</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: getStrengthColor(passwordStrength) }}
                    >
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: getStrengthWidth(passwordStrength),
                        backgroundColor: getStrengthColor(passwordStrength),
                      }}
                    />
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* 确认密码输入 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-primary)]">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined })
                  }}
                  autoComplete="new-password"
                  placeholder="请再次输入密码"
                  className={cn(
                    'w-full px-4 py-2.5 pl-12 pr-12',
                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'bg-[rgba(255,255,255,0.05)]',
                    'border border-[var(--input-border)] rounded-xl',
                    'outline-none transition-all duration-200',
                    'focus:border-[var(--primary-start)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                    fieldErrors.confirmPassword && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* 注册按钮 */}
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
                  注册中...
                </span>
              ) : (
                '创建账号'
              )}
            </button>
            </div>
          </form>

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-4">
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

          {/* 底部登录链接 */}
          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              已有账号？{' '}
              <a
                href="/login"
                className="text-[var(--primary-glow)] font-medium hover:underline"
              >
                立即登录
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
