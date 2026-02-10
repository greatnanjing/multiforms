/* ============================================
   表单随心填 Navbar Component

   顶部导航栏组件，支持：
   - Logo（渐变色文字）
   - 导航链接
   - 主题切换
   - 用户菜单
   - Glassmorphism 效果
   - 响应式设计（移动端汉堡菜单）

   Usage:
   <Navbar />
   <Navbar variant="dashboard" />
   <Navbar variant="minimal" />
============================================ */

'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

// Theme types
type ThemeId = 'nebula' | 'ocean' | 'sunset' | 'forest' | 'sakura' | 'cyber' | 'minimal' | 'royal'
type ThemeMode = 'dark' | 'light'

interface NavbarProps {
  /** 导航栏变体 */
  variant?: 'public' | 'dashboard' | 'admin' | 'minimal'
  /** 当前激活的路径 */
  currentPath?: string
  /** 用户信息 */
  user?: {
    id: string
    email: string
    nickname?: string | null
    avatar_url?: string | null
    role?: 'admin' | 'creator' | 'guest'
  } | null
}

interface NavLink {
  label: string
  href: string
  active?: boolean
}

export function Navbar({ variant = 'public', currentPath = '/', user = null }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>('nebula')
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // 从 authStore 获取用户认证状态
  const isAuthenticated = useAuthStore((state) => state.isInitialized && !!state.user)

  // 应用主题
  const applyTheme = (newTheme: ThemeId, newMode: ThemeMode) => {
    document.body.setAttribute('data-theme', newTheme)
    document.body.setAttribute('data-mode', newMode)
    localStorage.setItem('theme', newTheme)
    localStorage.setItem('theme-mode', newMode)
  }

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeId || 'nebula'
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode || 'dark'
    setTheme(savedTheme) // eslint-disable-line react-hooks/set-state-in-effect
    setMode(savedMode) // eslint-disable-line react-hooks/set-state-in-effect
    applyTheme(savedTheme, savedMode)
  }, [])

  // 根据变体定义导航链接
  const navLinks: NavLink[] = variant === 'public'
    ? [
        { label: '首页', href: '/', active: currentPath === '/' },
        { label: '模板库', href: '/templates', active: currentPath.startsWith('/templates') },
        { label: '功能', href: '#features', active: false },
      ]
    : variant === 'dashboard'
    ? [
        { label: '仪表盘', href: '/dashboard', active: currentPath === '/dashboard' },
        { label: '我的表单', href: '/forms', active: currentPath.startsWith('/forms') && !currentPath.includes('/analytics') },
        { label: '模板库', href: '/templates', active: currentPath.startsWith('/templates') },
      ]
    : variant === 'minimal'
    ? [{ label: '首页', href: '/', active: currentPath === '/' }] // 简洁模式 - 只显示首页链接
    : [
        { label: '仪表盘', href: '/admin', active: currentPath === '/admin' },
        { label: '用户管理', href: '/admin/users', active: currentPath.startsWith('/admin/users') },
        { label: '表单管理', href: '/admin/forms', active: currentPath.startsWith('/admin/forms') },
        { label: '内容审核', href: '/admin/review', active: currentPath.startsWith('/admin/review') },
      ]

  // 切换主题
  const cycleTheme = () => {
    const themes: ThemeId[] = ['nebula', 'ocean', 'sunset', 'forest', 'sakura', 'cyber', 'minimal', 'royal']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
    applyTheme(nextTheme, mode)
  }

  // 切换深浅模式
  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    applyTheme(theme, newMode)
  }

  // 退出登录
  const handleLogout = async () => {
    const signOut = useAuthStore.getState().signOut
    await signOut()
    window.location.href = '/login'
  }

  // 处理模板库链接点击 - 需要登录
  const handleTemplatesClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      // 保存目标路径，登录后可以跳转
      const returnUrl = encodeURIComponent('/templates')
      router.push(`/login?returnTo=${returnUrl}`)
    }
    // 如果已登录，允许默认导航到 /templates
  }

  // 获取用户显示名称
  const getUserDisplay = () => {
    if (user?.nickname) return user.nickname
    if (user?.email) {
      const email = user.email
      return email.split('@')[0]
    }
    return '用户'
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          'bg-[rgba(15,15,35,0.8)] backdrop-blur-xl saturate-180',
          'border-b border-white/[0.05]'
        )}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Link
              href={variant === 'public' ? '/' : variant === 'dashboard' ? '/dashboard' : '/admin'}
              className="flex items-center gap-3 font-mono font-bold text-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-[var(--primary-start)] via-[var(--primary-end)] to-[var(--accent-pink)] bg-clip-text text-transparent">
                表单随心填
              </span>
            </Link>

            {/* Desktop Navigation - minimal 变体时居中 */}
            <ul className={cn(
              'hidden md:flex items-center gap-8',
              variant === 'minimal' && 'absolute left-1/2 -translate-x-1/2'
            )}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.href === '/templates' && variant === 'public' ? (
                    <Link
                      href={link.href}
                      onClick={handleTemplatesClick}
                      className={cn(
                        'relative text-sm font-medium transition-colors duration-200',
                        link.active
                          ? 'text-white after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[var(--primary-start)] after:to-[var(--primary-end)]'
                          : 'text-[var(--text-secondary)] hover:text-white after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[var(--primary-start)] after:to-[var(--primary-end)] after:transition-all after:duration-200 hover:after:w-full'
                      )}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'relative text-sm font-medium transition-colors duration-200',
                        link.active
                          ? 'text-white after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-[var(--primary-start)] after:to-[var(--primary-end)]'
                          : 'text-[var(--text-secondary)] hover:text-white after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[var(--primary-start)] after:to-[var(--primary-end)] after:transition-all after:duration-200 hover:after:w-full'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <div className="hidden md:flex items-center" style={{ transform: 'translateX(-80px)' }}>
                <button
                  onClick={cycleTheme}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                  title="切换主题"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)]" />
                </button>
                <button
                  onClick={toggleMode}
                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                  title={mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
                >
                  {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {/* Auth Buttons / User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white text-sm font-medium">
                      {getUserDisplay().charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-[var(--text-secondary)]">
                      {getUserDisplay()}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[rgba(26,26,46,0.95)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white">{getUserDisplay()}</p>
                          <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            个人资料
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            设置
                          </Link>
                          {user.role === 'admin' && variant !== 'admin' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              管理后台
                            </Link>
                          )}
                          <hr className="border-white/5 my-1" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            退出登录
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-lg hover:shadow-lg hover:shadow-[var(--primary-start)]/30 transition-all"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-lg hover:shadow-lg hover:shadow-[var(--primary-start)]/30 transition-all"
                  >
                    注册
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                aria-label="打开菜单"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-[rgba(15,15,35,0.98)] backdrop-blur-xl z-50 lg:hidden transform transition-transform duration-300 ease-out">
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation */}
              <nav className="mt-16 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    {link.href === '/templates' && variant === 'public' ? (
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          handleTemplatesClick(e)
                          setMobileMenuOpen(false)
                        }}
                        className={cn(
                          'block px-4 py-3 rounded-lg text-base font-medium transition-all',
                          link.active
                            ? 'bg-gradient-to-r from-[var(--primary-start)]/20 to-[var(--primary-end)]/20 text-white border border-[var(--primary-start)]/30'
                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                        )}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-3 rounded-lg text-base font-medium transition-all',
                          link.active
                            ? 'bg-gradient-to-r from-[var(--primary-start)]/20 to-[var(--primary-end)]/20 text-white border border-[var(--primary-start)]/30'
                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Theme Controls */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="px-4 mb-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  主题设置
                </p>
                <div className="flex gap-2 px-4">
                  <button
                    onClick={cycleTheme}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all text-sm"
                  >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)]" />
                    主题
                  </button>
                  <button
                    onClick={toggleMode}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all text-sm"
                  >
                    {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    模式
                  </button>
                </div>
              </div>

              {/* Auth Section */}
              {!user && (
                <div className="mt-8 pt-8 border-t border-white/10 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
