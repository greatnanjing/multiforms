/* ============================================
   MultiForms Admin Forms Page

   表单管理页面：
   - 平台所有表单列表
   - 表单状态管理
   - 内容审核
   - 数据统计

   路径: /admin/forms
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Eye,
  Trash2,
  BarChart3,
  Calendar,
  User,
  Filter,
  Loader2,
  ListTodo,
  TrendingUp,
  Archive,
  Vote,
  ClipboardList,
  Star,
  MessageSquare,
  FileEdit,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface Form {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  short_id: string
  user_id: string
  view_count: number
  response_count: number
  question_count: number
  created_at: string
  published_at: string | null
  profiles?: {
    email: string
    nickname: string | null
  }
}

interface FilterState {
  search: string
  status: string
  type: string
}

// ============================================
// Components
// ============================================

function FormCard({
  form,
  onView,
  onStats,
  onDelete,
  onCycleStatus,
  selectionMode = false,
  selected = false,
  onSelect,
}: {
  form: Form
  onView: (id: string) => void
  onStats: (id: string) => void
  onDelete: (id: string) => void
  onCycleStatus: (id: string) => void
  selectionMode?: boolean
  selected?: boolean
  onSelect?: () => void
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    archived: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  const statusLabels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }

  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    vote: Vote,
    survey: ClipboardList,
    rating: Star,
    feedback: MessageSquare,
    collection: FileEdit,
    default: ListTodo
  }

  const TypeIcon = typeIcons[form.type] || typeIcons.default

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect?.()
    }
  }

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white/5 border transition-all hover:scale-[1.01] cursor-pointer',
        selectionMode
          ? 'border-white/10 hover:border-purple-500/30'
          : 'border-white/10 hover:bg-white/10',
        selected && 'border-purple-500/50 bg-purple-500/5'
      )}
      onClick={handleCardClick}
    >
      {/* 选择框（选择模式） */}
      {selectionMode && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.()
            }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center transition-all duration-200 hover:bg-white/10 group"
          >
            {selected ? (
              <CheckSquare className="w-5 h-5 text-purple-400" />
            ) : (
              <Square className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      )}

      {/* 头部 */}
      <div className={cn('flex items-start justify-between', selectionMode && 'mb-4', !selectionMode && 'mb-4')}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <TypeIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium line-clamp-1">{form.title}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {form.profiles?.nickname || form.profiles?.email || '未知用户'}
            </p>
          </div>
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-lg border text-xs font-medium',
          statusColors[form.status] || statusColors.draft
        )}>
          {statusLabels[form.status] || form.status}
        </span>
      </div>

      {/* 描述 */}
      {form.description && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
          {form.description}
        </p>
      )}

      {/* 统计数据 */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Eye className="w-4 h-4" />
          <span>{form.view_count || 0} 浏览</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <TrendingUp className="w-4 h-4" />
          <span>{form.response_count || 0} 提交</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <FileEdit className="w-4 h-4" />
          <span>{form.question_count || 0} 题</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          <Calendar className="w-3 h-3" />
          <span>{new Date(form.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      {!selectionMode && (
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <button
            onClick={() => onView(form.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            查看
          </button>
          <button
            onClick={() => onStats(form.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            数据
          </button>
          <button
            onClick={() => onCycleStatus(form.id)}
            className="p-2 rounded-lg hover:bg-amber-500/10 text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
            title="切换状态"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(form.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
            title="删除表单"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Delete Confirmation Modal
// ============================================

interface DeleteModalProps {
  isOpen: boolean
  formTitle: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteModal({ isOpen, formTitle, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">确认删除</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-[var(--text-secondary)] mb-2">
              您确定要删除这个表单吗？
            </p>
            <p className="text-white font-medium truncate">
              "{formTitle}"
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-3">
              此操作不可恢复，表单及其所有提交数据将被永久删除。
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/5 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              确认删除
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================
// Forms Page Component
// ============================================

export default function AdminFormsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<Form[]>([])

  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    type: 'all'
  })

  // 批量选择状态
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 删除确认状态
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; formId: string; formTitle: string }>({
    isOpen: false,
    formId: '',
    formTitle: ''
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('forms')
        .select(`
          *,
          profiles (email, nickname),
          form_questions (id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      // 添加题目数量
      const formsWithCount = (data || []).map((form: any) => ({
        ...form,
        question_count: form.form_questions?.length || 0
      }))
      setForms(formsWithCount)
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤表单
  const filteredForms = forms.filter(form => {
    const matchSearch =
      !filters.search ||
      form.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      form.description?.toLowerCase().includes(filters.search.toLowerCase())

    const matchStatus = filters.status === 'all' || form.status === filters.status
    const matchType = filters.type === 'all' || form.type === filters.type

    return matchSearch && matchStatus && matchType
  })

  // 打开删除确认弹窗
  const openDeleteModal = (formId: string, formTitle: string) => {
    setDeleteModal({ isOpen: true, formId, formTitle })
  }

  // 关闭删除确认弹窗
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, formId: '', formTitle: '' })
  }

  // 确认删除表单
  const confirmDelete = async () => {
    const { formId } = deleteModal

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)

      if (error) throw error

      // 更新本地状态
      setForms(forms.filter(f => f.id !== formId))
      setDeleteModal({ isOpen: false, formId: '', formTitle: '' })
    } catch (error) {
      console.error('Failed to delete form:', error)
      alert('删除失败，请稍后重试')
    }
  }

  // 确认删除弹窗
  const confirmDeleteModal = async () => {
    const { formId } = deleteModal

    // 如果是批量删除（formId包含逗号）
    if (formId.includes(',')) {
      await confirmBatchDelete()
    } else {
      await confirmDelete()
    }
  }

  // 删除表单（旧函数，保留用于批量删除）
  const handleDelete = async (formId: string) => {
    const form = forms.find(f => f.id === formId)
    if (form) {
      openDeleteModal(formId, form.title)
    }
  }

  // 循环切换表单状态：draft → published → archived → draft
  const handleCycleStatus = async (formId: string) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return

    const statusOrder: Record<string, string> = {
      draft: 'published',
      published: 'archived',
      archived: 'draft'
    }
    const newStatus = statusOrder[form.status] || 'published'
    const oldStatus = form.status

    // 乐观更新：立即更新 UI
    setForms(forms.map(f =>
      f.id === formId ? { ...f, status: newStatus } : f
    ))

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forms')
        .update({ status: newStatus })
        .eq('id', formId)

      if (error) throw error
    } catch (error) {
      // 失败时回滚状态
      console.error('Failed to cycle status:', error)
      setForms(forms.map(f =>
        f.id === formId ? { ...f, status: oldStatus } : f
      ))
      alert('操作失败，请稍后重试')
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

    // 使用第一个表单的标题作为提示
    const firstForm = forms.find(f => selectedIds.has(f.id))
    openDeleteModal(
      Array.from(selectedIds).join(','),
      selectedIds.size === 1
        ? firstForm?.title || ''
        : `选中的 ${selectedIds.size} 个表单`
    )
  }

  // 批量删除确认（实际执行）
  const confirmBatchDelete = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('forms')
        .delete()
        .in('id', Array.from(selectedIds))

      if (error) throw error

      // 更新本地状态
      setForms(forms.filter(f => !selectedIds.has(f.id)))
      setSelectedIds(new Set())
      setSelectionMode(false)
      setDeleteModal({ isOpen: false, formId: '', formTitle: '' })
    } catch (error) {
      console.error('Failed to batch delete forms:', error)
      alert('批量删除失败，请稍后重试')
    }
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-6">
      {/* 页面描述和批量操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[var(--text-secondary)]">
            管理和审核平台上的所有表单
          </p>
        </div>

        {/* 批量操作按钮 */}
        {filteredForms.length > 0 && !selectionMode && (
          <button
            onClick={() => setSelectionMode(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
          >
            <CheckSquare className="w-5 h-5" />
            批量管理
          </button>
        )}

        {/* 选择模式操作栏 */}
        {selectionMode && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-purple-400" />
              ) : isSomeSelected ? (
                <div className="w-5 h-5 relative">
                  <Square className="w-5 h-5 absolute" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-sm" />
                  </div>
                </div>
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span>
                {selectedIds.size > 0 ? `已选 ${selectedIds.size}` : '全选'}
              </span>
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                删除 {selectedIds.size} 项
              </button>
            )}
            <button
              onClick={exitSelectionMode}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="搜索表单标题或描述..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* 筛选按钮组 */}
        <div className="flex gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all" className="bg-[var(--bg-secondary)] text-white">所有状态</option>
            <option value="draft" className="bg-[var(--bg-secondary)] text-white">草稿</option>
            <option value="published" className="bg-[var(--bg-secondary)] text-white">已发布</option>
            <option value="archived" className="bg-[var(--bg-secondary)] text-white">已归档</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all" className="bg-[var(--bg-secondary)] text-white">所有类型</option>
            <option value="vote" className="bg-[var(--bg-secondary)] text-white">投票</option>
            <option value="survey" className="bg-[var(--bg-secondary)] text-white">问卷</option>
            <option value="rating" className="bg-[var(--bg-secondary)] text-white">评分</option>
            <option value="feedback" className="bg-[var(--bg-secondary)] text-white">反馈</option>
            <option value="collection" className="bg-[var(--bg-secondary)] text-white">收集</option>
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          共 <span className="text-white font-medium">{filteredForms.length}</span> 个表单
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          草稿 <span className="text-gray-400 font-medium">{forms.filter(f => f.status === 'draft').length}</span>
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          已发布 <span className="text-green-400 font-medium">{forms.filter(f => f.status === 'published').length}</span>
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          已归档 <span className="text-yellow-400 font-medium">{forms.filter(f => f.status === 'archived').length}</span>
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          总提交 <span className="text-purple-400 font-medium">{forms.reduce((sum, f) => sum + (f.response_count || 0), 0)}</span>
        </span>
      </div>

      {/* 表单列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <ListTodo className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">没有找到匹配的表单</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredForms.map(form => (
            <FormCard
              key={form.id}
              form={form}
              onView={(id) => router.push(`/f/${form.short_id}?preview=readonly`)}
              onStats={(id) => router.push(`/admin/forms/${id}/stats`)}
              onDelete={handleDelete}
              onCycleStatus={handleCycleStatus}
              selectionMode={selectionMode}
              selected={selectedIds.has(form.id)}
              onSelect={() => toggleSelectForm(form.id)}
            />
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        formTitle={deleteModal.formTitle}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteModal}
      />
    </div>
  )
}
