/* ============================================
   MultiForms Admin Templates Page

   模板管理页面：
   - 模板库管理
   - 模板启用/禁用
   - 特色标记
   - 使用统计

   路径: /admin/templates
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Star,
  Eye,
  TrendingUp,
  Plus,
  Loader2,
  FolderOpen,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

// ============================================
// Types
// ============================================

type Template = Database['public']['Tables']['templates']['Row']

const categoryLabels: Record<string, string> = {
  vote: '投票',
  survey: '问卷',
  rating: '评分',
  feedback: '反馈',
  collection: '收集'
}

// ============================================
// Components
// ============================================

function TemplateCard({
  template,
  onToggleFeatured,
  onToggleActive
}: {
  template: Template
  onToggleFeatured: (id: string, featured: boolean) => void
  onToggleActive: (id: string, active: boolean) => void
}) {
  return (
    <div className={cn(
      'p-5 rounded-2xl border transition-all',
      template.is_active
        ? 'bg-white/5 border-white/10 hover:bg-white/10'
        : 'bg-white/5 border-white/5 opacity-60'
    )}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
            {template.category === 'vote' && '🗳️'}
            {template.category === 'survey' && '📋'}
            {template.category === 'rating' && '⭐'}
            {template.category === 'feedback' && '💬'}
            {template.category === 'collection' && '📝'}
          </div>
          <div>
            <h3 className="text-white font-medium">{template.title}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {categoryLabels[template.category]}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleFeatured(template.id, !!template.is_featured)}
          className={cn(
            'p-2 rounded-lg transition-colors',
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
      {template.description && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
          {template.description}
        </p>
      )}

      {/* 统计 */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <TrendingUp className="w-4 h-4" />
          <span>{template.use_count || 0} 次使用</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
          <Calendar className="w-3 h-3" />
          <span>{new Date(template.created_at || '').toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 状态开关 */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className={cn(
          'text-xs font-medium',
          template.is_active ? 'text-green-400' : 'text-[var(--text-muted)]'
        )}>
          {template.is_active ? '已启用' : '已禁用'}
        </span>
        <button
          onClick={() => onToggleActive(template.id, !template.is_active)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors',
            template.is_active ? 'bg-green-500' : 'bg-gray-600'
          )}
        >
          <span className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            template.is_active ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Templates Page Component
// ============================================

export default function AdminTemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_featured: featured })
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.map(t =>
        t.id === id ? { ...t, is_featured: featured } : t
      ))
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('templates')
        .update({ is_active: active })
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.map(t =>
        t.id === id ? { ...t, is_active: active } : t
      ))
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const filteredTemplates = templates.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">模板管理</h1>
          <p className="text-[var(--text-secondary)]">
            管理平台模板库，控制模板显示
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-purple-500/30">
          <Plus className="w-4 h-4" />
          添加模板
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索模板..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* 统计 */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[var(--text-secondary)]">
          共 <span className="text-white font-medium">{filteredTemplates.length}</span> 个模板
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          特色 <span className="text-yellow-400 font-medium">{templates.filter(t => t.is_featured).length}</span>
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          已启用 <span className="text-green-400 font-medium">{templates.filter(t => t.is_active).length}</span>
        </span>
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">暂无模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggleFeatured={handleToggleFeatured}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
