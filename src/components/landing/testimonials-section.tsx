/* ============================================
   MultiForms Landing Page - Testimonials Section
   ============================================ */

'use client'

import { useState } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: '超级好用！5分钟就搞定了一个专业问卷，界面设计很漂亮，用户体验一流！',
    author: '张三',
    role: '产品经理',
  },
  {
    quote: '我们的团队用 MultiForms 做活动投票，功能强大又简单易用，强烈推荐！',
    author: '李四',
    role: '运营总监',
  },
  {
    quote: '模板库很丰富，基本上需要的场景都有覆盖，节省了很多时间。',
    author: '王五',
    role: '创业者',
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">用户评价</h2>
          <p className="text-lg text-[var(--text-secondary)]">听听用户怎么说</p>
        </div>

        {/* Testimonial Slider */}
        <div className="glass-card rounded-3xl p-12 text-center">
          <Quote className="w-8 h-8 text-[#6366F1]/30 mb-6 mx-auto" />
          <p className="text-2xl font-medium mb-6 leading-relaxed">
            &ldquo;{testimonials[activeIndex].quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-lg font-semibold">
              {testimonials[activeIndex].author[0]}
            </div>
            <div className="text-left">
              <p className="font-semibold">{testimonials[activeIndex].author}</p>
              <p className="text-sm text-[var(--text-secondary)]">{testimonials[activeIndex].role}</p>
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-6 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]'
                  : 'w-2 bg-white/20 hover:bg-white/30'
              }`}
              aria-label={`Testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
