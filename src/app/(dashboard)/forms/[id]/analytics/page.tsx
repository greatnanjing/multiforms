/* ============================================
   MultiForms Analytics Page

   数据统计页面：
   - 顶部导航（返回、标题、操作按钮）
   - 统计卡片（总回复数、完成率、平均耗时、今日新增）
   - 回复趋势图（折线图）
   - 题目统计（选择题柱状图、评分题星级分布）
   - 原始数据表格（分页、导出）
============================================ */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFormById } from '@/lib/api/forms'
import {
  getFormStats,
  getResponseTrend,
  getQuestionStats,
  getSubmissions,
  exportSubmissions,
} from '@/lib/api/analytics'
import { StatsCard, TrendChart, QuestionStatsCard, DataTable } from '@/components/analytics'
import type { FormQuestion, DateRange } from '@/types'

// ============================================
// Main Component
// ============================================

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  // State
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState<any>(null)

  // Trend
  const [dateRange, setDateRange] = useState<DateRange>('7d')
  const [trendData, setTrendData] = useState<any[]>([])

  // Question Stats
  const [questionStats, setQuestionStats] = useState<any[]>([])

  // Submissions
  const [submissions, setSubmissions] = useState<any[]>([])
  const [submissionTotal, setSubmissionTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Export
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Questions (for table columns)
  const [questions, setQuestions] = useState<FormQuestion[]>([])

  // ============================================
  // Data Loading
  // ============================================

  const loadForm = useCallback(async () => {
    try {
      setLoading(true)
      const formData = await getFormById(formId)
      setForm(formData)
    } catch (err: any) {
      setError(err.message || '获取表单失败')
    } finally {
      setLoading(false)
    }
  }, [formId])

  const loadStats = useCallback(async () => {
    try {
      const data = await getFormStats({ formId })
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }, [formId])

  const loadTrend = useCallback(async () => {
    try {
      const data = await getResponseTrend({ formId, dateRange })
      setTrendData(data)
    } catch (err: any) {
      console.error('Failed to load trend:', err)
    }
  }, [formId, dateRange])

  const loadQuestionStats = useCallback(async () => {
    try {
      const data = await getQuestionStats({ formId })
      setQuestionStats(data)

      // Also store questions for table
      // We need to fetch questions separately for the table
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: questionsData } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true })

      setQuestions(questionsData || [])
    } catch (err: any) {
      console.error('Failed to load question stats:', err)
    }
  }, [formId])

  const loadSubmissions = useCallback(async (page: number) => {
    try {
      const data = await getSubmissions({
        formId,
        page,
        pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      setSubmissions(data.data)
      setSubmissionTotal(data.total)
    } catch (err: any) {
      console.error('Failed to load submissions:', err)
    }
  }, [formId])

  useEffect(() => {
    loadForm()
    loadStats()
    loadTrend()
    loadQuestionStats()
    loadSubmissions(1)
  }, [loadForm, loadStats, loadTrend, loadQuestionStats, loadSubmissions])

  // ============================================
  // Handlers
  // ============================================

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    loadSubmissions(page)
  }, [loadSubmissions])

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)
      setExportSuccess(false)

      const csv = await exportSubmissions({ formId, pageSize: submissionTotal, questions })

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${form?.title || 'form'}_responses.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (err: any) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [formId, form, submissionTotal, questions])

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/f/${form?.short_id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      // TODO: Show toast notification
      console.log('Link copied!')
    }
  }, [form])

  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // Error State
  // ============================================

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-[var(--bg-secondary)] text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            无法访问表单
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {error || '表单不存在'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className={cn(
              'px-6 py-2.5 rounded-xl text-sm font-medium',
              'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
              'hover:opacity-90 transition-opacity'
            )}
          >
            返回仪表盘
          </button>
        </div>
      </div>
    )
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-[rgba(15,15,35,0.8)] backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-glow)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">返回</span>
          </button>

          {/* Form Title */}
          <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-md" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {form.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || submissionTotal === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              'bg-white/5 text-[var(--text-secondary)] border border-white/10',
              'hover:bg-white/10 hover:text-[var(--text-primary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <>
                <Download className="w-4 h-4 animate-spin" />
                导出中...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                已导出
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出数据</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white',
              'hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20'
            )}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">分享结果</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label="总回复数"
            value={stats?.total_responses || 0}
          />
          <StatsCard
            label="完成率"
            value={stats?.completion_rate || 0}
            unit="%"
          />
          <StatsCard
            label="平均耗时"
            value={stats?.avg_duration ? `${Math.floor(stats.avg_duration / 60)}:${String(stats.avg_duration % 60).padStart(2, '0')}` : '-'}
          />
          <StatsCard
            label="今日新增"
            value={stats?.responses_today || 0}
          />
        </div>

        {/* Chart Section */}
        <div className="mb-6">
          <TrendChart
            data={trendData}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Question Stats */}
        {questionStats.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            {questionStats.map((qStats, index) => (
              <QuestionStatsCard
                key={qStats.question_id}
                stats={qStats}
                index={index + 1}
              />
            ))}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          submissions={submissions}
          questions={questions}
          total={submissionTotal}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>
    </div>
  )
}
