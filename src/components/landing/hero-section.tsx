/* ============================================
   MultiForms Landing Page - Hero Section
   ============================================ */

import Link from 'next/link'
import { FileText, Star, ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '100vh', padding: '120px 24px 80px' }}
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#6366F1]/15 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#EC4899]/5 blur-[120px]" />
        </div>
      </div>

      <div className="w-full max-w-[800px] mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#A78BFA] text-sm mb-6">
          <Star className="w-4 h-4 fill-current" />
          免费开始，无需信用卡
        </div>

        {/* Title */}
        <h1 className="font-bold mb-4 leading-tight" style={{ fontSize: '56px' }}>
          <span className="gradient-text">5分钟创建</span>专业表单
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-[var(--text-secondary)] mb-10">
          投票 · 评分 · 问卷 · 信息收集
          <br className="hidden sm:block" />
          拖拽式操作，无需任何代码
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            开始免费使用
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium rounded-2xl border-2 border-white/20 text-white hover:border-[#6366F1] hover:text-[#A78BFA] transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            观看演示
          </a>
        </div>

        {/* Form Preview */}
        <div className="bg-[rgba(26,26,46,0.6)] backdrop-blur-xl border border-white/8 rounded-3xl p-10 mx-auto" style={{ maxWidth: '700px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-[var(--bg-primary)] rounded-2xl p-8 text-left">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">产品满意度调研</h3>
              <p className="text-sm text-[var(--text-secondary)]">请告诉我们您对产品的看法</p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium mb-3">1. 您使用多久了？</p>
              {['不到1个月', '1-6个月', '6-12个月'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] border border-white/5 rounded-lg cursor-pointer hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all"
                >
                  <input
                    type="radio"
                    name="q1"
                    className="w-[18px] h-[18px] accent-[#6366F1]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-medium hover:opacity-90 transition-opacity">
              提交
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
