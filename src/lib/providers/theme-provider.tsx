/* ============================================
   MultiForms Theme Provider

   提供全局主题管理：
   - 8种主题切换
   - 深浅模式切换
   - 本地存储持久化

   Usage:
   <ThemeProvider><App /></ThemeProvider>
============================================ */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId = 'nebula' | 'ocean' | 'sunset' | 'forest' | 'sakura' | 'cyber' | 'minimal' | 'royal'
export type ThemeMode = 'dark' | 'light'

interface ThemeContextValue {
  theme: ThemeId
  mode: ThemeMode
  setTheme: (theme: ThemeId) => void
  setMode: (mode: ThemeMode) => void
  cycleTheme: () => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeId
  defaultMode?: ThemeMode
}

export function ThemeProvider({
  children,
  defaultTheme = 'nebula',
  defaultMode = 'dark',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme)
  const [mode, setModeState] = useState<ThemeMode>(defaultMode)
  const [mounted, setMounted] = useState(false)

  // 初始化主题（从 localStorage 读取）
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as ThemeId
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode

    const initialTheme = savedTheme || defaultTheme
    const initialMode = savedMode || defaultMode

    setThemeState(initialTheme)
    setModeState(initialMode)
    applyTheme(initialTheme, initialMode)
  }, [defaultTheme, defaultMode])

  // 应用主题到 DOM
  const applyTheme = (newTheme: ThemeId, newMode: ThemeMode) => {
    const root = document.body
    root.setAttribute('data-theme', newTheme)
    root.setAttribute('data-mode', newMode)
  }

  // 设置主题
  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme)
    applyTheme(newTheme, mode)
    localStorage.setItem('theme', newTheme)
  }

  // 设置模式
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    applyTheme(theme, newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  // 循环切换主题
  const cycleTheme = () => {
    const themes: ThemeId[] = ['nebula', 'ocean', 'sunset', 'forest', 'sakura', 'cyber', 'minimal', 'royal']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  // 切换深浅模式
  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
  }

  const value: ThemeContextValue = {
    theme,
    mode,
    setTheme,
    setMode,
    cycleTheme,
    toggleMode,
  }

  // 避免服务端渲染不匹配
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
