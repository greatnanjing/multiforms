/* ============================================
   MultiForms Landing Page - CTA Section
   ============================================ */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-[100px] px-6 text-center relative">
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-[800px] h-[800px] rounded-full bg-[#6366F1]/15 blur-[100px]" />
      </div>

      <div className="max-w-[700px] mx-auto relative z-10">
        <h2 className="text-4xl font-bold mb-6">
          <span className="gradient-text">开始使用 MultiForms</span>
        </h2>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          免费创建第一个表单，开启高效数据收集之旅
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-3 px-10 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-[#6366F1]/40 hover:shadow-xl hover:shadow-[#6366F1]/50 hover:-translate-y-1 transition-all duration-300 animate-pulse-slow"
        >
          免费创建第一个表单
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
