/* ============================================
   MultiForms Landing Page - Hero Section
   简洁版 - 只保留标题和表单预览
   ============================================ */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, ArrowRight, LayoutGrid, ThumbsUp, Calendar, Users, MessageSquare, Vote, Sparkles, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

// 表单预览数据
const formPreviews = [
  {
    title: '产品满意度调研',
    description: '请告诉我们您对产品的看法',
    question: '您使用多久了？',
    options: ['不到1个月', '1-6个月', '6个月以上'],
    icon: ThumbsUp,
    color: 'from-[#EC4899] to-[#F472B6]',
  },
  {
    title: '活动报名表',
    description: '填写信息完成活动报名',
    question: '您的姓名是？',
    options: ['张三', '李四', '王五'],
    icon: Users,
    color: 'from-[#0EA5E9] to-[#06B6D4]',
  },
  {
    title: '意见反馈收集',
    description: '我们重视您的每一条建议',
    question: '您认为需要改进的是？',
    options: ['功能体验', '界面设计', '性能速度'],
    icon: MessageSquare,
    color: 'from-[#A855F7] to-[#C084FC]',
  },
  {
    title: '会议预约表单',
    description: '选择合适的时间预约会议',
    question: '您希望的时间是？',
    options: ['周一上午', '周二下午', '周三全天'],
    icon: Calendar,
    color: 'from-[#10B981] to-[#34D399]',
  },
  {
    title: '年度最佳员工投票',
    description: '选出您心中的年度最佳员工',
    question: '请选择一位候选人',
    options: ['张伟 - 技术部', '李娜 - 市场部', '王强 - 产品部'],
    icon: Vote,
    color: 'from-[#F59E0B] to-[#FBBF24]',
  },
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // 处理"免费使用"点击
  const handleStartClick = () => {
    if (isAuthenticated) {
      router.push('/forms')
    } else {
      router.push('/register')
    }
  }

  // 自动轮播 - 2秒切换
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % formPreviews.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const currentForm = formPreviews[currentIndex]
  const IconComponent = currentForm.icon

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ height: '100vh', paddingTop: 'max(80px, 12vh)' }}
    >
      {/* 动态背景 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366F1]/15 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* 主内容区 - 双栏布局 */}
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 左侧 - 文字内容 */}
          <div className="text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#A78BFA] text-sm mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              永久免费，无任何套路
            </div>

            {/* Title */}
            <h1
              className="font-bold mb-5 leading-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
            >
              <span className="gradient-text">1分钟创建</span>
              <br />
              <span className="text-white">专业表单</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed max-w-md">
              投票 · 评分 · 问卷 · 调研 · 报名 · 订单 · 意见征集
              <br />
              轻松创建，快速收集，即刻洞察
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleStartClick}
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/50 hover:-translate-y-0.5 transition-all duration-300"
              >
                免费使用
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium rounded-2xl border-2 border-white/20 text-white hover:border-[#6366F1] hover:bg-[#6366F1]/10 transition-all duration-300"
              >
                <LayoutGrid className="w-5 h-5" />
                浏览模板
              </a>
            </div>
          </div>

          {/* 右侧 - 表单预览轮播 */}
          <div className="relative w-[448px] mx-auto lg:mx-0 lg:ml-auto">
            {/* 背景装饰 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 rounded-3xl blur-2xl" />

            {/* 表单预览卡片 */}
            <div className="relative w-full bg-[rgba(26,26,46,0.8)] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
              {/* 顶部标题栏 */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentForm.color} flex items-center justify-center`}>
                  {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{currentForm.title}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{currentForm.description}</p>
                </div>
                {/* 状态指示灯 */}
                <div className="ml-auto flex gap-1.5">
                  {formPreviews.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? `w-6 bg-gradient-to-r ${currentForm.color}` : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 问题区域 */}
              <div className="space-y-2.5 mb-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  {currentForm.question}
                </p>
                {currentForm.options.map((option, idx) => (
                  <div
                    key={option}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)]/50 border border-white/5 rounded-xl transition-all duration-500"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors bg-gradient-to-br ${currentForm.color} border-transparent flex-shrink-0`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white truncate">{option}</span>
                  </div>
                ))}
              </div>

              {/* 提交按钮 */}
              <div className="mt-auto flex justify-center">
                <button
                  className={`px-12 py-3 rounded-xl bg-gradient-to-r ${currentForm.color} text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
                >
                  提交
                </button>
              </div>

              {/* 装饰性闪光效果 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
