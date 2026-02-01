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
import { usePathname, useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'
import { Sidebar } from './sidebar'
import { TabBarSpacer } from './tabbar'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Profile } from '@/types'

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
      <div className="lg:ml-56">
        {/* Top Bar (Optional - for user info, notifications, etc.) */}
        <header className="sticky top-16 z-30 bg-[rgba(15,15,35,0.8)] backdrop-blur-xl border-b border-white/5 px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">{getPageTitle(pathname)}</h1>
              <p className="text-sm text-[var(--text-muted)] hidden sm:block">
                欢迎回来，{user?.nickname || user?.email?.split('@')[0] || '用户'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick actions could go here */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={cn(
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
