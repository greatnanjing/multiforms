/* ============================================
   MultiForms Main Layout

   公开页面布局组件：
   - 顶部导航栏 (Navbar)
   - 主内容区域
   - 适用于首页、模板库等公开页面

   Usage:
   <MainLayout>
     <PageContent />
   </MainLayout>
============================================ */

'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'
import { TabBarSpacer } from './tabbar'

interface MainLayoutProps {
  children: React.ReactNode
  /** 隐藏导航栏 */
  hideNavbar?: boolean
  /** 额外的类名 */
  className?: string
  /** 内容区域的类名 */
  contentClassName?: string
}

export function MainLayout({
  children,
  hideNavbar = false,
  className,
  contentClassName,
}: MainLayoutProps) {
  const pathname = usePathname()

  // 判断当前路径是否是公开页面
  const isPublicPage = !pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Navbar */}
      {!hideNavbar && <Navbar variant="public" currentPath={pathname} />}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1',
          // Navbar 占用的高度
          !hideNavbar && 'pt-16',
          // 底部留出 TabBar 空间（移动端）
          'lg:pb-0',
          contentClassName
        )}
      >
        {children}
      </main>

      {/* Mobile TabBar Spacer */}
      <TabBarSpacer />

      {/* Footer (可选) */}
      {!hideNavbar && isPublicPage && (
        <footer className="border-t border-white/5 py-8 mt-auto">
          <div className="max-w-[1280px] mx-auto px-6 text-center text-sm text-[var(--text-muted)]">
            <p>&copy; {new Date().getFullYear()} MultiForms. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  )
}

import { cn } from '@/lib/utils'
