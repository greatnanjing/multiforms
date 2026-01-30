/* ============================================
   MultiForms Theme Store (Zustand)

   主题状态管理：
   - 当前主题
   - 主题模式（深色/浅色）
   - 主题切换方法
   - 持久化到 localStorage

   Usage:
   ```ts
   import { useThemeStore } from '@/stores/themeStore'

   // 在组件中使用
   const { theme, mode, setTheme, setMode, toggleMode } = useThemeStore()
   ```
============================================ */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ThemeId, ThemeMode, ThemePreset } from '@/types'
import { THEMES, getTheme, applyTheme, removeThemeInlineStyles, saveThemePreference } from '@/lib/themes'

// ============================================
// Types
// ============================================

interface ThemeState {
  // 状态
  theme: ThemeId
  mode: ThemeMode

  // Actions
  setTheme: (id: ThemeId) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void

  // Getters
  getCurrentTheme: () => ThemePreset

  // 初始化方法（从 localStorage 恢复后调用）
  applyToDOM: () => void
}

// ============================================
// Store
// ============================================

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 初始状态
      theme: 'nebula',
      mode: 'dark',

      // ============================================
      // 设置主题
      // ============================================
      setTheme: (id) => {
        set({ theme: id })

        // 保存到 localStorage
        saveThemePreference(id)

        // 应用到 DOM
        if (typeof window !== 'undefined') {
          applyTheme(id)
        }
      },

      // ============================================
      // 设置模式
      // ============================================
      setMode: (mode) => {
        set({ mode })

        // 应用到 DOM
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-mode', mode)
        }
      },

      // ============================================
      // 切换模式
      // ============================================
      toggleMode: () => {
        const { mode } = get()
        const newMode = mode === 'dark' ? 'light' : 'dark'
        get().setMode(newMode)
      },

      // ============================================
      // 获取当前主题配置
      // ============================================
      getCurrentTheme: () => {
        const { theme } = get()
        return getTheme(theme)
      },

      // ============================================
      // 应用主题到 DOM
      // ============================================
      applyToDOM: () => {
        if (typeof window === 'undefined') return

        const { theme, mode } = get()

        // 应用主题
        applyTheme(theme)

        // 应用模式
        document.documentElement.setAttribute('data-mode', mode)
      },
    }),
    {
      name: 'multiforms-theme-storage',
      storage: createJSONStorage(() => {
        // 服务端渲染时使用内存存储
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      // 只持久化 theme 和 mode
      partialize: (state) => ({
        theme: state.theme,
        mode: state.mode,
      }),
    }
  )
)

// ============================================
// Selector Hooks（用于性能优化）
// ============================================

/** 获取当前主题 ID */
export const useCurrentTheme = () => useThemeStore((state) => state.theme)

/** 获取当前模式 */
export const useCurrentMode = () => useThemeStore((state) => state.mode)

/** 获取当前主题配置 */
export const useThemeConfig = () => useThemeStore((state) => state.getCurrentTheme())

/** 检查是否为深色模式 */
export const useIsDarkMode = () => useThemeStore((state) => state.mode === 'dark')
