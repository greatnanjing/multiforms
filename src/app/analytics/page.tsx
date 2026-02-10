/* ============================================
   MultiForms Analytics Page

   数据分析页面：
   - 查看所有表单的数据统计
   - 响应趋势分析
   - Top 表单排行

   路径: /analytics
============================================ */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  BarChart3,
  TrendingUp,
  Users,
  ListTodo,
  Eye,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getGlobalAnalytics } from '@/lib/api/analytics'

// ============================================
// Types
// ============================================

interface FormStats {
  id: string
  title: string
  response_count: number
  view_count: number
  completion_rate: number
}

interface GlobalStats {
  total_forms: number
  total_responses: number
  total_views: number
  avg_completion_rate: number
  responses_today: number
  responses_this_week: number
  responses_this_month: number
  forms_by_type: Record<string, number>
  forms_by_status: Record<string, number>
  top_forms: FormStats[]
}

// ============================================
// Components
// ============================================

function StatsCard({
  icon,
  label,
  value,
  unit = '',
  color = 'indigo',
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  unit?: string
  color?: 'indigo' | 'green' | 'purple' | 'cyan' | 'pink' | 'orange'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-500/15 text-indigo-400',
    green: 'bg-green-500/15 text-green-400',
    purple: 'bg-purple-500/15 text-purple-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
    pink: 'bg-pink-500/15 text-pink-400',
    orange: 'bg-orange-500/15 text-orange-400',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
    </div>
  )
}

function FormRow({ form, index }: { form: FormStats; index: number }) {
  return (
    <Link
      href={`/forms/${form.id}/analytics`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors group"
    >
      {/* Rank */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold',
        index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400' :
        index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 text-gray-300' :
        index === 2 ? 'bg-gradient-to-br from-orange-600/20 to-orange-700/20 text-orange-400' :
        'bg-white/5 text-[var(--text-muted)]'
      )}>
        {index + 1}
      </div>

      {/* Form Title */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate group-hover:text-[var(--primary-glow)] transition-colors">
          {form.title}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Users className="w-4 h-4" />
          <span>{form.response_count}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Eye className="w-4 h-4" />
          <span>{form.view_count}</span>
        </div>
        <div className={cn(
          'px-2 py-1 rounded-lg text-xs font-medium',
          form.completion_rate >= 70 ? 'bg-green-500/15 text-green-400' :
          form.completion_rate >= 40 ? 'bg-yellow-500/15 text-yellow-400' :
          'bg-red-500/15 text-red-400'
        )}>
          {form.completion_rate}%
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary-glow)] group-hover:translate-x-0.5 transition-all" />
    </Link>
  )
}

// ============================================
// Main Component
// ============================================

export default function AnalyticsPage() {
  // State
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load data
  const loadStats = useCallback(async () => {
    try {
      const data = await getGlobalAnalytics()
      setStats(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadStats()
  }, [loadStats])

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">加载失败</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            'bg-white/5 text-white hover:bg-white/10',
            'disabled:opacity-50'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          刷新
        </button>
      </div>

      {/* Stats Overview - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={<ListTodo className="w-5 h-5" />}
          label="表单总数"
          value={stats?.total_forms || 0}
          color="indigo"
        />
        <StatsCard
          icon={<Users className="w-5 h-5" />}
          label="总回复数"
          value={stats?.total_responses || 0}
          color="green"
        />
        <StatsCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="平均完成率"
          value={stats?.avg_completion_rate || 0}
          unit="%"
          color="purple"
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="今日回复"
          value={stats?.responses_today || 0}
          color="cyan"
        />
      </div>

      {/* Stats Overview - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          icon={<Eye className="w-5 h-5" />}
          label="总浏览量"
          value={stats?.total_views || 0}
          color="pink"
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="本周回复"
          value={stats?.responses_this_week || 0}
          color="orange"
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="本月回复"
          value={stats?.responses_this_month || 0}
          color="green"
        />
      </div>

      {/* Top Forms */}
      <section className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">热门TOP10表单排行</h2>
          <Link
            href="/forms"
            className="text-sm text-[var(--primary-glow)] hover:underline flex items-center gap-1"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.top_forms && stats.top_forms.length > 0 ? (
          <div className="divide-y divide-white/5">
            {stats.top_forms.map((form, index) => (
              <FormRow key={form.id} form={form} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/3 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无数据</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              创建表单并收集数据后，这里将显示表单排行
            </p>
            <Link
              href="/forms/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px]"
            >
              创建第一个表单
            </Link>
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
