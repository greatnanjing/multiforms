/* ============================================
   MultiForms Landing Page - Features Section
   现代化卡片设计
   ============================================ */

import {
  FileEdit,
  BarChart3,
  Smartphone,
  Shield,
  Sparkles,
  Workflow,
} from 'lucide-react'

const features = [
  {
    icon: FileEdit,
    title: '简单易用',
    description: '无需技术背景，直观的操作界面，轻松创建专业表单，快速上手',
    gradient: 'from-[#6366F1] to-[#8B5CF6]',
  },
  {
    icon: BarChart3,
    title: '实时数据统计',
    description: '自动生成可视化图表，实时查看回复趋势和数据分析结果',
    gradient: 'from-[#10B981] to-[#34D399]',
  },
  {
    icon: Smartphone,
    title: '多端完美适配',
    description: '响应式设计，确保在手机、平板、电脑上都有最佳的填写体验',
    gradient: 'from-[#0EA5E9] to-[#06B6D4]',
  },
  {
    icon: Shield,
    title: '隐私安全保护',
    description: '支持密码保护、限制回复、数据加密，全面保护用户隐私安全',
    gradient: 'from-[#F59E0B] to-[#FBBF24]',
  },
  {
    icon: Sparkles,
    title: '丰富模板库',
    description: '精心设计的模板覆盖各种场景，一键套用，快速开始',
    gradient: 'from-[#EC4899] to-[#F472B6]',
  },
  {
    icon: Workflow,
    title: '智能逻辑跳转',
    description: '根据用户答案智能跳转题目，创建个性化的表单流程',
    gradient: 'from-[#A855F7] to-[#C084FC]',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative" style={{ padding: '60px 24px 100px' }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#6366F1]/5 blur-[150px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(32px, 4vw, 40px)' }}>
            <span className="gradient-text">核心功能</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">强大的功能，简单的操作</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-[var(--bg-primary)] border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#6366F1]/20 hover:shadow-xl hover:shadow-[#6366F1]/10"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* 渐变顶部边框 */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${feature.gradient}/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 text-transparent bg-gradient-to-br ${feature.gradient} bg-clip-text`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className={`absolute -inset-4 bg-gradient-to-r ${feature.gradient}/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
