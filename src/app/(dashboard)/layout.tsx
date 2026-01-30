/* ============================================
   MultiForms Dashboard Route Group Layout

   仪表盘路由组布局：
   - 使用 DashboardLayout 组件
   - 需要认证
   - 适用于仪表盘、我的表单、数据分析等
   - 路径: /dashboard, /forms, /analytics 等

   Route Groups: (dashboard) - 不会出现在 URL 中
============================================ */

import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
