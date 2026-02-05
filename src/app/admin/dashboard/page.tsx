/* ============================================
   MultiForms Admin Dashboard Page

   管理员仪表盘 - 实时数据概览
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  FileText,
  BarChart3,
  Activity,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalUsers: number
  totalForms: number
  totalSubmissions: number
  activeUsers: number
  usersChange: number
  formsChange: number
  submissionsChange: number
  activeUsersChange: number
}

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  loading?: boolean
}

function StatCard({ title, value, change, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <div className="text-3xl font-bold text-white min-h-[36px] flex items-center">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
            ) : (
              value
            )}
          </div>
          <div className={cn(
            'flex items-center gap-1 mt-2 text-sm',
            change.startsWith('+') ? 'text-green-400' : 'text-red-400'
          )}>
            <TrendingUp className="w-4 h-4" />
            <span>{change}%</span>
            <span className="text-[var(--text-muted)]">较上月</span>
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalForms: 0,
    totalSubmissions: 0,
    activeUsers: 0,
    usersChange: 0,
    formsChange: 0,
    submissionsChange: 0,
    activeUsersChange: 0
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        
        // 1. 获取总用户数
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // 2. 获取表单总数
        const { count: formCount } = await supabase
          .from('forms')
          .select('*', { count: 'exact', head: true })

        // 3. 获取活跃用户 (最近7天登录)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { count: activeCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('last_login_at', sevenDaysAgo.toISOString())

        // 4. 获取总提交数 (聚合 forms.response_count)
        const { data: formsData } = await supabase
          .from('forms')
          .select('response_count')
        
        const totalResponses = formsData?.reduce((sum: number, form: { response_count?: number }) => sum + (form.response_count || 0), 0) || 0

        // 模拟增长率 (实际项目中应对比上月数据)
        // 这里暂时使用随机数模拟，后续可实现真实环比
        setStats({
          totalUsers: userCount || 0,
          totalForms: formCount || 0,
          totalSubmissions: totalResponses,
          activeUsers: activeCount || 0,
          usersChange: 12, // TODO: Implement real MoM calculation
          formsChange: 8,
          submissionsChange: 23,
          activeUsersChange: 5
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value={stats.totalUsers}
          change={`+${stats.usersChange}`}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
          loading={loading}
        />
        <StatCard
          title="表单数量"
          value={stats.totalForms}
          change={`+${stats.formsChange}`}
          icon={FileText}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
          loading={loading}
        />
        <StatCard
          title="提交总数"
          value={stats.totalSubmissions.toLocaleString()}
          change={`+${stats.submissionsChange}`}
          icon={BarChart3}
          color="bg-gradient-to-br from-orange-500 to-red-500"
          loading={loading}
        />
        <StatCard
          title="活跃用户 (7日)"
          value={stats.activeUsers}
          change={`+${stats.activeUsersChange}`}
          icon={Activity}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
          loading={loading}
        />
      </div>

      {/* 最近活动 */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">最近活动</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            查看全部
          </button>
        </div>

        <div className="space-y-3">
          {/* 这里可以后续接入 admin_logs */}
          <div className="text-center text-[var(--text-muted)] py-8">
            暂无活动日志
          </div>
        </div>
      </div>
    </div>
  )
}
