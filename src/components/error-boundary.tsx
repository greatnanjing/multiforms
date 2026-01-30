/* ============================================
   MultiForms Error Boundary

   错误边界组件：
   - 捕获子组件中的错误
   - 显示友好的错误页面
   - 提供重试选项
   - 记录错误信息

   Usage:
   ```tsx
   import { ErrorBoundary } from '@/components/error-boundary'

   <ErrorBoundary>
     <YourComponent />
   </ErrorBoundary>
   ```
============================================ */

'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ============================================
// Types
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode
  /** 自定义错误回退组件 */
  fallback?: ReactNode
  /** 发生错误时的回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ============================================
// Error Fallback Component
// ============================================

interface ErrorFallbackProps {
  error: Error | null
  resetError: () => void
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Error Card */}
      <div className="relative w-full max-w-[480px]">
        <div className="p-6 sm:p-8 rounded-2xl border bg-[var(--bg-secondary)] border-white/[0.08]">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-2">
              出错了
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              抱歉，应用程序遇到了意外错误
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-red-400 font-mono break-words">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-300 cursor-pointer hover:text-red-200">
                    查看堆栈跟踪
                  </summary>
                  <pre className="mt-2 text-xs text-red-300 font-mono whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetError}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            如果问题持续存在，请联系支持团队
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Error Boundary Component
// ============================================

/**
 * 错误边界组件
 *
 * 捕获子组件树中的 JavaScript 错误，显示友好的错误 UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 调用自定义错误回调
    this.props.onError?.(error, errorInfo)

    // 这里可以添加错误上报服务（如 Sentry）
    // logErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 使用自定义 fallback 或默认错误页面
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <ErrorFallback error={this.state.error} resetError={this.handleReset} />
    }

    return this.props.children
  }
}

// ============================================
// Hooks for Error Boundary
// ============================================

/**
 * useErrorBoundary Hook
 *
 * 允许在组件内部手动触发错误边界
 */
export function useErrorBoundary() {
  return (error: Error) => {
    throw error
  }
}
