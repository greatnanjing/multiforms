/* ============================================
   MultiForms Stats Card Component

   统计卡片组件：
   - 显示统计数值
   - 趋势指示器
   - 悬停效果
============================================ */

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

// ============================================
// Types
// ============================================

interface StatsCardProps {
  /** 标签 */
  label: string
  /** 数值 */
  value: string | number
  /** 趋势（正数表示增长，负数表示下降） */
  trend?: number
  /** 单位 */
  unit?: string
  /** 自定义类名 */
  className?: string
}

// ============================================
// Main Component
// ============================================

export function StatsCard({ label, value, trend, unit = '', className }: StatsCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <div
      className={cn(
        'relative p-5 sm:p-6 rounded-2xl border',
        'bg-[var(--bg-secondary)] border-white/[0.08]',
        'transition-all duration-300 hover:-translate-y-1',
        'hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10',
        className
      )}
    >
      {/* Label */}
      <div className="text-sm text-[var(--text-secondary)] mb-2">
        {label}
      </div>

      {/* Value */}
      <div className="text-3xl sm:text-4xl font-bold mb-1" style={{
        fontFamily: 'Space Grotesk, sans-serif',
        background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {displayValue}{unit}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 text-xs',
          trend >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
  )
}
