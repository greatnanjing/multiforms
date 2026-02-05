/* ============================================
   MultiForms - My Forms Page

   我的表单页面：
   - 显示所有表单列表
   - 支持搜索、筛选、排序
   - 快速操作：编辑、分享、分析、删除

   路径: /forms
============================================ */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getForms } from '@/lib/api/forms'
import { FormCard, FormCardSkeleton } from '@/components/forms/form-card'
import { useToast } from '@/components/shared/toast'
import { useConfirm } from '@/components/shared/confirm-dialog'
import type { Form } from '@/types'

// ============================================
// Sort Options
// ============================================

type SortOption = 'updated_at' | 'created_at' | 'title' | 'response_count'
type SortOrder = 'asc' | 'desc'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'updated_at', label: '最近更新' },
  { value: 'created_at', label: '创建时间' },
  { value: 'title', label: '表单名称' },
  { value: 'response_count', label: '回复数量' },
]

// ============================================
// My Forms Page Component
// ============================================

export default function MyFormsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const { confirm } = useConfirm()

  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 获取表单数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchForms()
    }
  }, [isAuthenticated, sortBy, sortOrder])

  const fetchForms = async () => {
    setIsLoading(true)
    try {
      const result = await getForms({
        sortBy,
        sortOrder,
        pageSize: 100, // 获取全部表单
      })

      setForms(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('Failed to fetch forms:', error)
      toast.error('加载表单失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 搜索过滤
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      toast.error('复制失败')
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

    if (!confirmed) return

    try {
      const { deleteForm } = await import('@/lib/api/forms')
      await deleteForm(formId)
      toast.success('表单已删除')
      await fetchForms()
    } catch (error) {
      console.error('Failed to delete form:', error)
      toast.error('删除失败')
    }
  }

  // 加载状态
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        {/* 头部骨架 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-white/5 rounded-full animate-pulse" />
            <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-36 bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* 搜索栏骨架 */}
        <div className="glass-card p-4">
          <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
        </div>

        {/* 表单列表骨架 */}
        <FormCardSkeleton count={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </button>
          <h1 className="text-2xl font-semibold text-white mb-1">我的表单</h1>
          <p className="text-[var(--text-secondary)]">
            共 {totalCount} 个表单
          </p>
        </div>
        <button
          onClick={handleCreateForm}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30"
        >
          <Plus className="w-5 h-5" />
          创建新表单
        </button>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="搜索表单..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* 排序按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">
              {sortOptions.find(o => o.value === sortBy)?.label}
            </span>
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl overflow-hidden z-20">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setShowSortMenu(false)
                    }}
                    className={`
                      w-full px-4 py-3 text-left text-sm transition-colors
                      ${sortBy === option.value
                        ? 'text-white bg-white/10'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 表单列表 */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/3 flex items-center justify-center">
            <FileText className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? '没有找到匹配的表单' : '还没有表单'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {searchQuery ? '试试其他搜索关键词' : '创建您的第一个表单，开始收集数据'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateForm}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30"
            >
              <Plus className="w-5 h-5" />
              创建第一个表单
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredForms.map((form) => (
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
    </div>
  )
}
