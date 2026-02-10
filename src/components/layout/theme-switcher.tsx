/* ============================================
   MultiForms Theme Switcher Component

   主题切换组件：
   - Hover 展开所有主题（每行一个，横向展开）
   - Hover 临时预览主题效果
   - 左键点击选中主题
   - 移出不点击恢复原主题

   Usage:
   ```tsx
   import { ThemeSwitcher } from '@/components/layout/theme-switcher'

   <ThemeSwitcher />
   <ThemeSwitcher variant="compact" />
   <ThemeSwitcher showModeToggle={false} />
   ```
============================================ */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Palette, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore, useCurrentTheme, useCurrentMode } from '@/stores/themeStore'
import { getAllThemes, getThemeGradient, applyTheme } from '@/lib/themes'
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
// Main Component
// ============================================

export function ThemeSwitcher({
  variant = 'default',
  showModeToggle = true,
  className,
}: ThemeSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const themes = getAllThemes()
  const currentTheme = useCurrentTheme()
  const currentMode = useCurrentMode()
  const setTheme = useThemeStore((state) => state.setTheme)
  const toggleMode = useThemeStore((state) => state.toggleMode)

  const currentThemeData = themes.find(t => t.id === currentTheme)

  // 处理主题 hover 预览
  const handleThemeHover = useCallback((themeId: ThemeId) => {
    // 清除之前的恢复定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (themeId !== hoveredTheme) {
      console.log('[ThemeSwitcher] Hover preview:', themeId, '(current:', currentTheme, ')')
      setHoveredTheme(themeId)
      // 临时应用主题到 DOM（不保存到 store）
      if (typeof window !== 'undefined') {
        applyTheme(themeId)
      }
    }
  }, [hoveredTheme, currentTheme])

  // 恢复原主题
  const restoreOriginalTheme = useCallback(() => {
    if (hoveredTheme) {
      console.log('[ThemeSwitcher] Restore to:', currentTheme)
      setHoveredTheme(null)
      if (typeof window !== 'undefined') {
        applyTheme(currentTheme)
      }
    }
  }, [currentTheme, hoveredTheme])

  // 处理容器 mouse enter
  const handleContainerEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsExpanded(true)
  }, [])

  // 处理容器 mouse leave
  const handleContainerLeave = useCallback(() => {
    // 延迟关闭，避免鼠标移动时误触发
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false)
      restoreOriginalTheme()
    }, 150)
  }, [restoreOriginalTheme])

  // 处理主题选择（点击确认）
  const handleSelectTheme = useCallback((themeId: ThemeId) => {
    setTheme(themeId)
    setHoveredTheme(null)
  }, [setTheme])

  // 主题选项组件（横向展开）
  const ThemeRow = ({ theme }: { theme: { id: ThemeId; name: string; nameEn: string; description: string } }) => {
    const isCurrent = theme.id === currentTheme
    const isHovering = hoveredTheme === theme.id

    return (
      <button
        onClick={() => handleSelectTheme(theme.id)}
        onMouseEnter={() => handleThemeHover(theme.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
          'hover:bg-white/5',
          isCurrent && !isHovering && 'bg-white/5',
          isHovering && 'bg-white/10'
        )}
      >
        {/* 颜色预览圆点 */}
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex-shrink-0 transition-transform duration-200',
            (isHovering || isCurrent) ? 'border-white scale-110' : 'border-white/20'
          )}
          style={{
            background: getThemeGradient(theme.id),
          }}
        />

        {/* 主题信息 */}
        <div className="flex-1 text-left">
          <span className={cn(
            'text-xs font-medium transition-colors',
            (isHovering || isCurrent) ? 'text-white' : 'text-[var(--text-secondary)]'
          )}>
            {theme.name}
          </span>
        </div>

        {/* 选中指示器 */}
        {isCurrent && (
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-glow)]" />
        )}
      </button>
    )
  }

  // 紧凑模式：显示预览圆点 + hover 展开
  if (variant === 'compact') {
    return (
      <div
        ref={containerRef}
        className={cn('relative', className)}
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
      >
        {/* 默认显示 */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'hover:bg-white/5 cursor-pointer'
        )}>
          <div
            className="w-5 h-5 rounded-full border border-white/10"
            style={{ background: getThemeGradient(currentTheme) }}
          />
          <span className="text-sm text-[var(--text-secondary)]">
            {currentThemeData?.name}
          </span>
          <Palette className="w-4 h-4 text-[var(--text-muted)]" />
        </div>

        {/* Hover 展开所有主题（每行一个） */}
        {isExpanded && (
          <div
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            className="absolute top-full right-0 mt-2 w-36 p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-white/[0.08] shadow-xl z-50"
          >
            <div className="flex flex-col gap-0.5">
              {themes.map(theme => (
                <ThemeRow key={theme.id} theme={theme} />
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 pt-2 border-t border-white/5">
              Hover 预览，点击选中
            </p>
          </div>
        )}
      </div>
    )
  }

  // 最小模式
  if (variant === 'minimal') {
    return (
      <div
        ref={containerRef}
        className={cn('relative', className)}
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
      >
        <button
          className={cn(
            'relative p-2 rounded-lg transition-all duration-200',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          )}
          title="切换主题"
        >
          <div
            className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110"
            style={{ background: getThemeGradient(currentTheme) }}
          />
        </button>

        {/* Hover 展开所有主题 */}
        {isExpanded && (
          <div
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            className="absolute top-full right-0 mt-2 w-36 p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-white/[0.08] shadow-xl z-50"
          >
            <div className="flex flex-col gap-0.5">
              {themes.map(theme => (
                <ThemeRow key={theme.id} theme={theme} />
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 pt-2 border-t border-white/5">
              Hover 预览，点击选中
            </p>
          </div>
        )}
      </div>
    )
  }

  // 默认模式
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 主题选择 */}
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
      >
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
            'bg-white/5 text-[var(--text-secondary)] border border-white/10',
            'hover:bg-white/10 hover:text-[var(--text-primary)]',
            isExpanded && 'bg-white/10 text-[var(--text-primary)]'
          )}
        >
          <Palette className="w-4 h-4" />
          <span>{currentThemeData?.name || '主题'}</span>
        </button>

        {/* Hover 展开所有主题（每行一个） */}
        {isExpanded && (
          <div
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            className="absolute top-full right-0 mt-2 w-36 p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-white/[0.08] shadow-xl z-50"
          >
            <div className="flex flex-col gap-0.5">
              {themes.map(theme => (
                <ThemeRow key={theme.id} theme={theme} />
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 pt-2 border-t border-white/5">
              Hover 预览，点击选中
            </p>
          </div>
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
