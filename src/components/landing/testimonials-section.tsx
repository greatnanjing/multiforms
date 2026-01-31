/* ============================================
   MultiForms Landing Page - Testimonials Section
   ============================================ */

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
  return (
    <section className="py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">用户评价</h2>
          <p className="text-lg text-[var(--text-secondary)]">听听用户怎么说</p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`glass-card rounded-3xl p-8 ${
                index === 1 ? 'md:col-span-1 md:row-span-1' : ''
              }`}
            >
              <Quote className="w-8 h-8 text-[#6366F1]/30 mb-4" />
              <p className="text-lg font-medium mb-6 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-lg font-semibold">
                  {item.author[0]}
                </div>
                <div>
                  <p className="font-semibold">{item.author}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
