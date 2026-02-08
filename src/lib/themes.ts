/* ============================================
   MultiForms Theme System

   主题系统定义：
   - 8套主题配置（星云紫、海洋蓝、日落橙、森林绿、樱花粉、赛博霓虹、极简灰、皇家金）
   - 主题颜色变量
   - 主题获取方法

   Usage:
   ```ts
   import { getTheme, getAllThemes, applyTheme } from '@/lib/themes'

   const theme = getTheme('nebula')
   const allThemes = getAllThemes()
   applyTheme('ocean', document.documentElement)
   ```
============================================ */

import type { ThemeId, ThemePreset } from '@/types'

// ============================================
// Theme Definitions
// ============================================

/** 主题配置映射 */
export const THEMES: Record<ThemeId, ThemePreset> = {
  /** 星云紫 - 默认主题 */
  nebula: {
    id: 'nebula',
    name: '星云紫',
    nameEn: 'Nebula Purple',
    description: '神秘优雅，适合通用场景',
    colors: {
      primary_start: '#6366F1',
      primary_end: '#8B5CF6',
      primary_glow: '#A78BFA',
      accent_color: '#EC4899',
      bg_primary: '#0F0F23',
      bg_secondary: '#1A1A2E',
      bg_tertiary: '#2D2D44',
    },
  },

  /** 海洋蓝 - 商务专业 */
  ocean: {
    id: 'ocean',
    name: '海洋蓝',
    nameEn: 'Ocean Blue',
    description: '清新专业，适合商务场景',
    colors: {
      primary_start: '#0EA5E9',
      primary_end: '#06B6D4',
      primary_glow: '#22D3EE',
      accent_color: '#3B82F6',
      bg_primary: '#0A1628',
      bg_secondary: '#0F2744',
      bg_tertiary: '#1E3A5F',
    },
  },

  /** 日落橙 - 活力青春 */
  sunset: {
    id: 'sunset',
    name: '日落橙',
    nameEn: 'Sunset Orange',
    description: '热情活力，适合年轻人',
    colors: {
      primary_start: '#F97316',
      primary_end: '#EC4899',
      primary_glow: '#FB923C',
      accent_color: '#EF4444',
      bg_primary: '#1A0A0A',
      bg_secondary: '#2D1515',
      bg_tertiary: '#40201A',
    },
  },

  /** 森林绿 - 自然健康 */
  forest: {
    id: 'forest',
    name: '森林绿',
    nameEn: 'Forest Green',
    description: '自然清新，适合健康环保',
    colors: {
      primary_start: '#10B981',
      primary_end: '#06B6D4',
      primary_glow: '#34D399',
      accent_color: '#059669',
      bg_primary: '#0A1A12',
      bg_secondary: '#0F291C',
      bg_tertiary: '#1A3D2B',
    },
  },

  /** 樱花粉 - 浪漫女性 */
  sakura: {
    id: 'sakura',
    name: '樱花粉',
    nameEn: 'Sakura Pink',
    description: '柔美浪漫，适合女性用户',
    colors: {
      primary_start: '#EC4899',
      primary_end: '#F472B6',
      primary_glow: '#F9A8D4',
      accent_color: '#F43F5E',
      bg_primary: '#1A0A14',
      bg_secondary: '#2D1526',
      bg_tertiary: '#402035',
    },
  },

  /** 赛博霓虹 - 科技游戏 */
  cyber: {
    id: 'cyber',
    name: '赛博霓虹',
    nameEn: 'Cyber Neon',
    description: '科技炫酷，适合游戏科技',
    colors: {
      primary_start: '#22D3EE',
      primary_end: '#A855F7',
      primary_glow: '#E879F9',
      accent_color: '#F0ABFC',
      bg_primary: '#0A0514',
      bg_secondary: '#180B2E',
      bg_tertiary: '#2D1B4E',
    },
  },

  /** 极简灰 - 商务正式 */
  minimal: {
    id: 'minimal',
    name: '极简灰',
    nameEn: 'Minimal Gray',
    description: '简约低调，适合正式场合',
    colors: {
      primary_start: '#64748B',
      primary_end: '#94A3B8',
      primary_glow: '#CBD5E1',
      accent_color: '#475569',
      bg_primary: '#0F0F12',
      bg_secondary: '#1A1A1F',
      bg_tertiary: '#2D2D35',
    },
  },

  /** 皇家金 - 高端奢华 */
  royal: {
    id: 'royal',
    name: '皇家金',
    nameEn: 'Royal Gold',
    description: '尊贵奢华，适合高端品牌',
    colors: {
      primary_start: '#F59E0B',
      primary_end: '#EAB308',
      primary_glow: '#FBBF24',
      accent_color: '#D97706',
      bg_primary: '#1A1205',
      bg_secondary: '#2D1F0A',
      bg_tertiary: '#402D10',
    },
  },
}

