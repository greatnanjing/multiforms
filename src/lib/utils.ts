import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Constants
// ============================================

/** 文件大小限制 */
export const FILE_SIZE_LIMITS = {
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  SMALL: 2 * 1024 * 1024, // 2MB
  LARGE: 50 * 1024 * 1024, // 50MB
} as const

/** 分页默认值 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  ANALYTICS_PAGE_SIZE: 50,
  SUBMISSIONS_PAGE_SIZE: 10,
} as const

/** 短 ID 生成配置 */
export const SHORT_ID = {
  BYTES: 6,
  LENGTH: 6,
  MAX_ATTEMPTS: 10,
} as const

// ============================================
// Utility Functions
// ============================================

/** 生成唯一 ID */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

/** 转义 SQL LIKE 模式中的特殊字符 */
export function escapeLikePattern(pattern: string): string {
  return pattern
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\\/g, '\\\\')
}
