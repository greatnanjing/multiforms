/* ============================================
   MultiForms - My Forms Page

   我的表单页面：
   - 显示所有表单列表
   - 支持搜索、筛选、排序
   - 快速操作：编辑、分享、分析、删除

   路径: /forms
============================================ */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ListTodo, SlidersHorizontal, Filter, X, Trash2, CheckSquare, Square } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getForms } from '@/lib/api/forms'
import { FormCard, FormCardSkeleton } from '@/components/forms/form-card'
import { useToast } from '@/components/shared/toast'
import type { FormStatus } from '@/types'
import { useConfirm } from '@/components/shared/confirm-dialog'
import type { Form } from '@/types'

// ============================================
// Filter & Sort Types
// ============================================

type SortOption = 'updated_at' | 'created_at' | 'title' | 'response_count'
type SortOrder = 'asc' | 'desc'
type StatusFilter = 'all' | 'draft' | 'published' | 'closed' | 'archived'
type DateFilterType = 'created' | 'updated'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'updated_at', label: '最近更新' },
  { value: 'created_at', label: '创建时间' },
  { value: 'title', label: '表单名称' },
  { value: 'response_count', label: '回复数量' },
]

const statusFilterOptions: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: '全部状态', color: 'text-[var(--text-secondary)]' },
  { value: 'draft', label: '待发布', color: 'text-yellow-400' },
  { value: 'published', label: '已发布', color: 'text-green-400' },
  { value: 'closed', label: '已关闭', color: 'text-red-400' },
  { value: 'archived', label: '已归档', color: 'text-gray-400' },
]

const dateFilterOptions: { value: DateFilterType; label: string }[] = [
  { value: 'created', label: '创建日期' },
  { value: 'updated', label: '更新日期' },
]

const quickDateOptions: { label: string; value: number | null }[] = [
  { label: '全部', value: null },
  { label: '今天', value: 1 },
  { label: '最近7天', value: 7 },
  { label: '最近30天', value: 30 },
  { label: '最近90天', value: 90 },
]

// ============================================
// My Forms Page Component
// ============================================

