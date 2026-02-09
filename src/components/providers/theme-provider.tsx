/* ============================================
   MultiForms Theme Provider

   主题状态提供者：
   - 应用主题到 DOM
   - 监听主题变化
   - 处理主题切换动画
   - 支持服务端渲染

   Usage:
   ```tsx
   import { ThemeProvider } from '@/components/providers/theme-provider'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <ThemeProvider defaultTheme="nebula" defaultMode="dark">
             {children}
           </ThemeProvider>
         </body>
       </html>
     )
   }
   ```
============================================ */

'use client'

import { useEffect, type ReactNode } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemeId, ThemeMode } from '@/types'

// ============================================
// Types
// ============================================

interface ThemeProviderProps {
  children: ReactNode
  /** 默认主题 */
  defaultTheme?: ThemeId
  /** 默认模式 */
  defaultMode?: ThemeMode
  /** 是否启用主题切换动画 */
  enableTransition?: boolean
}

// ============================================
// Theme Provider Component
// ============================================

/**
 * 主题状态提供者
 *
 * 管理全局主题状态，将主题应用到 document.documentElement
 */
export function ThemeProvider({
  children,
  defaultTheme = 'nebula',
  defaultMode = 'dark',
  enableTransition = true,
}: ThemeProviderProps) {
  const setTheme = useThemeStore((state) => state.setTheme)
  const setMode = useThemeStore((state) => state.setMode)
  const applyToDOM = useThemeStore((state) => state.applyToDOM)

  useEffect(() => {
    // 确保 DOM 已加载
    if (typeof window === 'undefined') return

    // 初始化主题
    const initializeTheme = () => {
      // 从 localStorage 读取已保存的主题（由 zustand persist 中间件处理）
      const storedState = localStorage.getItem('multiforms-theme-storage')
      let theme: ThemeId = defaultTheme
      let mode: ThemeMode = defaultMode

      if (storedState) {
        try {
          const parsed = JSON.parse(storedState)
          theme = parsed.state?.theme || defaultTheme
          mode = parsed.state?.mode || defaultMode
        } catch {
          // 使用默认值
        }
      }

      // 设置初始主题和模式
      setTheme(theme)
      setMode(mode)

      // 应用到 DOM
      applyToDOM()
    }

    initializeTheme()

    // 添加主题切换动画类
    if (enableTransition) {
      document.documentElement.classList.add('theme-transition')
    }

    // 清理函数
    return () => {
      if (enableTransition) {
        document.documentElement.classList.remove('theme-transition')
      }
    }
  }, [defaultTheme, defaultMode, setTheme, setMode, applyToDOM, enableTransition])

  return <>{children}</>
}

// ============================================
// Export
// ============================================

export default ThemeProvider
