/* ============================================
   MultiForms Admin Templates Page

   模板管理页面：
   - 管理预置的系统模板
   - 模板启用/禁用
   - 特色标记
   - 使用统计

   路径: /admin/templates
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import {
  Search,
  Star,
  TrendingUp,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTemplatesForShowcase, type TemplateShowcase } from '@/lib/templates/definitions'

// ============================================
// Types
// ============================================

interface TemplateWithFeatured extends TemplateShowcase {
  is_featured: boolean
}

const categoryLabels: Record<string, string> = {
  vote: '投票',
  survey: '问卷',
  rating: '评分',
  feedback: '反馈',
  collection: '收集',
}

// ============================================
// Components
// ============================================

function TemplateCard({
  template,
  onToggleFeatured,
}: {
  template: TemplateWithFeatured
  onToggleFeatured: (id: string, featured: boolean) => void
}) {
  return (
    <div className="p-5 rounded-2xl border transition-all bg-white/5 border-white/10 hover:bg-white/10">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            {template.category === 'vote' && '🗳️'}
            {template.category === 'survey' && '📋'}
            {template.category === 'rating' && '⭐'}
            {template.category === 'feedback' && '💬'}
            {template.category === 'collection' && '📝'}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-medium truncate">{template.name}</h3>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {categoryLabels[template.category] || template.category}
            </p>
          </div>
        </div>

        {/* 特色按钮 */}
        <button
          onClick={() => onToggleFeatured(template.id, !template.is_featured)}
          className={cn(
            'p-2 rounded-lg transition-colors flex-shrink-0',
            template.is_featured
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-[var(--text-muted)] hover:text-yellow-400'
          )}
          title={template.is_featured ? '取消特色' : '设为特色'}
        >
          <Star className={cn('w-5 h-5', template.is_featured && 'fill-current')} />
        </button>
      </div>

      {/* 描述 */}
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 min-h-[40px]">
        {template.description}
      </p>

      {/* 统计 */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <TrendingUp className="w-4 h-4" />
          <span>{template.useCount} 次使用</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs ml-auto">
          <span>{template.questionsCount} 个题目</span>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className={cn(
          'text-xs font-medium',
          template.is_featured ? 'text-yellow-400' : 'text-[var(--text-muted)]'
        )}>
          {template.is_featured ? '✨ 特色模板' : '普通模板'}
        </span>
        <button
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
        >
          查看详情
        </button>
      </div>
    </div>
  )
}

// ============================================
// Templates Page Component
// ============================================

export default function AdminTemplatesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [featuredTemplates, setFeaturedTemplates] = useState<Set<string>>(new Set())

  // 获取预置模板
  const presetTemplates = useMemo(() => getTemplatesForShowcase(), [])

  // 为模板添加特色标记
  const templatesWithFeatured: TemplateWithFeatured[] = useMemo(() => {
    return presetTemplates.map(t => ({
      ...t,
      is_featured: featuredTemplates.has(t.id),
    }))
  }, [presetTemplates, featuredTemplates])

  const handleToggleFeatured = (id: string, featured: boolean) => {
    setFeaturedTemplates(prev => {
      const next = new Set(prev)
      if (featured) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  // 获取所有分类
  const allCategories = useMemo(() => {
    const categories = new Set(presetTemplates.map(t => t.category))
    return Array.from(categories)
  }, [presetTemplates])

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    return templatesWithFeatured.filter(t => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [templatesWithFeatured, search, categoryFilter])

  // 统计
  const stats = useMemo(() => ({
    total: presetTemplates.length,
    featured: templatesWithFeatured.filter(t => t.is_featured).length,
  }), [presetTemplates, templatesWithFeatured])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">模板管理</h1>
        <p className="text-[var(--text-secondary)]">
          管理平台预置的系统模板
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-[var(--text-muted)]">预置模板</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.featured}</p>
              <p className="text-xs text-[var(--text-muted)]">特色模板</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 搜索 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
        >
          <option value="all" className="bg-[var(--bg-secondary)]">全部分类</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat} className="bg-[var(--bg-secondary)]">
              {categoryLabels[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          显示 <span className="text-white font-medium">{filteredTemplates.length}</span> 个模板
        </span>
      </div>

      {/* 模板列表 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">没有找到匹配的模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}
    </div>
  )
}
