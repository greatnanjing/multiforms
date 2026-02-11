/* ============================================
   MultiForms Data Table Component

   原始数据表格组件：
   - 分页展示
   - 导出功能
   - 格式化显示
   - AI 智能分析列
============================================ */

'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  CheckCircle2,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormSubmission, FormQuestion } from '@/types'

// ============================================
// Types
// ============================================

interface DataTableProps {
  /** 提交数据 */
  submissions: FormSubmission[]
  /** 题目列表 */
  questions: FormQuestion[]
  /** 总数 */
  total: number
  /** 当前页 */
  currentPage: number
  /** 每页数量 */
  pageSize: number
  /** 页码变化 */
  onPageChange: (page: number) => void
  /** 导出回调 */
  onExport?: () => void
  /** 是否正在导出 */
  isExporting?: boolean
}

// ============================================
// Helper Functions
// ============================================

/** 格式化答案显示 */
function formatAnswerValue(value: any, questionType: string): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (questionType === 'rating') {
    const stars = '★'.repeat(Number(value))
    const emptyStars = '☆'.repeat(5 - Number(value))
    return `<span class="text-amber-400">${stars}${emptyStars}</span>`
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  const str = String(value)
  return str.length > 50 ? `${str.slice(0, 50)}...` : str
}

/** 格式化时间 */
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/** 格式化时长 */
function formatDuration(seconds: number | null): string {
  if (seconds === null) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/** AI 分析状态显示 */
function AnalysisStatus({ submission }: { submission: FormSubmission }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (submission.ai_analysis_status === 'processing' || submission.ai_analysis_status === 'pending') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
        <span>分析中</span>
      </div>
    )
  }

  if (submission.ai_analysis_status === 'failed') {
    return (
      <div className="text-xs text-[var(--text-muted)]">
        分析失败
      </div>
    )
  }

  if (!submission.ai_analysis) {
    return (
      <div className="text-xs text-[var(--text-muted)]">
        -
      </div>
    )
  }

  const analysis = submission.ai_analysis
  const isLong = analysis.length > 60
  const displayText = isLong && !isExpanded ? analysis.slice(0, 60) + '...' : analysis

  return (
    <div className="group">
      <div className="flex items-start gap-2">
        <Sparkles className="w-3.5 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-primary)] leading-relaxed">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  收起
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  展开
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function DataTable({
  submissions,
  questions,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onExport,
  isExporting = false,
}: DataTableProps) {
  const totalPages = Math.ceil(total / pageSize)
  const [showAnalysis, setShowAnalysis] = useState(true)

  // Check if any submission has AI analysis
  const hasAnalysis = submissions.some(s => s.ai_analysis)

  return (
    <div className="p-5 sm:p-6 rounded-2xl border bg-[var(--bg-secondary)] border-white/[0.08]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          查看原始回复
        </h3>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Toggle AI Analysis */}
          {hasAnalysis && (
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                showAnalysis
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-[var(--text-secondary)] border border-white/10'
              )}
            >
              <Sparkles className="w-3.5 h-3" />
              AI 分析
            </button>
          )}

          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              disabled={isExporting || submissions.length === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'bg-white/5 text-[var(--text-secondary)] border border-white/10',
                'hover:bg-white/10 hover:text-[var(--text-primary)]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isExporting ? (
                <>
                  <FileDown className="w-4 h-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  导出全部
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-muted)]">
          <FileDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无回复数据</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full min-w-[600px] sm:min-w-0">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                    回复时间
                  </th>
                  <th className="px-5 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                    耗时
                  </th>
                  {questions.slice(0, 3).map(q => (
                    <th key={q.id} className="px-5 py-3 text-left text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                      {q.question_text.length > 15
                        ? `${q.question_text.slice(0, 15)}...`
                        : q.question_text}
                    </th>
                  ))}
                  {showAnalysis && hasAnalysis && (
                    <th className="px-5 py-3 text-left text-xs sm:text-sm font-medium text-indigo-300">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3" />
                        AI 分析
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-[var(--text-primary)]">
                      {formatDateTime(submission.created_at)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                      {formatDuration(submission.duration_seconds)}
                    </td>
                    {questions.slice(0, 3).map(q => {
                      const answer = submission.answers[q.id]
                      return (
                        <td key={q.id} className="px-5 py-3 text-sm text-[var(--text-primary)]">
                          {q.question_type === 'rating' ? (
                            <span className="text-amber-400">
                              {'★'.repeat(Number(answer) || 0)}
                              {'☆'.repeat(5 - (Number(answer) || 0))}
                            </span>
                          ) : (
                            <span className="block max-w-[200px] truncate">
                              {formatAnswerValue(answer, q.question_type)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    {showAnalysis && hasAnalysis && (
                      <td className="px-5 py-3">
                        <AnalysisStatus submission={submission} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.08]">
              <div className="text-sm text-[var(--text-muted)]">
                共 {total} 条记录，第 {currentPage} / {totalPages} 页
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={cn(
                          'min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors',
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
