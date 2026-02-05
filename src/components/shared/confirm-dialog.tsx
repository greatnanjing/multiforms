/* ============================================
   MultiForms Confirm Dialog Component

   确认对话框组件：
   - 替代原生 confirm()
   - 支持自定义标题和描述
   - 支持自定义按钮文本
   - 危险操作警告样式

   Usage:
   ```tsx
   import { useConfirm } from '@/components/shared/confirm-dialog'

   function MyComponent() {
     const { confirm } = useConfirm()

     const handleDelete = async () => {
       const confirmed = await confirm({
         title: '确认删除',
         message: '此操作不可撤销，确定要删除吗？',
         confirmText: '删除',
         cancelText: '取消',
         variant: 'danger',
       })

       if (confirmed) {
         // 执行删除操作
       }
     }
   }
   ```
============================================ */

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

// ============================================
// Types
// ============================================

export type ConfirmVariant = 'default' | 'danger' | 'warning'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

interface ConfirmDialog extends ConfirmOptions {
  id: string
  resolve: (result: boolean) => void
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

// ============================================
// Confirm Context
// ============================================

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

// ============================================
// Confirm Provider
// ============================================

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = generateId()
      setDialog({ ...options, id, resolve })
    })
  }, [])

  const handleConfirm = () => {
    dialog?.resolve(true)
    setDialog(null)
  }

  const handleCancel = () => {
    dialog?.resolve(false)
    setDialog(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <ConfirmDialog
            dialog={dialog}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onBackdropClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

// ============================================
// Confirm Dialog Component
// ============================================

interface ConfirmDialogProps {
  dialog: ConfirmDialog
  onConfirm: () => void
  onCancel: () => void
  onBackdropClick: (e: React.MouseEvent) => void
}

function ConfirmDialog({ dialog, onConfirm, onCancel, onBackdropClick }: ConfirmDialogProps) {
  const variant = dialog.variant || 'default'

  const variantStyles = {
    default: {
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      confirmBtn: 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white hover:opacity-90',
    },
    danger: {
      icon: 'text-red-400',
      iconBg: 'bg-red-500/10',
      confirmBtn: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90',
    },
    warning: {
      icon: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      confirmBtn: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90',
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-[400px] bg-[var(--bg-secondary)] rounded-2xl border border-white/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', styles.iconBg)}>
            <AlertTriangle className={cn('w-6 h-6', styles.icon)} />
          </div>

          {/* Title */}
          {dialog.title && (
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {dialog.title}
            </h3>
          )}

          {/* Message */}
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {dialog.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-[var(--text-primary)] hover:bg-white/5 transition-colors font-medium"
            >
              {dialog.cancelText || '取消'}
            </button>
            <button
              onClick={onConfirm}
              className={cn('flex-1 px-4 py-2.5 rounded-xl transition-all font-medium', styles.confirmBtn)}
            >
              {dialog.confirmText || '确认'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
