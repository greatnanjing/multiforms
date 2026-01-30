/* ============================================
   MultiForms Admin Route Group Layout

   管理后台路由组布局：
   - 使用 AdminLayout 组件
   - 需要管理员权限
   - 紫色渐变主题
   - 路径: /admin, /admin/users, /admin/forms 等

   Route Groups: (admin) - 不会出现在 URL 中
============================================ */

import { AdminLayout } from '@/components/layout/admin-layout'

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
