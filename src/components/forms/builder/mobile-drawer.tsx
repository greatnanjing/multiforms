/* ============================================
   MultiForms Mobile Drawer Component

   移动端抽屉组件：
   - 底部滑出式抽屉
   - 题型列表
   - 点击添加题目
============================================ */

'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuestionToolbox } from './question-toolbox'
import type { QuestionType } from '@/types'

// ============================================
// Types
// ============================================

interface MobileDrawerProps {
  /** 是否打开 */
  isOpen: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 添加题目回调 */
  onAddQuestion?: (type: QuestionType) => void
  /** 高级功能回调 */
  onAdvancedFeature?: (featureId: string) => void
}

// ============================================
// Main Component
// ============================================

export function MobileDrawer({
  isOpen,
  onClose,
  onAddQuestion,
  onAdvancedFeature,
}: MobileDrawerProps) {
  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-[var(--bg-secondary)] border-t border-white/10',
          'rounded-t-3xl max-h-[70vh] overflow-hidden',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div
          className={cn(
            'w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2',
            'cursor-pointer'
          )}
          onClick={onClose}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            添加题型
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-white/5 hover:bg-white/10',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              'transition-colors'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 overflow-y-auto max-h-[calc(70vh-60px)]">
          <QuestionToolbox
            onAddQuestion={(type) => {
              onAddQuestion?.(type)
              onClose()
            }}
            onAdvancedFeature={(featureId) => {
              onAdvancedFeature?.(featureId)
              onClose()
            }}
          />
        </div>
      </div>
    </>
  )
}

// ============================================
// Mobile Drawer Toggle Button
// ============================================

interface MobileDrawerToggleProps {
  onClick: () => void
  count?: number
}

export function MobileDrawerToggle({ onClick, count }: MobileDrawerToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 z-40',
        'w-14 h-14 rounded-2xl',
        'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]',
        'shadow-lg shadow-indigo-500/30',
        'flex items-center justify-center',
        'hover:scale-105 active:scale-95',
        'transition-transform duration-200',
        'lg:hidden' // Hidden on desktop
      )}
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'w-5 h-5 rounded-full bg-red-500',
            'flex items-center justify-center',
            'text-xs font-bold text-white'
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
