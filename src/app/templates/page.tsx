/* ============================================
   MultiForms Templates Page

   模板库页面：
   - 显示预置表单模板
   - 支持预览和使用模板

   路径: /templates
============================================ */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FileText, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function TemplatesPage() {
  const templates = [
    {
      id: 'survey',
      name: '满意度调查',
      description: '收集用户对产品或服务的反馈',
      icon: '📋',
      questions: 8,
      uses: '12.5k',
    },
    {
      id: 'event',
      name: '活动报名',
      description: '收集参与者信息和报名数据',
      icon: '📅',
      questions: 6,
      uses: '8.2k',
    },
    {
      id: 'feedback',
      name: '意见反馈',
      description: '收集用户意见和建议',
      icon: '💬',
      questions: 5,
      uses: '15.3k',
    },
    {
      id: 'quiz',
      name: '在线测试',
      description: '创建在线测验或考试',
      icon: '✏️',
      questions: 10,
      uses: '6.8k',
    },
    {
      id: 'poll',
      name: '投票调查',
      description: '快速创建投票或调查',
      icon: '🗳️',
      questions: 3,
      uses: '22.1k',
    },
    {
      id: 'contact',
      name: '联系表单',
      description: '网站联系表单或咨询入口',
      icon: '✉️',
      questions: 4,
      uses: '18.7k',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">模板库</h1>
          <p className="text-[var(--text-secondary)]">
            从预置模板快速创建表单，提高工作效率
          </p>
        </div>

        {/* 模板分类 */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white text-sm font-medium whitespace-nowrap">
            全部模板
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 text-sm whitespace-nowrap transition-colors">
            问卷调查
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 text-sm whitespace-nowrap transition-colors">
            活动报名
          </button>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 text-sm whitespace-nowrap transition-colors">
            意见反馈
          </button>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template) => (
            <div
              key={template.id}
              className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{template.icon}</div>
                <button className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-yellow-400 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                <span>{template.questions} 个问题</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {template.uses} 次使用
                </span>
              </div>
              <Link
                href={`/forms/new?template=${template.id}`}
                className="block w-full py-2.5 text-center rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-gradient-to-r hover:from-[var(--primary-start)] hover:to-[var(--primary-end)] hover:border-transparent transition-all"
              >
                使用此模板
              </Link>
            </div>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="glass-card p-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">需要自定义表单？</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                从空白开始创建，完全自定义您的问题和选项
              </p>
            </div>
            <Link
              href="/forms/new"
              className="ml-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              创建空白表单
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
