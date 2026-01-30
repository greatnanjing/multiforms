/* ============================================
   MultiForms Auth Hook

   认证相关 Hook：
   - 封装 authStore
   - 提供便捷的认证方法
   - 自动处理加载状态

   Usage:
   ```ts
   import { useAuth } from '@/hooks/useAuth'

   // 在组件中使用
   const { user, profile, signIn, signOut, isLoading, isAuthenticated } = useAuth()
   ```
============================================ */

import { useCallback } from 'react'
import { useAuthStore, type AuthUser } from '@/stores/authStore'
import type { Profile, UserRole } from '@/types'

// ============================================
// Auth Hook Return Type
// ============================================

export interface UseAuthReturn {
  // 状态
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  error: string | null

  // 用户角色检查
  isAdmin: boolean
  isCreator: boolean
  hasRole: (role: UserRole) => boolean

  // 方法
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{
    success: boolean
    error?: string
    requiresEmailVerification?: boolean
  }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// ============================================
// Auth Hook
// ============================================

/**
 * 认证 Hook
 *
 * 提供完整的认证功能，包括登录、注册、登出等
 */
export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()

  // 使用 useCallback 缓存函数，避免不必要的重渲染
  const signIn = useCallback(
    (email: string, password: string) => authStore.signIn(email, password),
    [authStore]
  )

  const signUp = useCallback(
    (email: string, password: string, name?: string) =>
      authStore.signUp(email, password, name),
    [authStore]
  )

  const signOut = useCallback(() => authStore.signOut(), [authStore])

  const fetchProfile = useCallback(() => authStore.fetchProfile(), [authStore])

  const refreshSession = useCallback(() => authStore.refreshSession(), [authStore])

  const clearError = useCallback(() => authStore.clearError(), [authStore])

  const hasRole = useCallback(
    (role: UserRole) => authStore.hasRole(role),
    [authStore]
  )

  return {
    // 状态
    user: authStore.user,
    profile: authStore.profile,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,
    isAuthenticated: authStore.user !== null,
    error: authStore.error,

    // 用户角色检查
    isAdmin: authStore.isAdmin(),
    isCreator: authStore.isCreator(),
    hasRole,

    // 方法
    signIn,
    signUp,
    signOut,
    fetchProfile,
    refreshSession,
    clearError,
  }
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * 获取当前用户信息
 */
export function useCurrentUser(): AuthUser | null {
  return useAuthStore((state) => state.user)
}

/**
 * 获取当前用户资料
 */
export function useUserProfile(): Profile | null {
  return useAuthStore((state) => state.profile)
}

/**
 * 检查用户是否已登录
 */
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user)
  return user !== null
}

/**
 * 检查用户是否是管理员
 */
export function useIsAdmin(): boolean {
  const profile = useAuthStore((state) => state.profile)
  return profile?.role === 'admin'
}

/**
 * 检查用户是否是创建者或管理员
 */
export function useIsCreator(): boolean {
  const profile = useAuthStore((state) => state.profile)
  return profile?.role === 'admin' || profile?.role === 'creator'
}

/**
 * 获取认证加载状态
 */
export function useAuthLoading(): boolean {
  return useAuthStore((state) => state.isLoading)
}

/**
 * 获取认证初始化状态
 */
export function useAuthInitialized(): boolean {
  return useAuthStore((state) => state.isInitialized)
}

/**
 * 获取认证错误
 */
export function useAuthError(): string | null {
  return useAuthStore((state) => state.error)
}

// ============================================
// Auth Guard Hook（用于路由保护）
// ============================================

/**
 * 认证守卫 Hook
 *
 * 用于检查用户是否有权限访问特定页面
 *
 * @param requiredRole 需要的角色（可选）
 * @returns 是否有权限访问
 */
export function useAuthGuard(requiredRole?: UserRole): {
  isAllowed: boolean
  isLoading: boolean
  isAuthenticated: boolean
  hasRequiredRole: boolean
} {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  const isAuthenticated = user !== null
  const hasRequiredRole = requiredRole
    ? profile?.role === requiredRole || profile?.role === 'admin'
    : true

  const isAllowed = isAuthenticated && hasRequiredRole && isInitialized

  return {
    isAllowed,
    isLoading: isLoading || !isInitialized,
    isAuthenticated,
    hasRequiredRole,
  }
}
