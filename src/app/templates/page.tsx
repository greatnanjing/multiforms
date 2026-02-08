/* ============================================
   MultiForms Templates Page

   模板库页面：
   - 显示预置表单模板（与首页共享）
   - 支持预览和使用模板
   - 点击模板创建表单并跳转到编辑页

   路径: /templates
============================================ */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FileText, Star, TrendingUp, Loader2, AlertCircle, ThumbsUp, MessageSquare, ClipboardList, HelpCircle, Calendar, Users, Tag } from 'lucide-react'
import { createFormFromTemplate } from '@/lib/api/templates'
import { getTemplatesForShowcase } from '@/lib/templates/definitions'

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ThumbsUp,
  MessageSquare,
  Star,
  ClipboardList,
  HelpCircle,
  Calendar,
  Users,
  Tag,
  TrendingUp,
}

// 模板分类映射
const categoryMap: Record<string, string[]> = {
  '全部模板': [],
  '投票': ['vote'],
  '调查': ['survey', 'questionnaire'],
  '评分': ['rating'],
  '反馈': ['feedback'],
  '收集': ['collection'],
}

export default function TemplatesPage() {
  const router = useRouter()
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部模板')

  // 使用 useMemo 缓存模板列表
  const templates = useMemo(() => getTemplatesForShowcase(), [])

  // 根据分类筛选模板
  const filteredTemplates = useMemo(() => {
    if (activeCategory === '全部模板') return templates
    const categories = categoryMap[activeCategory] || []
    return templates.filter(t => categories.includes(t.category))
  }, [templates, activeCategory])

  // 使用 useCallback 缓存处理函数
  const handleTemplateClick = useCallback(async (templateId: string) => {
    // 清除之前的错误
    setError(null)

    // 防止重复点击
    if (creatingTemplateId) {
      return
    }

    setCreatingTemplateId(templateId)

    try {
      // 从模板创建表单
      const form = await createFormFromTemplate(templateId)
      // 跳转到表单编辑页面
      router.push(`/forms/${form.id}/edit`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建表单失败，请重试'
      console.error('创建表单失败:', err)
      setError(errorMessage)
    } finally {
      setCreatingTemplateId(null)
    }
  }, [router, creatingTemplateId])

  const isLoading = creatingTemplateId !== null

  // 获取当前加载中的模板名称
  const loadingTemplateName = useMemo(() => {
    if (!creatingTemplateId) return null
    const template = templates.find(t => t.id === creatingTemplateId)
    return template?.name || null
  }, [creatingTemplateId, templates])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 模板分类 */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.keys(categoryMap).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white'
                  : 'bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md">
            <div className="glass-card rounded-xl p-4 flex items-start gap-3 bg-red-500/10 border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="关闭错误提示"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-title"
          >
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" role="status" aria-label="加载中" />
              <p id="loading-title" className="text-[var(--text-primary)]">
                {loadingTemplateName ? `正在创建"${loadingTemplateName}"表单...` : '正在创建表单...'}
              </p>
            </div>
          </div>
        )}

        {/* 模板网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = iconMap[template.iconName]
            const isCurrentLoading = creatingTemplateId === template.id

            return (
              <div
                key={template.id}
                className={`glass-card p-4 hover:border-indigo-500/30 transition-all duration-300 group relative ${
                  isCurrentLoading ? 'opacity-50 pointer-events-none' : ''
                } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !isLoading && handleTemplateClick(template.id)}
              >
                {isCurrentLoading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-xl">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center">
                    {IconComponent && (
                      <IconComponent className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[#A78BFA] transition-colors" />
                    )}
                  </div>
                  <button
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-yellow-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: 收藏功能
                    }}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-white mb-1 truncate">{template.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 h-8">
                  {template.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                  <span>{template.questionsCount}题</span>
                  <span className="flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {template.useCount >= 10000 ? `${(template.useCount / 10000).toFixed(1)}万` : `${template.useCount}`}
                  </span>
                </div>
                <button
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    isCurrentLoading
                      ? 'bg-white/5 border border-white/10 text-[var(--text-muted)]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-gradient-to-r hover:from-[var(--primary-start)] hover:to-[var(--primary-end)] hover:border-transparent'
                  }`}
                  disabled={isCurrentLoading}
                >
                  {isCurrentLoading ? '创建中...' : '使用模板'}
                </button>
              </div>
            )
          })}
        </div>

        {/* 提示信息 */}
        <div className="glass-card p-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">需要自定义表单？</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                从空白开始创建，完全自定义您的问题和选项
              </p>
            </div>
            <button
              onClick={() => router.push('/forms/new')}
              className="ml-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              创建空白表单
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
