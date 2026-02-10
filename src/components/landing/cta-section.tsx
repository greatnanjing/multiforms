/* ============================================
   MultiForms Landing Page - CTA Section
   现代化行动号召设计
   ============================================ */

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative overflow-hidden" style={{ padding: '100px 24px' }}>
      {/* 动态背景 */}
      <div className="absolute inset-0 -z-10">
        {/* 主渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#8B5CF6]/10" />
        {/* 光晕效果 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6366F1]/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/15 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#EC4899]/10 blur-[100px]" />
      </div>

      {/* 内容 */}
      <div className="w-full max-w-3xl mx-auto relative z-10">
        {/* 主卡片 */}
        <div className="relative bg-[rgba(26,26,46,0.8)] backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899]" />

          {/* 装饰性光点 */}
          <div className="absolute top-6 left-6 w-2 h-2 bg-[#6366F1]/60 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-[#8B5CF6]/60 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className="absolute bottom-8 left-12 w-1 h-1 bg-[#EC4899]/60 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#A78BFA]" />
          </div>

          {/* Title */}
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>
            <span className="gradient-text">开始使用表单随心填</span>
          </h2>

          {/* Description */}
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            免费创建第一个表单，开启高效数据收集之旅
          </p>

          {/* CTA Button */}
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/40 hover:shadow-xl hover:shadow-[#6366F1]/60 hover:-translate-y-1 transition-all duration-300"
          >
            免费创建第一个表单
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* 底部装饰 */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              无需信用卡
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              永久免费版
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              随时取消
            </span>
          </div>

          {/* 背景装饰闪光 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
