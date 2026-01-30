/* ============================================
   MultiForms Admin Layout

   管理后台布局组件：
   - 紫色渐变主题（区别于前台）
   - Admin 专用侧边栏
   - 顶部操作栏
   - 主内容区域

   Usage:
   <AdminLayout>
     <AdminContent />
   </AdminLayout>
============================================ */

'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './sidebar'
import { TabBarSpacer } from './tabbar'
import { cn } from '@/lib/utils'
import { Loader2, ShieldAlert, LogOut, Bell } from 'lucide-react'
import type { Profile } from '@/types'

interface AdminLayoutProps {
  children: React.ReactNode
  /** 额外的类名 */
  className?: string
  /** 内容区域的类名 */
  contentClassName?: string
}

export function AdminLayout({
  children,
  className,
  contentClassName,
}: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // 验证管理员权限
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/admin/login')
          return
        }

        // 获取用户 profile 并验证角色
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser(profile)

        // 检查是否是管理员
        if (profile?.role === 'admin') {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (error) {
        console.error('Failed to check admin:', error)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  // 加载状态
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

  // 未授权状态
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">访问受限</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            您没有权限访问管理后台。此页面仅限管理员访问。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium"
            >
              返回首页
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 font-medium"
            >
              管理员登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen bg-[var(--bg-primary)]', className)}>
      {/* Admin 专属样式 - 紫色主题 */}
      <style jsx global>{`
        :root {
          --admin-primary: #8B5CF6;
          --admin-primary-dark: #7C3AED;
        }
      `}</style>

      {/* Admin Sidebar */}
      <Sidebar
        currentPath={pathname}
        variant="admin"
        userRole="admin"
        defaultCollapsed={false}
      />

      {/* Main Content Area */}
      <div className="lg:ml-56">
        {/* Admin Top Bar */}
        <header className="sticky top-16 z-30 bg-gradient-to-r from-purple-900/20 to-violet-900/20 backdrop-blur-xl border-b border-purple-500/20 px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{getAdminPageTitle(pathname)}</h1>
                <p className="text-xs text-[var(--text-muted)] hidden sm:block">
                  管理员控制面板
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-secondary)] hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Logout */}
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/admin/login')
                }}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[var(--text-secondary)] hover:text-red-400"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Admin Avatar */}
              {user && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-medium">
                  {(user.nickname || user.email?.charAt(0) || 'A').toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Admin Content */}
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

// 根据路径获取管理后台页面标题
function getAdminPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    '/admin': '管理员仪表盘',
    '/admin/users': '用户管理',
    '/admin/forms': '表单管理',
    '/admin/templates': '模板管理',
    '/admin/review': '内容审核',
    '/admin/settings': '系统设置',
    '/admin/logs': '操作日志',
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

  return '管理后台'
}
