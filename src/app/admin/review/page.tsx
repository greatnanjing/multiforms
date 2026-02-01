/* ============================================
   MultiForms Admin Content Review Page

   内容审核页面：
   - 用户举报的内容审核
   - 待处理审核列表
   - 审核操作（批准/拒绝）

   路径: /admin/review
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Loader2,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

// ============================================
// Types
// ============================================

type ContentReview = Database['public']['Tables']['content_reviews']['Row']

// ============================================
// Components
// ============================================

function ReviewCard({
  review,
  onApprove,
  onReject
}: {
  review: ContentReview
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const statusLabels: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝'
  }

  const typeLabels: Record<string, string> = {
    inappropriate_content: '不当内容',
    spam: '垃圾信息',
    harassment: '骚扰',
    false_information: '虚假信息',
    copyright: '版权问题',
    other: '其他'
  }

  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">
              {typeLabels[review.report_type] || review.report_type}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              资源类型: {review.resource_type}
            </p>
          </div>
        </div>
        <span className={cn(
          'px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5',
          statusColors[review.status || 'pending']
        )}>
          {review.status === 'pending' && <Clock className="w-3 h-3" />}
          {statusLabels[review.status || 'pending']}
        </span>
      </div>

      {/* 举报详情 */}
      <div className="space-y-3 mb-4">
        {review.report_reason && (
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">举报原因</p>
            <p className="text-sm text-white">{review.report_reason}</p>
          </div>
        )}

        {review.resource_banned && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Shield className="w-4 h-4" />
            资源已被封禁
          </div>
        )}
      </div>

      {/* 时间信息 */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(review.created_at || '').toLocaleString('zh-CN')}
        </div>
        {review.reviewed_at && (
          <span>审核于 {new Date(review.reviewed_at).toLocaleString('zh-CN')}</span>
        )}
      </div>

      {/* 操作按钮 */}
      {review.status === 'pending' && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <button
            onClick={() => onApprove(review.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            批准举报
          </button>
          <button
            onClick={() => onReject(review.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            拒绝举报
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Review Page Component
// ============================================

export default function AdminReviewPage() {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ContentReview[]>([])

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('content_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  // 审核通过
  const handleApprove = async (reviewId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('content_reviews')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          action_taken: 'approved',
          resource_banned: true
        })
        .eq('id', reviewId)

      if (error) throw error

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, status: 'approved' as const, reviewed_at: new Date().toISOString(), action_taken: 'approved', resource_banned: true } : r
      ))
    } catch (error) {
      console.error('Failed to approve review:', error)
      alert('操作失败，请稍后重试')
    }
  }

  // 拒绝举报
  const handleReject = async (reviewId: string) => {
    const reason = prompt('请输入拒绝原因（可选）：')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('content_reviews')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reason || null
        })
        .eq('id', reviewId)

      if (error) throw error

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, status: 'rejected' as const, reviewed_at: new Date().toISOString(), review_notes: reason || null } : r
      ))
    } catch (error) {
      console.error('Failed to reject review:', error)
      alert('操作失败，请稍后重试')
    }
  }

  // 按状态分组的审核
  const pendingReviews = reviews.filter(r => r.status === 'pending')
  const processedReviews = reviews.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">内容审核</h1>
        <p className="text-[var(--text-secondary)]">
          处理用户举报的内容，维护平台安全
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">待处理</p>
              <p className="text-3xl font-bold text-yellow-400">{pendingReviews.length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400/50" />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">已批准</p>
              <p className="text-3xl font-bold text-green-400">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <Check className="w-10 h-10 text-green-400/50" />
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">已拒绝</p>
              <p className="text-3xl font-bold text-red-400">
                {reviews.filter(r => r.status === 'rejected').length}
              </p>
            </div>
            <X className="w-10 h-10 text-red-400/50" />
          </div>
        </div>
      </div>

      {/* 待处理审核 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              待处理审核
            </h2>
            {pendingReviews.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
                <Check className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">暂无待处理的审核</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 已处理审核 */}
          {processedReviews.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                已处理审核
              </h2>
              <div className="space-y-4">
                {processedReviews.slice(0, 10).map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
