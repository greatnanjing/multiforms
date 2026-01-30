/* ============================================
   MultiForms Public Route Group Layout

   公开页面路由组布局：
   - 使用 MainLayout 组件
   - 适用于首页、登录、注册、模板库等
   - 路径: /, /login, /register, /templates, /f/* 等

   Route Groups: (public) - 不会出现在 URL 中
============================================ */

import { MainLayout } from '@/components/layout/main-layout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
