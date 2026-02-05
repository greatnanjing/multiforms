/* ============================================
   MultiForms Dashboard Page

   仪表盘页面：
   - Bento Grid 统计卡片
   - 快速开始 CTA 卡片
   - 最近表单列表
   - 空状态提示

   路径: /dashboard
============================================ */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Users, Target, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getForms } from '@/lib/api/forms'
import { FormCard, FormCardSkeleton } from '@/components/forms/form-card'
import { useToast } from '@/components/shared/toast'
import { useConfirm } from '@/components/shared/confirm-dialog'
import { cn } from '@/lib/utils'
import type { Form } from '@/types'

// ============================================
// Dashboard Stats Interface
// ============================================

interface DashboardStats {
  totalForms: number
  totalResponses: number
  completionRate: number
  avgDuration: string
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  iconColor: string
  trend?: {
    value: string
    positive: boolean
  }
}

function StatCard({ title, value, icon, iconColor, trend }: StatCardProps) {
  return (
    <div className="glass-card p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', iconColor)}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.positive ? 'text-green-400' : 'text-red-400'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-semibold text-white mb-2 font-mono">
        {value}
      </div>
      <div className="text-sm text-[var(--text-secondary)]">{title}</div>
    </div>
  )
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  onCreateForm: () => void
}

function EmptyState({ onCreateForm }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/3 flex items-center justify-center">
        <FileText className="w-10 h-10 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">还没有表单</h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
        创建您的第一个表单，开始收集数据
      </p>
      <button
        onClick={onCreateForm}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30"
      >
        <Plus className="w-5 h-5" />
        创建第一个表单
      </button>
    </div>
  )
}

// ============================================
// Dashboard Page Component
// ============================================

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, isInitialized } = useAuth()
  const toast = useToast()
  const { confirm } = useConfirm()

  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    completionRate: 0,
    avgDuration: '0:00',
  })

  // 获取表单数据
  useEffect(() => {
    // 10秒后强制停止加载状态，防止无限加载
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, 10000)

    // 等待 auth 初始化完成后再决定是否获取数据
    if (!isInitialized) {
      // 还在初始化中，等待
      return
    }

    if (isAuthenticated) {
      fetchForms()
    } else {
      // 未认证，停止显示加载状态
      setIsLoading(false)
    }

    return () => clearTimeout(timeoutId)
  }, [isInitialized, isAuthenticated])

  const fetchForms = async () => {
    setIsLoading(true)

    // 添加超时保护
    const timeoutId = setTimeout(() => {
      console.warn('[Dashboard] fetchForms timeout, showing empty state')
      setForms([])
      setIsLoading(false)
    }, 8000)

    try {
      const result = await Promise.race([
        getForms({
          sortBy: 'updated_at',
          sortOrder: 'desc',
          pageSize: 5,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 7000)
        ) as Promise<any>
      ])

      clearTimeout(timeoutId)

      setForms(result.data)

      // 计算统计数据
      const totalResponses = result.data.reduce((sum: number, form: Form) => sum + form.response_count, 0)
      const completionRate = result.data.length > 0
        ? Math.round((totalResponses / Math.max(result.data.reduce((sum: number, form: Form) => sum + form.view_count, 0), 1)) * 100)
        : 0

      setStats({
        totalForms: result.total,
        totalResponses,
        completionRate,
        avgDuration: '2:34', // 模拟数据
      })
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Failed to fetch forms:', error)
      // 即使获取失败，也显示空状态而不是一直加载
      setForms([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateForm = () => {
    router.push('/forms/new')
  }

  const handleEditForm = (formId: string) => {
    router.push(`/forms/${formId}/edit`)
  }

  const handleShareForm = async (formId: string) => {
    const shareUrl = `${window.location.origin}/f/${formId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('链接已复制到剪贴板')
    } catch {
      toast.error('复制失败，请手动复制链接')
    }
  }

  const handleAnalyzeForm = (formId: string) => {
    router.push(`/forms/${formId}/analytics`)
  }

  const handleDeleteForm = async (formId: string) => {
    const confirmed = await confirm({
      title: '确认删除表单',
      message: '确定要删除这个表单吗？此操作不可撤销。',
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      const { deleteForm } = await import('@/lib/api/forms')
      await deleteForm(formId)
      toast.success('表单已删除')
      // 重新获取表单列表
      await fetchForms()
    } catch (error) {
      console.error('Failed to delete form:', error)
      toast.error('删除失败，请稍后重试')
    }
  }

  // 加载状态 - 只依赖本地数据加载状态，不依赖 authLoading
  // 这样即使 auth 初始化有问题，页面也能正常渲染
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
              </div>
              <div className="h-9 w-20 bg-white/5 rounded-full mb-2 animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* 快速开始骨架 */}
        <div className="glass-card p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-white/5 rounded-full animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* 表单列表骨架 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse" />
            <div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" />
          </div>
          <FormCardSkeleton count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎语 */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-white mb-1">
          欢迎回来，{profile?.nickname || user?.email?.split('@')[0] || '用户'}
        </h1>
        <p className="text-[var(--text-secondary)]">
          这是您的仪表盘概览
        </p>
      </div>

      {/* 统计卡片 Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="表单总数"
          value={stats.totalForms}
          icon={<FileText className="w-6 h-6 text-indigo-400" />}
          iconColor="bg-indigo-500/15"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          title="回复总数"
          value={stats.totalResponses.toLocaleString()}
          icon={<Users className="w-6 h-6 text-green-400" />}
          iconColor="bg-green-500/15"
          trend={{ value: '+8%', positive: true }}
        />
        <StatCard
          title="完成率"
          value={`${stats.completionRate}%`}
          icon={<Target className="w-6 h-6 text-purple-400" />}
          iconColor="bg-purple-500/15"
          trend={{ value: '+2%', positive: true }}
        />
        <StatCard
          title="平均耗时"
          value={stats.avgDuration}
          icon={<TrendingUp className="w-6 h-6 text-cyan-400" />}
          iconColor="bg-cyan-500/15"
          trend={{ value: '+18%', positive: true }}
        />
      </div>

      {/* 快速开始 CTA 卡片 */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">快速开始</h3>
          <p className="text-[var(--text-secondary)]">创建一个新表单，开始收集数据</p>
        </div>
        <button
          onClick={handleCreateForm}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30"
        >
          <Plus className="w-5 h-5" />
          创建新表单
        </button>
      </div>

      {/* 最近表单 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">最近表单</h2>
          {forms.length > 0 && (
            <button
              onClick={() => router.push('/forms')}
              className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-glow)] transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {forms.length === 0 ? (
          <EmptyState onCreateForm={handleCreateForm} />
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onClick={() => handleEditForm(form.id)}
                onEdit={(e) => {
                  e.stopPropagation()
                  handleEditForm(form.id)
                }}
                onShare={(e) => {
                  e.stopPropagation()
                  handleShareForm(form.short_id)
                }}
                onAnalyze={(e) => {
                  e.stopPropagation()
                  handleAnalyzeForm(form.id)
                }}
                onDelete={(e) => {
                  e.stopPropagation()
                  handleDeleteForm(form.id)
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
