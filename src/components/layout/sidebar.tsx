/* ============================================
   MultiForms Sidebar Component

   侧边栏导航组件，支持：
   - 仪表盘导航
   - 选中状态高亮
   - 折叠/展开
   - 退出登录

   Usage:
   <Sidebar currentPath="/dashboard" />
============================================ */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FileText,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  FolderOpen,
  Palette,
  Sun,
  Moon,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore, useCurrentTheme, useCurrentMode } from '@/stores/themeStore'
import { getAllThemes, getThemeGradient } from '@/lib/themes'
import type { ThemeId } from '@/types'

export interface SidebarNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
}

interface SidebarProps {
  /** 当前激活的路径 */
  currentPath?: string
  /** 侧边栏变体 */
  variant?: 'dashboard' | 'admin'
  /** 用户角色 */
  userRole?: 'admin' | 'creator' | 'guest'
  /** 默认是否折叠 */
  defaultCollapsed?: boolean
}

const dashboardNavItems: SidebarNavItem[] = [
  { id: 'dashboard', label: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
  { id: 'forms', label: '我的表单', href: '/forms', icon: FileText },
  { id: 'templates', label: '模板库', href: '/templates', icon: Layers },
  { id: 'analytics', label: '数据分析', href: '/analytics', icon: BarChart3 },
]

const adminNavItems: SidebarNavItem[] = [
  { id: 'admin-dashboard', label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { id: 'users', label: '用户管理', href: '/admin/users', icon: Users },
  { id: 'forms', label: '表单管理', href: '/admin/forms', icon: FileText },
  { id: 'templates', label: '模板管理', href: '/admin/templates', icon: FolderOpen },
  { id: 'settings', label: '系统设置', href: '/admin/settings', icon: Settings },
]

const bottomNavItems: SidebarNavItem[] = [
  { id: 'settings', label: '设置', href: '/settings', icon: Settings },
]

export function Sidebar({
  currentPath = '/',
  variant = 'dashboard',
  userRole = 'creator',
  defaultCollapsed = false,
}: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [navItems, setNavItems] = useState<SidebarNavItem[]>(
    variant === 'admin' ? adminNavItems : dashboardNavItems
  )
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  // Theme
  const currentTheme = useCurrentTheme()
  const currentMode = useCurrentMode()
  const setTheme = useThemeStore((state) => state.setTheme)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const themes = getAllThemes()

  // 根据路径判断激活状态
  const getActiveState = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return currentPath === href
    }
    return currentPath.startsWith(href)
  }

  // 退出登录
  const handleLogout = async () => {
    const signOut = useAuthStore.getState().signOut
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 transition-all duration-300',
          'bg-[rgba(15,15,35,0.8)] backdrop-blur-xl border-r border-white/5',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = getActiveState(item.href)
              const Icon = item.icon

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-[var(--primary-start)]/20 to-[var(--primary-end)]/20 text-white border border-[var(--primary-start)]/30'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[var(--primary-glow)]')} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[var(--primary-start)]/20 text-[var(--primary-glow)] text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Bottom Section */}
          <ul className="mt-4 pt-4 border-t border-white/5 space-y-1 px-2">
            {bottomNavItems.map((item) => {
              const isActive = getActiveState(item.href)
              const Icon = item.icon

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-[var(--primary-start)]/20 to-[var(--primary-end)]/20 text-white border border-[var(--primary-start)]/30'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[var(--primary-glow)]')} />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200',
                  'text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10'
                )}
                title={collapsed ? '退出登录' : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">退出登录</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center justify-center w-full h-8 rounded-lg transition-all duration-200',
              'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            )}
            title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Bottom Navigation) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(15,15,35,0.95)] backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <ul className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = getActiveState(item.href)
            const Icon = item.icon

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]',
                    isActive
                      ? 'text-[var(--primary-glow)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[var(--primary-start)]" />
                  )}
                </Link>
              </li>
            )
          })}

          {/* More menu button */}
          <li>
            <button
              onClick={() => setMoreMenuOpen(true)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">更多</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile More Menu */}
      {moreMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setMoreMenuOpen(false)}
          >
          </div>

          {/* Menu Panel */}
          <div className="fixed bottom-16 left-0 right-0 bg-[rgba(15,15,35,0.98)] backdrop-blur-xl border-t border-white/10 rounded-t-2xl z-50 lg:hidden p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">设置</h3>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Section */}
            <div className="mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-2 px-2">主题</p>
              <div className="grid grid-cols-4 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id as ThemeId)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                      currentTheme === theme.id ? 'bg-white/10' : 'bg-white/5'
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ background: getThemeGradient(theme.id as ThemeId) }}
                    />
                    <span className="text-[10px] text-[var(--text-secondary)]">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-2 px-2">显示模式</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentMode !== 'dark') toggleMode()
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                    currentMode === 'dark' ? 'bg-white/10 text-white' : 'bg-white/5 text-[var(--text-secondary)]'
                  )}
                >
                  <Moon className="w-4 h-4" />
                  深色
                </button>
                <button
                  onClick={() => {
                    if (currentMode !== 'light') toggleMode()
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                    currentMode === 'light' ? 'bg-white/10 text-white' : 'bg-white/5 text-[var(--text-secondary)]'
                  )}
                >
                  <Sun className="w-4 h-4" />
                  浅色
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout()
                setMoreMenuOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </div>
        </>
      )}

      {/* Spacer for collapsed sidebar */}
      <div className={cn('hidden lg:block', collapsed ? 'w-16' : 'w-56', 'flex-shrink-0')} />
    </>
  )
}

// Sidebar wrapper component that includes the main content area
export function SidebarLayout({
  currentPath = '/',
  variant = 'dashboard',
  userRole = 'creator',
  defaultCollapsed = false,
  children,
}: SidebarProps & { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar
        currentPath={currentPath}
        variant={variant}
        userRole={userRole}
        defaultCollapsed={defaultCollapsed}
      />
      <main className="lg:ml-0">
        {children}
      </main>
    </div>
  )
}