/** 主题 ID 列表 */
export const THEME_IDS: ThemeId[] = Object.keys(THEMES) as ThemeId[]

/** 默认主题 */
export const DEFAULT_THEME: ThemeId = 'nebula'

// ============================================
// Theme Utilities
// ============================================

/**
 * 获取指定主题配置
 */
export function getTheme(id: ThemeId): ThemePreset {
  return THEMES[id] || THEMES[DEFAULT_THEME]
}

/**
 * 获取所有主题列表
 */
export function getAllThemes(): ThemePreset[] {
  return THEME_IDS.map(id => THEMES[id])
}

/**
 * 应用主题到 DOM 元素
 * @param id 主题 ID
 * @param target 目标元素（默认为 document.documentElement）
 */
export function applyTheme(
  id: ThemeId,
  target: HTMLElement = document.documentElement
): void {
  // 设置 data-theme 属性到 html 元素
  target.setAttribute('data-theme', id)
  // 同时设置到 body 元素以确保兼容性
  if (target === document.documentElement && document.body) {
    document.body.setAttribute('data-theme', id)
  }
}

/**
 * 移除主题内联样式（恢复到 CSS 定义的默认值）
 * @param target 目标元素（默认为 document.documentElement）
 */
export function removeThemeInlineStyles(
  target: HTMLElement = document.documentElement
): void {
  target.style.removeProperty('--primary-start')
  target.style.removeProperty('--primary-end')
  target.style.removeProperty('--primary-glow')
  target.style.removeProperty('--accent-color')
  target.style.removeProperty('--bg-primary')
  target.style.removeProperty('--bg-secondary')
  target.style.removeProperty('--bg-tertiary')
}

/**
 * 生成主题渐变 CSS
 * @param id 主题 ID
 */
export function getThemeGradient(id: ThemeId): string {
  const theme = getTheme(id)
  return `linear-gradient(135deg, ${theme.colors.primary_start}, ${theme.colors.primary_end})`
}

/**
 * 生成主题发光效果 CSS
 * @param id 主题 ID
 */
export function getThemeGlow(id: ThemeId, intensity: number = 20): string {
  const theme = getTheme(id)
  const alpha = intensity / 100
  return `0 0 ${intensity * 2}px rgba(${hexToRgb(theme.colors.primary_start)}, ${alpha})`
}

// ============================================
// Helper Functions
// ============================================

/**
 * 将十六进制颜色转换为 RGB
 */
function hexToRgb(hex: string): string {
  // 移除 # 号
  const cleanHex = hex.replace('#', '')

  // 解析 RGB
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return `${r}, ${g}, ${b}`
}

/**
 * 根据用户偏好选择合适的主题
 */
export function getPreferredTheme(): ThemeId {
  // 尝试从 localStorage 获取
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('multiforms-theme') as ThemeId | null
    if (stored && THEME_IDS.includes(stored)) {
      return stored
    }
  }

  // 返回默认主题
  return DEFAULT_THEME
}

/**
 * 保存主题偏好
 */
export function saveThemePreference(id: ThemeId): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('multiforms-theme', id)
  }
}
