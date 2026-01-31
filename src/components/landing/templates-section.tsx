/* ============================================
   MultiForms Landing Page - Templates Section
   ============================================ */

import { ThumbsUp, MessageSquare, Star, ClipboardList, HelpCircle, Calendar, Users, Tag } from 'lucide-react'
import Link from 'next/link'

const templates = [
  { icon: ThumbsUp, title: '活动投票', type: '投票' },
  { icon: MessageSquare, title: '满意度调研', type: '问卷' },
  { icon: Star, title: '员工评分', type: '评分' },
  { icon: ClipboardList, title: '活动报名', type: '信息收集' },
  { icon: HelpCircle, title: '用户反馈', type: '反馈' },
  { icon: Calendar, title: '会议预约', type: '预约' },
  { icon: Users, title: '团队招募', type: '报名' },
  { icon: Tag, title: '问卷调查', type: '问卷' },
]

export function TemplatesSection() {
  return (
    <section id="templates" style={{ padding: '100px 24px' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-bold mb-4" style={{ fontSize: '40px' }}>精选模板</h2>
          <p className="text-lg text-[var(--text-secondary)]">快速开始，省时省力</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <Link
              key={index}
              href="/register"
              className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-[#6366F1]/30 hover:shadow-xl group"
            >
              <div className="h-36 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center">
                <template.icon className="w-12 h-12 text-[var(--text-muted)] group-hover:text-[#A78BFA] transition-colors" />
              </div>
              <div className="p-5">
                <h4 className="font-semibold mb-1">{template.title}</h4>
                <p className="text-sm text-[var(--text-muted)]">{template.type}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