export default function MyFormsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const { confirm } = useConfirm()

  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated_at')
  const sortOrder: SortOrder = 'desc' // 固定降序，UI上暂不支持切换

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('updated')
  const [dateDays, setDateDays] = useState<number | null>(null)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // UI 状态
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // 批量选择状态
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 获取表单数据
  const fetchForms = useCallback(async () => {
    setIsLoading(true)
    try {
      // 计算日期范围
      let dateAfter: string | undefined
      let dateBefore: string | undefined

      if (dateDays !== null) {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - dateDays)
        startDate.setHours(0, 0, 0, 0)
        dateAfter = startDate.toISOString()
      } else if (customStartDate) {
        dateAfter = new Date(customStartDate).toISOString()
      }

      if (customEndDate) {
        const endDate = new Date(customEndDate)
        endDate.setHours(23, 59, 59, 999)
        dateBefore = endDate.toISOString()
      }

      const result = await getForms({
        sortBy,
        sortOrder,
        status: statusFilter,
        pageSize: 100,
        // 根据日期筛选类型传递对应的参数
        ...(dateFilterType === 'created' && {
          createdAfter: dateAfter,
          createdBefore: dateBefore,
        }),
        ...(dateFilterType === 'updated' && {
          updatedAfter: dateAfter,
          updatedBefore: dateBefore,
        }),
      })

      setForms(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('Failed to fetch forms:', error)
      toast.error('加载表单失败')
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, sortOrder, statusFilter, dateFilterType, dateDays, customStartDate, customEndDate, toast])

  useEffect(() => {
    if (isAuthenticated) {
      fetchForms()
    }
  }, [isAuthenticated, fetchForms])

  // 搜索过滤（客户端）
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 清除所有筛选
  const clearFilters = () => {
    setStatusFilter('all')
    setDateDays(null)
    setCustomStartDate('')
    setCustomEndDate('')
    setDateFilterType('updated')
  }

  // 检查是否有活动筛选
  const hasActiveFilters = statusFilter !== 'all' || dateDays !== null || customStartDate || customEndDate

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

  const handleDuplicateForm = async (formId: string) => {
    try {
      const { duplicateForm } = await import('@/lib/api/forms')
      const newForm = await duplicateForm(formId)
      toast.success('表单已复制')
      await fetchForms()
      // 可选：跳转到新表单的编辑页面
      // router.push(`/forms/${newForm.id}/edit`)
    } catch (error) {
      console.error('Failed to duplicate form:', error)
      toast.error('复制失败')
    }
  }

  // 批量选择相关
  const toggleSelectForm = (formId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(formId)) {
        newSet.delete(formId)
      } else {
        newSet.add(formId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredForms.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredForms.map(f => f.id)))
    }
  }

  const isAllSelected = filteredForms.length > 0 && selectedIds.size === filteredForms.length
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmed = await confirm({
      title: `确认删除 ${selectedIds.size} 个表单`,
      message: `确定要删除选中的 ${selectedIds.size} 个表单吗？此操作不可撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const { deleteForm } = await import('@/lib/api/forms')
      await Promise.all(Array.from(selectedIds).map(id => deleteForm(id)))
      toast.success(`已删除 ${selectedIds.size} 个表单`)
      setSelectedIds(new Set())
      setSelectionMode(false)
      await fetchForms()
    } catch (error) {
      console.error('Failed to batch delete forms:', error)
      toast.error('批量删除失败')
    }
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  // 循环切换表单状态：draft → published → archived → draft
  const handleCycleStatus = async (formId: string) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return

    const statusOrder: Record<FormStatus, FormStatus> = {
      draft: 'published',
      published: 'archived',
      archived: 'draft',
      closed: 'draft' // 添加 closed 状态的处理
    }
    const newStatus = statusOrder[form.status as FormStatus] || 'published'
    const oldStatus = form.status as FormStatus

    // 乐观更新：立即更新 UI
    setForms(forms.map(f =>
      f.id === formId ? { ...f, status: newStatus as FormStatus } : f
    ))

    try {
      const { updateForm } = await import('@/lib/api/forms')
      await updateForm(formId, { status: newStatus })
    } catch (error) {
      // 失败时回滚状态
      console.error('切换状态失败:', error)
      setForms(forms.map(f =>
        f.id === formId ? { ...f, status: oldStatus } : f
      ))
      toast.error('操作失败，请稍后重试')
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
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* 左侧：搜索框 或 选择模式提示 */}
        {selectionMode ? (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-[var(--primary-glow)]" />
              ) : isSomeSelected ? (
                <div className="w-5 h-5 relative">
                  <Square className="w-5 h-5 absolute" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[var(--primary-glow)] rounded-sm" />
                  </div>
                </div>
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">
                {selectedIds.size > 0 ? `已选 ${selectedIds.size}` : '全选'}
              </span>
            </button>
            <button
              onClick={exitSelectionMode}
              className="px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="搜索表单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        )}

        {/* 右侧操作按钮 */}
        {selectionMode ? (
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">删除 {selectedIds.size} 项</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 批量选择按钮 */}
            {filteredForms.length > 0 && (
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
                <span className="hidden sm:inline">批量管理</span>
              </button>
            )}

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors relative ${
                hasActiveFilters
                  ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">筛选</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>

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

            {/* 创建按钮 */}
            <button
              onClick={handleCreateForm}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30]"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">创建表单</span>
            </button>
          </>
        )}
      </div>

      {/* 筛选面板 */}
      {showFilterPanel && (
        <div className="glass-card p-5 space-y-5">
          {/* 面板头部 */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">筛选条件</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">表单状态</label>
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === option.value
                      ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white'
                      : 'bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 日期筛选 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">日期筛选</label>
            <div className="space-y-3">
              {/* 日期类型选择 */}
              <div className="flex gap-2">
                {dateFilterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateFilterType(option.value)
                      // 切换日期类型时重置日期筛选
                      setDateDays(null)
                      setCustomStartDate('')
                      setCustomEndDate('')
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      dateFilterType === option.value
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* 快速日期选择 */}
              <div className="flex flex-wrap gap-2">
                {quickDateOptions.map(option => (
                  <button
                    key={option.label}
                    onClick={() => {
                      setDateDays(option.value)
                      if (option.value !== null) {
                        setCustomStartDate('')
                        setCustomEndDate('')
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      dateDays === option.value && !customStartDate
                        ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white'
                        : 'bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* 自定义日期范围 */}
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value)
                    setDateDays(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <span className="text-[var(--text-muted)]">至</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value)
                    setDateDays(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-[var(--text-secondary)]">
          共 <span className="text-white font-medium">{filteredForms.length}</span> 个表单
          {totalCount > filteredForms.length && (
            <span className="text-[var(--text-muted)]"> (共 {totalCount} 个)</span>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[var(--primary-glow)] hover:underline"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 表单列表 */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/3 flex items-center justify-center">
            <ListTodo className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || hasActiveFilters ? '没有找到匹配的表单' : '还没有表单'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {searchQuery || hasActiveFilters
              ? '试试调整搜索关键词或筛选条件'
              : '创建您的第一个表单，开始收集数据'
            }
          </p>
          {!searchQuery && !hasActiveFilters && (
            <button
              onClick={handleCreateForm}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/30]"
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
              onCycleStatus={(e) => {
                e.stopPropagation()
                handleCycleStatus(form.id)
              }}
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
              onDuplicate={(e) => {
                e.stopPropagation()
                handleDuplicateForm(form.id)
              }}
              onDelete={(e) => {
                e.stopPropagation()
                handleDeleteForm(form.id)
              }}
              selectionMode={selectionMode}
              selected={selectedIds.has(form.id)}
              onSelect={() => toggleSelectForm(form.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
