/* ============================================
   MultiForms Admin Index Page

   管理后台首页 - 重定向到仪表盘

   路径: /admin
============================================ */

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
