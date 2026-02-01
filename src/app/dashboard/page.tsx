/* ============================================
   MultiForms Dashboard Page

   仪表盘页面：
   - Bento Grid 统计卡片
   - 快速开始 CTA 卡片
   - 最近表单列表
   - 空状态提示

   路径: /dashboard
============================================ */

import { DashboardLayout } from '@/components/layout/dashboard-layout'

// 导入 dashboard 内容组件
import DashboardContent from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}
