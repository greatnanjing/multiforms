/* ============================================
   MultiForms Landing Page - Templates Section

   首页精选模板区域，支持：
   - 未登录用户点击跳转到登录页
   - 已登录用户点击创建对应模板的表单并跳转到编辑页
   - 从数据库获取管理员创建的模板
============================================ */

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { ThumbsUp, MessageSquare, Star, ClipboardList, HelpCircle, Calendar, Users, Tag, Loader2, AlertCircle, FileText } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { createFormFromTemplate } from '@/lib/api/templates'
import { getDatabaseTemplates, type TemplateShowcase } from '@/lib/templates'

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ThumbsUp,
  MessageSquare,
  Star,
  ClipboardList,
  HelpCircle,
  Calendar,
  Users,
  Tag,
  FileText,
}

export function TemplatesSection() {
  const isAuthenticated = useAuthStore((state) => state.user !== null)
  const router = useRouter()
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateShowcase[]>([])

  // 从数据库获取模板
  useEffect(() => {
    // 防止服务器端渲染时执行
    if (typeof window === 'undefined') return

    async function loadTemplates() {
      try {
        const dbTemplates = await getDatabaseTemplates()
        // 只显示前 8 个模板作为精选
        setTemplates(dbTemplates.slice(0, 8))
      } catch (err) {
        console.error('Failed to load templates:', err)
      }
    }
    loadTemplates()
  }, [])

  // 使用 useCallback 缓存处理函数
  const handleTemplateClick = useCallback(async (
    e: React.MouseEvent<HTMLButtonElement>,
    templateId: string
  ) => {
    // 清除之前的错误
    setError(null)

    if (!isAuthenticated) {
      e.preventDefault()
      router.push('/login')
      return
    }

    // 已登录用户：创建表单并跳转到编辑页

    // 防止重复点击 - 在 preventDefault 之前检查
    if (creatingTemplateId) {
      e.preventDefault()
      return
    }

    e.preventDefault()

    setCreatingTemplateId(templateId)

    try {
      // 从模板创建表单
      const form = await createFormFromTemplate(templateId)
      // 跳转到表单编辑页面
      router.push(`/forms/${form.id}/edit`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建表单失败，请重试'
      console.error('创建表单失败:', err)
      setError(errorMessage)
    } finally {
      setCreatingTemplateId(null)
    }
  }, [isAuthenticated, router, creatingTemplateId])

  const isLoading = creatingTemplateId !== null

  // 获取当前加载中的模板名称
  const loadingTemplateName = useMemo(() => {
    if (!creatingTemplateId) return null
    const template = templates.find(t => t.id === creatingTemplateId)
    return template?.name || null
  }, [creatingTemplateId, templates])

  return (
    <section id="templates" style={{ padding: '100px 24px' }}>
      <div className="w-full max-w-[1100px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-bold mb-4" style={{ fontSize: '40px' }}>精选模板</h2>
          <p className="text-lg text-[var(--text-secondary)]">快速开始，省时省力</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="glass-card rounded-xl p-4 flex items-start gap-3 bg-red-500/10 border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="关闭错误提示"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-title"
          >
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" role="status" aria-label="加载中" />
              <p id="loading-title" className="text-[var(--text-primary)]">
                {loadingTemplateName ? `正在创建"${loadingTemplateName}"表单...` : '正在创建表单...'}
              </p>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {templates.map((template) => {
              const IconComponent = iconMap[template.iconName]
              const isCurrentLoading = creatingTemplateId === template.id

              return (
                <button
                  key={template.id}
                  onClick={(e) => handleTemplateClick(e, template.id)}
                  disabled={isLoading}
                  aria-disabled={isLoading || undefined}
                  aria-busy={isCurrentLoading || undefined}
                  className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-[#6366F1]/30 hover:shadow-xl group relative text-left w-full ${
                    isCurrentLoading ? 'opacity-50 pointer-events-none' : ''
                  } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isCurrentLoading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <div className="h-36 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center">
                    {IconComponent && (
                      <IconComponent className="w-12 h-12 text-[var(--text-muted)] group-hover:text-[#A78BFA] transition-colors" />
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold mb-1">{template.name}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{template.type}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-[var(--text-muted)]">
            暂无可用模板，请联系管理员添加
          </div>
        )}
      </div>
    </section>
  )
}
