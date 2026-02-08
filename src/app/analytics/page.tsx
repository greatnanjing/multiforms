/* ============================================
   MultiForms Analytics Page

   数据分析页面：
   - 查看所有表单的数据统计
   - 响应趋势分析

   路径: /analytics
============================================ */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">0</div>
            <div className="text-sm text-[var(--text-secondary)]">表单总数</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">0</div>
            <div className="text-sm text-[var(--text-secondary)]">总回复数</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">0%</div>
            <div className="text-sm text-[var(--text-secondary)]">平均完成率</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">-</div>
            <div className="text-sm text-[var(--text-secondary)]">今日回复</div>
          </div>
        </div>

        {/* 空状态 */}
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/3 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无数据</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            创建表单并收集数据后，这里将显示详细的分析报告
          </p>
          <Link
            href="/forms/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-250 hover:translate-y-[-2px]"
          >
            创建第一个表单
          </Link>
        </div>

        {/* 表单数据列表 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">表单数据概览</h2>
          <div className="glass-card divide-y divide-white/5">
            <div className="p-4 text-center text-[var(--text-muted)]">
              暂无表单数据
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
