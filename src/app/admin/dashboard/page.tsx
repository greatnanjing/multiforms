/* ============================================
   MultiForms Admin Dashboard Page

   管理员仪表盘 - 使用模拟数据
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import {
  Users,
  FileText,
  BarChart3,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
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
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="总用户数"
          value="128"
          change="+12"
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          title="表单数量"
          value="45"
          change="+8"
          icon={FileText}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
        />
        <StatCard
          title="提交总数"
          value="1,234"
          change="+23"
          icon={BarChart3}
          color="bg-gradient-to-br from-orange-500 to-red-500"
        />
        <StatCard
          title="活跃用户"
          value="89"
          change="+5"
          icon={Activity}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
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
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="shrink-0 p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">新用户注册</p>
                <p className="text-sm text-[var(--text-secondary)]">用户加入了平台</p>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Calendar className="w-3 h-3" />
                今天
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-[1.02] text-left">
          <Users className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">用户管理</h3>
          <p className="text-sm text-[var(--text-secondary)]">管理用户账号和权限</p>
        </button>

        <button className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all hover:scale-[1.02] text-left">
          <FileText className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">表单管理</h3>
          <p className="text-sm text-[var(--text-secondary)]">审核和管理平台表单</p>
        </button>

        <button className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all hover:scale-[1.02] text-left">
          <BarChart3 className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">数据统计</h3>
          <p className="text-sm text-[var(--text-secondary)]">查看平台数据分析</p>
        </button>
      </div>
    </div>
  )
}
