/* ============================================
   MultiForms Trend Chart Component

   回复趋势图组件：
   - 使用 recharts 绘制折线图
   - 时间范围筛选
   - 渐变填充效果
============================================ */

'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { TrendDataPoint, DateRange } from '@/types'

// ============================================
// Types
// ============================================

interface TrendChartProps {
  /** 趋势数据 */
  data: TrendDataPoint[]
  /** 时间范围 */
  dateRange?: DateRange
  /** 时间范围变化回调 */
  onDateRangeChange?: (range: DateRange) => void
  /** 自定义类名 */
  className?: string
}

/** 时间范围选项 */
const TIME_RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: '7d', label: '本周' },
  { value: '30d', label: '本月' },
  { value: '90d', label: '3个月' },
  { value: '1y', label: '1年' },
  { value: 'all', label: '全部' },
]

// ============================================
// Main Component
// ============================================

export function TrendChart({
  data,
  dateRange = '7d',
  onDateRangeChange,
  className,
}: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isCurrentYear = date.getFullYear() === now.getFullYear()

    if (dateRange === '7d' || dateRange === '30d') {
      // 显示月-日
      return `${date.getMonth() + 1}/${date.getDate()}`
    }

    // 显示年-月-日
    if (isCurrentYear) {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  // 处理时间范围切换
  const handleRangeChange = (range: DateRange) => {
    onDateRangeChange?.(range)
  }

  return (
    <div className={cn(
      'p-5 sm:p-6 rounded-2xl border bg-[var(--bg-secondary)] border-white/[0.08]',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          回复趋势
        </h3>

        {/* Time Filters */}
        <div className="flex gap-2">
          {TIME_RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleRangeChange(option.value)}
              className={cn(
                'px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200',
                dateRange === option.value
                  ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white border-transparent'
                  : 'text-[var(--text-secondary)] border border-white/10 hover:border-white/20'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 sm:h-52">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-start)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary-end)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary-start)" />
                  <stop offset="100%" stopColor="var(--primary-end)" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    return (
                      <div className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-white/[0.1] shadow-lg">
                        <p className="text-xs text-[var(--text-muted)] mb-1">
                          {formatDate(payload[0].payload.date)}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {payload[0].value} 次回复
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#colorLine)"
                strokeWidth={3}
                fill="url(#colorArea)"
                activeDot={{ r: 6, stroke: 'var(--primary-glow)', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
            暂无数据
          </div>
        )}
      </div>
    </div>
  )
}
