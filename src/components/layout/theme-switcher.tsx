/* ============================================
   MultiForms Theme Switcher Component

   主题切换组件：
   - 下拉菜单选择主题
   - 实时预览主题颜色
   - 显示当前选中状态
   - 支持模式切换（深色/浅色）

   Usage:
   ```tsx
   import { ThemeSwitcher } from '@/components/layout/theme-switcher'

   <ThemeSwitcher />
   <ThemeSwitcher variant="compact" />
   <ThemeSwitcher showModeToggle={false} />
   ```
============================================ */

'use client'

import { useState } from 'react'
import { Palette, Sun, Moon, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore, useCurrentTheme, useCurrentMode } from '@/stores/themeStore'
import { getAllThemes, getThemeGradient } from '@/lib/themes'
import type { ThemeId } from '@/types'

// ============================================
// Types
// ============================================

interface ThemeSwitcherProps {
  /** 显示变体 */
  variant?: 'default' | 'compact' | 'minimal'
  /** 是否显示模式切换按钮 */
  showModeToggle?: boolean
  /** 自定义类名 */
  className?: string
}

// ============================================
// Helper Components
// ============================================

/** 主题颜色预览圆点 */
function ThemePreview({ themeId }: { themeId: ThemeId }) {
  const theme = getAllThemes().find(t => t.id === themeId)
  if (!theme) return null

  return (
    <div
      className="w-5 h-5 rounded-full border border-white/10 shadow-sm"
      style={{
        background: getThemeGradient(themeId),
      }}
    />
  )
}

/** 主题选项 */
function ThemeOption({
  theme,
  isSelected,
  onSelect,
}: {
  theme: { id: ThemeId; name: string; nameEn: string; description: string }
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
        'hover:bg-white/5 active:bg-white/10',
        isSelected && 'bg-white/10'
      )}
    >
      {/* 颜色预览 */}
      <ThemePreview themeId={theme.id} />

      {/* 主题信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {theme.name}
          </span>
          {isSelected && (
            <Check className="w-4 h-4 text-[var(--primary-glow)] flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {theme.nameEn} · {theme.description}
        </span>
      </div>
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export function ThemeSwitcher({
  variant = 'default',
  showModeToggle = true,
  className,
}: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const themes = getAllThemes()
  const currentTheme = useCurrentTheme()
  const currentMode = useCurrentMode()
  const setTheme = useThemeStore((state) => state.setTheme)
  const toggleMode = useThemeStore((state) => state.toggleMode)

  const currentThemeData = themes.find(t => t.id === currentTheme)

  // 紧凑模式：只显示一个按钮
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-200',
          'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
        )}
        title="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>
    )
  }

  // 紧凑模式：显示预览圆点
  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5"
        >
          <ThemePreview themeId={currentTheme} />
          <span className="text-sm text-[var(--text-secondary)]">
            {currentThemeData?.name}
          </span>
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <>
            {/* 遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单 */}
            <div className="absolute top-full right-0 mt-2 w-56 p-2 rounded-xl bg-[var(--bg-secondary)] border border-white/[0.08] shadow-xl z-50">
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                {themes.map(theme => (
                  <ThemeOption
                    key={theme.id}
                    theme={theme}
                    isSelected={theme.id === currentTheme}
                    onSelect={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // 默认模式
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 主题选择下拉 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
            'bg-white/5 text-[var(--text-secondary)] border border-white/10',
            'hover:bg-white/10 hover:text-[var(--text-primary)]',
            isOpen && 'bg-white/10 text-[var(--text-primary)]'
          )}
        >
          <Palette className="w-4 h-4" />
          <span>{currentThemeData?.name || '主题'}</span>
          <ChevronDown className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <>
            {/* 遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单 */}
            <div className="absolute top-full right-0 mt-2 w-64 p-2 rounded-xl bg-[var(--bg-secondary)] border border-white/[0.08] shadow-xl z-50">
              <div className="px-3 py-2 border-b border-white/[0.08] mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  选择主题
                </span>
              </div>
              <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto">
                {themes.map(theme => (
                  <ThemeOption
                    key={theme.id}
                    theme={theme}
                    isSelected={theme.id === currentTheme}
                    onSelect={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 模式切换按钮 */}
      {showModeToggle && (
        <button
          onClick={() => toggleMode()}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
            'bg-white/5 text-[var(--text-secondary)] border border-white/10',
            'hover:bg-white/10 hover:text-[var(--text-primary)]'
          )}
          title={currentMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {currentMode === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  )
}

// ============================================
// Export
// ============================================

export default ThemeSwitcher
