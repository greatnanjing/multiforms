/* ============================================
   MultiForms Form View Header Component

   表单头部组件（公开填写页）：
   - Logo/封面图
   - 表单标题
   - 表单描述
============================================ */

'use client'

import { cn } from '@/lib/utils'
import type { Form } from '@/types'

// ============================================
// Types
// ============================================

interface FormHeaderProps {
  form: Form
  /** 额外的类名 */
  className?: string
}

// ============================================
// Main Component
// ============================================

export function FormHeader({ form, className }: FormHeaderProps) {
  const { title, description, logo_url } = form

  return (
    <div
      className={cn(
        'relative p-6 sm:p-8 rounded-2xl border mb-4 transition-all duration-200',
        'glass-card border-white/[0.08]',
        className
      )}
    >
      {/* Logo or Cover */}
      {logo_url ? (
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center">
          <img
            src={logo_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center text-white text-2xl font-bold">
          {title?.charAt(0) || 'M'}
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] text-center mb-3">
        {title || '未命名表单'}
      </h1>

      {/* Description */}
      {description && (
        <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
          {description}
        </p>
      )}

      {/* Decorative line */}
      {description && (
        <div className="flex justify-center mt-4">
          <div className="w-16 h-0.5 rounded-full bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]" />
        </div>
      )}
    </div>
  )
}
