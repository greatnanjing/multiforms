/* ============================================
   MultiForms Landing Page - Navbar

   支持显示用户登录状态：
   - 使用 useAuth 获取用户状态
   - 已登录时显示用户头像和菜单
   - 未登录时显示登录/注册按钮
   ============================================ */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, LayoutDashboard, ListTodo, LayoutGrid } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { cn } from '@/lib/utils'

// 移动端导航链接
const navLinks = [
  { href: '/templates', label: '模板库' },
]

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  // 获取用户状态
  const { user, profile, isAuthenticated, signOut } = useAuth()

  // 退出登录
  const handleLogout = async () => {
    await signOut()
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  // 获取用户显示名称
  const getUserDisplay = () => {
    if (profile?.nickname) return profile.nickname
    if (user?.email) {
      const email = user.email
      return email.split('@')[0]
    }
    return '用户'
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-white/5 py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11">
              <div className="w-full h-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-[#6366F1]/20 transition-all duration-200">
                <ListTodo className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <span className="text-lg font-semibold text-white/90">表单随心填</span>
          </Link>

          {/* Desktop Nav - 主题切换器居中 */}
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ marginLeft: '-80px' }}>
            <ThemeSwitcher variant="compact" showModeToggle={true} />
          </div>

          {/* Desktop Actions - 登录注册右对齐 */}
          <div className="hidden md:flex items-center gap-3">
            {/* Auth Buttons / User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white text-sm font-medium">
                    {getUserDisplay().charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
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
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          控制台
                        </Link>
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
              <>
                <Link
                  href="/login"
                  className="mr-6 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5 transition-all"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5 transition-all"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-[var(--text-primary)]"
            aria-label="菜单"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-[var(--bg-primary)]/95 backdrop-blur-xl p-6 transform transition-transform">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <nav className="flex flex-col gap-2 mt-16">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-5 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="w-full h-px bg-white/10 my-2" />

              {/* Theme Controls */}
              <div className="px-5 mb-4">
                <ThemeSwitcher variant="default" showModeToggle={true} />
              </div>

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <>
                  <div className="w-full h-px bg-white/10 my-2" />
                  <div className="px-5 py-3">
                    <p className="text-sm font-medium text-white">{getUserDisplay()}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-xl transition-all"
                  >
                    控制台
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full px-5 py-3 text-left text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <div className="w-full h-px bg-white/10 my-2" />
                  <Link
                    href="/login"
                    className="px-5 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-xl transition-all"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-3 text-base font-medium text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-center mt-2"
                  >
                    免费注册
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
