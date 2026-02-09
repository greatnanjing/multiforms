/* ============================================
   MultiForms Admin Layout

   管理后台布局组件 - 简化版
   - 紫色渐变主题
   - Admin 专用侧边栏
   - 顶部操作栏
   - 主内容区域
============================================ */

'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from './sidebar'
import { TabBarSpacer } from './tabbar'
import { ThemeSwitcher } from './theme-switcher'
import { cn } from '@/lib/utils'
import { ShieldAlert, LogOut } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function AdminLayout({
  children,
  className,
  contentClassName,
}: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const signOut = useAuthStore((state) => state.signOut)

  const handleLogout = async () => {
    await signOut('/admin-login')
  }

  return (
    <div className={cn('min-h-screen bg-[var(--bg-primary)]', className)}>
      {/* Admin 专属样式 */}
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
        <header className="sticky top-0 z-30 bg-gradient-to-r from-purple-900/20 to-violet-900/20 backdrop-blur-xl border-b border-purple-500/20 px-6 py-3 lg:py-4">
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
              {/* 主题切换器 */}
              <ThemeSwitcher variant="compact" />

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[var(--text-secondary)] hover:text-red-400"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {profile && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-medium">
                  {(profile.nickname || profile.email?.charAt(0) || 'A').toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main
          className={cn(
            'p-4 sm:p-6 lg:p-8',
            'pb-24 lg:pb-8',
            contentClassName
          )}
        >
          {children}
        </main>
      </div>

      <TabBarSpacer />
    </div>
  )
}

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

  if (titleMap[pathname]) {
    return titleMap[pathname]
  }

  for (const [path, title] of Object.entries(titleMap)) {
    if (pathname.startsWith(path + '/')) {
      return title
    }
  }

  return '管理后台'
}
