/* ============================================
   MultiForms Landing Page - Testimonials Section
   ============================================ */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: '超级好用！1分钟就搞定了一个专业问卷，界面设计很漂亮，用户体验一流！',
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
  {
    quote: '数据分析功能太赞了，导出报告很方便，客户反馈效果也很好！',
    author: '赵六',
    role: '市场主管',
  },
  {
    quote: '客服响应很快，问题都能及时解决，整体使用体验非常好。',
    author: '孙七',
    role: 'HR经理',
  },
]

const AUTO_ROTATE_INTERVAL = 5000 // 5秒自动切换

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 下一张
  const nextTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  // 上一张
  const prevTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  // 自动轮播
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      nextTestimonial()
    }, AUTO_ROTATE_INTERVAL)

    return () => clearInterval(interval)
  }, [isPaused, nextTestimonial])

  return (
    <section className="bg-[var(--bg-secondary)]" style={{ padding: '100px 24px' }}>
      <div className="w-full max-w-[700px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-bold mb-4" style={{ fontSize: '40px' }}>用户评价</h2>
          <p className="text-lg text-[var(--text-secondary)]">听听用户怎么说</p>
        </div>

        {/* Testimonial Slider with Marquee Effect */}
        <div
          className="glass-card rounded-3xl p-12 text-center relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-t-3xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-100 ease-linear"
              style={{
                animation: isPaused ? 'none' : `marquee ${AUTO_ROTATE_INTERVAL}ms linear`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
              onAnimationEnd={() => {
                if (!isPaused) {
                  nextTestimonial()
                }
              }}
            />
          </div>

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

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-[var(--text-secondary)]"
              aria-label="上一条"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-[var(--text-secondary)]"
              aria-label="下一条"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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

      <style jsx>{`
        @keyframes marquee {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
