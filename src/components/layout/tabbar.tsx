/* ============================================
   MultiForms TabBar Component

   移动端底部导航组件，支持：
   - 4个主要导航按钮
   - 选中状态高亮
   - 角标提示
   - 安全区域适配

   Usage:
   <TabBar currentPath="/dashboard" />
   <TabBar items={customItems} currentPath="/dashboard" />
============================================ */

'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Home,
  ListTodo,
  Layers,
  BarChart3,
  Settings,
  User,
  Bell,
  Search,
} from 'lucide-react'

export interface TabBarItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | boolean
  disabled?: boolean
}

interface TabBarProps {
  /** 当前激活的路径 */
  currentPath?: string
  /** 自定义导航项 */
  items?: TabBarItem[]
  /** 变体 */
  variant?: 'default' | 'admin' | 'creator'
  /** 是否固定在底部 */
  fixed?: boolean
  /** 额外的类名 */
  className?: string
}

const defaultItems: TabBarItem[] = [
  { id: 'home', label: '首页', href: '/', icon: Home },
  { id: 'forms', label: '表单', href: '/forms', icon: ListTodo },
  { id: 'templates', label: '模板', href: '/templates', icon: Layers },
  { id: 'profile', label: '我的', href: '/profile', icon: User },
]

const creatorItems: TabBarItem[] = [
  { id: 'dashboard', label: '仪表盘', href: '/dashboard', icon: BarChart3 },
  { id: 'forms', label: '我的表单', href: '/forms', icon: ListTodo },
  { id: 'templates', label: '模板库', href: '/templates', icon: Layers },
  { id: 'settings', label: '设置', href: '/settings', icon: Settings },
]

const adminItems: TabBarItem[] = [
  { id: 'dashboard', label: '仪表盘', href: '/admin', icon: BarChart3 },
  { id: 'users', label: '用户', href: '/admin/users', icon: User },
  { id: 'review', label: '审核', href: '/admin/review', icon: Bell },
  { id: 'settings', label: '设置', href: '/admin/settings', icon: Settings },
]

// 根据路径判断激活状态
const getActiveState = (href: string, currentPath: string) => {
  if (href === '/') {
    return currentPath === '/'
  }
  return currentPath.startsWith(href)
}

export function TabBar({
  currentPath = '/',
  items,
  variant = 'default',
  fixed = true,
  className,
}: TabBarProps) {
  // 根据变体选择默认导航项
  const navItems = items || (variant === 'admin' ? adminItems : variant === 'creator' ? creatorItems : defaultItems)

  return (
    <nav
      className={cn(
        'lg:hidden',
        'bg-[rgba(15,15,35,0.95)] backdrop-blur-xl',
        'border-t border-white/5',
        fixed && 'fixed bottom-0 left-0 right-0 z-50',
        // Safe area for notched devices
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <ul className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = getActiveState(item.href, currentPath)
          const Icon = item.icon
          const hasBadge = item.badge !== undefined

          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200',
                  item.disabled && 'opacity-50 pointer-events-none',
                  isActive ? 'text-[var(--primary-glow)]' : 'text-[var(--text-muted)]'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />

                  {/* Badge */}
                  {hasBadge && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-medium rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}

                  {/* Dot badge */}
                  {hasBadge && item.badge === true && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>

                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// 带搜索和通知的扩展底部栏
export function ExtendedTabBar({
  currentPath = '/',
  onSearch,
  onNotifications,
  notificationCount = 0,
  className,
}: TabBarProps & {
  onSearch?: () => void
  onNotifications?: () => void
  notificationCount?: number
}) {
  return (
    <nav
      className={cn(
        'lg:hidden',
        'bg-[rgba(15,15,35,0.95)] backdrop-blur-xl',
        'border-t border-white/5',
        'fixed bottom-0 left-0 right-0 z-50',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <ul className="flex items-center justify-around px-2">
        {/* Main Navigation */}
        {defaultItems.map((item) => {
          const isActive = getActiveState(item.href, currentPath)
          const Icon = item.icon

          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200',
                  isActive ? 'text-[var(--primary-glow)]' : 'text-[var(--text-muted)]'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] rounded-full" />
                )}
              </Link>
            </li>
          )
        })}

        {/* Search Button */}
        <li className="flex-1">
          <button
            onClick={onSearch}
            className="flex flex-col items-center justify-center gap-1 py-2 w-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">搜索</span>
          </button>
        </li>

        {/* Notifications Button */}
        <li className="flex-1">
          <button
            onClick={onNotifications}
            className="relative flex flex-col items-center justify-center gap-1 py-2 w-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-medium rounded-full">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">通知</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

// 底部占位元素（用于防止内容被 TabBar 遮挡）
export function TabBarSpacer() {
  return (
    <div className="lg:hidden h-16 pb-[env(safe-area-inset-bottom)]" />
  )
}

export default TabBar
