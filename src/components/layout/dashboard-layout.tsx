/* ============================================
   MultiForms Dashboard Layout

   仪表盘布局组件：
   - 侧边栏 (桌面端)
   - 底部导航 (移动端)
   - 顶部用户信息栏
   - 主内容区域

   Usage:
   <DashboardLayout>
     <DashboardContent />
   </DashboardLayout>
============================================ */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'
import { Sidebar } from './sidebar'
import { TabBarSpacer } from './tabbar'
import { ThemeSwitcher } from './theme-switcher'
import { cn } from '@/lib/utils'
import { Loader2, LogOut, Home } from 'lucide-react'
import type { Profile } from '@/types'
import { useAuthStore } from '@/stores/authStore'

interface DashboardLayoutProps {
  children: React.ReactNode
  /** 当前用户角色 */
  userRole?: 'admin' | 'creator' | 'guest'
  /** 额外的类名 */
  className?: string
  /** 内容区域的类名 */
  contentClassName?: string
}

export function DashboardLayout({
  children,
  userRole = 'creator',
  className,
  contentClassName,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mountedRef = useRef(true)
  const supabaseRef = useRef<ReturnType<typeof getBrowserClient> | null>(null)

  // 获取当前用户信息
  useEffect(() => {
    mountedRef.current = true

    const getUser = async () => {
      try {
        // 使用单例客户端
        if (!supabaseRef.current) {
          supabaseRef.current = getBrowserClient()
        }
        const supabase = supabaseRef.current

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          if (mountedRef.current) {
            router.push('/login')
          }
          return
        }

        // 获取用户 profile，处理表不存在的情况
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (mountedRef.current) {
            // 如果 profiles 表不存在或查询失败，使用 session 数据作为 fallback
            if (error || !profile) {
              console.warn('Failed to fetch profile, using session data:', error?.message)
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                nickname: session.user.user_metadata?.nickname || session.user.user_metadata?.name,
                avatar_url: session.user.user_metadata?.avatar_url,
                role: session.user.user_metadata?.role || userRole,
                status: 'active',
                form_count: 0,
                submission_count: 0,
                storage_used: 0,
                preferences: {},
                email_verified: session.user.email_confirmed_at != null,
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at,
                last_login_at: session.user.last_sign_in_at,
              } as Profile)
            } else {
              setUser(profile)
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
          if (mountedRef.current) {
            // 使用 session 数据作为 fallback
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              nickname: session.user.user_metadata?.nickname || session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url,
              role: session.user.user_metadata?.role || userRole,
              status: 'active',
              form_count: 0,
              submission_count: 0,
              storage_used: 0,
              preferences: {},
              email_verified: session.user.email_confirmed_at != null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
              last_login_at: session.user.last_sign_in_at,
            } as Profile)
          }
        }
      } catch (error) {
        console.error('Failed to get user:', error)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    getUser()

    // 清理函数
    return () => {
      mountedRef.current = false
    }
  }, [router, userRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-start)]" />
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  // 退出登录
  const handleLogout = async () => {
    const signOut = useAuthStore.getState().signOut
    await signOut()
    router.push('/login')
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
    <div className={cn('min-h-screen bg-[var(--bg-primary)]', className)}>
      {/* Sidebar (Desktop) */}
      <Sidebar
        currentPath={pathname}
        variant="dashboard"
        userRole={user?.role || userRole}
        defaultCollapsed={false}
      />

      {/* Main Content Area */}
      <div className="lg:ml-56 flex flex-col h-screen overflow-hidden">
        {/* Fixed Header - Combined Welcome and Page Title */}
        <header className="flex-shrink-0 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-white/5">
          {/* Top Bar - Welcome, Theme Switcher, User Menu */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              {/* Return Home Button */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-sm"
                title="返回首页"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">首页</span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)]">
                欢迎回来，{user?.nickname || user?.email?.split('@')[0] || '用户'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <ThemeSwitcher variant="compact" showModeToggle={false} className="hidden sm:block" />

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white text-xs font-medium">
                    {getUserDisplay().charAt(0).toUpperCase()}
                  </div>
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
                        <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                      </div>
                      <div className="py-1">
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
            </div>
          </div>

          {/* Page Title */}
          <div className="px-6 py-3 lg:py-4">
            <h1 className="text-lg font-semibold text-white">{getPageTitle(pathname)}</h1>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'p-4 sm:p-6 lg:p-8',
            'pb-24 lg:pb-8', // Extra padding for mobile TabBar
            contentClassName
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile TabBar Spacer */}
      <TabBarSpacer />
    </div>
  )
}

// 根据路径获取页面标题
function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/forms': '我的表单',
    '/templates': '模板库',
    '/analytics': '数据分析',
    '/settings': '设置',
    '/profile': '个人资料',
  }

  // 精确匹配
  if (titleMap[pathname]) {
    return titleMap[pathname]
  }

  // 前缀匹配
  for (const [path, title] of Object.entries(titleMap)) {
    if (pathname.startsWith(path + '/')) {
      return title
    }
  }

  return '仪表盘'
}
