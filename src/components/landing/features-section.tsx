/* ============================================
   MultiForms Landing Page - Features Section
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
    title: '拖拽式创建',
    description: '直观的拖拽界面，轻松添加各种题型，自由布局，所见即所得',
  },
  {
    icon: BarChart3,
    title: '实时数据统计',
    description: '自动生成可视化图表，实时查看回复趋势和数据分析结果',
  },
  {
    icon: Smartphone,
    title: '多端完美适配',
    description: '响应式设计，确保在手机、平板、电脑上都有最佳的填写体验',
  },
  {
    icon: Shield,
    title: '隐私安全保护',
    description: '支持密码保护、限制回复、数据加密，全面保护用户隐私安全',
  },
  {
    icon: Sparkles,
    title: '丰富模板库',
    description: '精心设计的模板覆盖各种场景，一键套用，快速开始',
  },
  {
    icon: Workflow,
    title: '智能逻辑跳转',
    description: '根据用户答案智能跳转题目，创建个性化的表单流程',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-[var(--bg-secondary)]">
      <div className="max-w-[1000px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">核心功能</h2>
          <p className="text-lg text-[var(--text-secondary)]">强大的功能，简单的操作</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-3xl p-10 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/15"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-[#A78BFA]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
