/* ============================================
   MultiForms Auth Store (Zustand)

   认证状态管理：
   - 用户登录状态
   - 用户资料信息
   - 认证方法（登录、注册、登出）
   - 资料获取方法

   Usage:
   ```ts
   import { useAuthStore } from '@/stores/authStore'

   // 在组件中使用
   const { user, profile, signIn, signOut } = useAuthStore()
   ```
============================================ */

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types'

// ============================================
// Utilities
// ============================================

/** 检查是否为 AbortError（请求被取消） */
function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
     error.message.includes('abort') ||
     error.message.includes('signal'))
  )
}

// ============================================
// Types
// ============================================

/** Supabase Auth User */
export interface AuthUser {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  updated_at: string
}

/** Auth State */
interface AuthState {
  // 状态
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  _fetchingProfile: boolean // 内部状态：防止并发请求
  _profilePromise: Promise<void> | null // 内部状态：共享的 profile 请求 promise

  // Actions
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // 认证方法
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  refreshSession: () => Promise<void>

  // 辅助方法
  isAuthenticated: () => boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  isCreator: () => boolean
}

// ============================================
// Store
// ============================================

export const useAuthStore = create<AuthState>((set, get) => ({
  // 初始状态
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  _fetchingProfile: false, // 内部状态：防止并发请求
  _profilePromise: null, // 内部状态：共享的 profile 请求 promise

  // Setters
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ============================================
  // 登录
  // ============================================
  signIn: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ error: error.message, isLoading: false })
        return { success: false, error: error.message }
      }

      // 获取用户资料
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          email_confirmed_at: data.user.email_confirmed_at || null,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || new Date().toISOString(),
        }

        set({ user: authUser, isLoading: false })

        // 获取 profile
        await get().fetchProfile()

        return { success: true }
      }

      set({ isLoading: false })
      return { success: false, error: '登录失败' }
    } catch (error) {
      // AbortError 是请求被取消，属于正常情况，静默处理
      if (isAbortError(error)) {
        set({ isLoading: false })
        return { success: false, error: '请求已取消' }
      }
      const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  // ============================================
  // 注册
  // ============================================
  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null })

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        set({ error: error.message, isLoading: false })
        return { success: false, error: error.message }
      }

      // 如果已经有 session，说明不需要邮箱验证
      if (data.session) {
        const authUser: AuthUser = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          email_confirmed_at: data.session.user.email_confirmed_at || null,
          created_at: data.session.user.created_at,
          updated_at: data.session.user.updated_at || new Date().toISOString(),
        }

        set({ user: authUser, isLoading: false })

        // 获取 profile
        await get().fetchProfile()

        return { success: true, requiresEmailVerification: false }
      }

      set({ isLoading: false })
      // 需要 email 验证
      return { success: true, requiresEmailVerification: true }
    } catch (error) {
      if (isAbortError(error)) {
        set({ isLoading: false })
        return { success: false, error: '请求已取消' }
      }
      const message = error instanceof Error ? error.message : '注册失败，请稍后重试'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  // ============================================
  // 登出
  // ============================================
  signOut: async () => {
    set({ isLoading: true, error: null })

    try {
      const supabase = createClient()
      await supabase.auth.signOut()

      // 清除本地状态
      set({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      })

      // 刷新页面以确保状态完全清除
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      if (isAbortError(error)) {
        set({ isLoading: false })
        return
      }
      const message = error instanceof Error ? error.message : '登出失败'
      set({ error: message, isLoading: false })
    }
  },

  // ============================================
  // 获取用户资料
  // ============================================
  fetchProfile: async () => {
    const { user, _fetchingProfile, _profilePromise } = get()

    // 如果已有请求在进行中，等待该请求完成
    if (_fetchingProfile && _profilePromise) {
      return _profilePromise
    }

    if (!user) {
      set({ profile: null })
      return
    }

    // 创建新的请求 promise
    const profilePromise = (async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          // 忽略 "表不存在" 错误 - 数据库可能还未初始化
          const isTableNotExist = error.message?.includes('does not exist') ||
                                    error.code === 'PGRST116' ||
                                    error.code === '42P01'

          if (!isTableNotExist) {
            console.warn('[AuthStore] Failed to fetch profile:', error.message)
          }

          set({ profile: null, _fetchingProfile: false, _profilePromise: null })
          return
        }

        set({ profile: data, _fetchingProfile: false, _profilePromise: null })
      } catch (error) {
        // AbortError 或 fetch 错误 - 静默处理
        if (isAbortError(error) || (error as any).message?.includes('fetch') || (error as any).code === 'PGRST116') {
          // 表不存在等预期错误，静默处理
        } else {
          console.warn('[AuthStore] Error fetching profile:', error)
        }
        set({ profile: null, _fetchingProfile: false, _profilePromise: null })
      }
    })()

    // 标记正在获取并保存 promise
    set({ _fetchingProfile: true, _profilePromise: profilePromise })

    return profilePromise
  },

  // ============================================
  // 刷新会话
  // ============================================
  refreshSession: async () => {
    set({ isLoading: true, error: null })

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        set({ error: error.message, isLoading: false })
        return
      }

      if (data.session?.user) {
        const authUser: AuthUser = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          email_confirmed_at: data.session.user.email_confirmed_at || null,
          created_at: data.session.user.created_at,
          updated_at: data.session.user.updated_at || new Date().toISOString(),
        }

        set({ user: authUser, isLoading: false })

        // 获取 profile
        await get().fetchProfile()
      } else {
        set({ user: null, profile: null, isLoading: false })
      }
    } catch (error) {
      if (isAbortError(error)) {
        set({ isLoading: false })
        return
      }
      const message = error instanceof Error ? error.message : '刷新会话失败'
      set({ error: message, isLoading: false })
    }
  },

  // ============================================
  // 辅助方法
  // ============================================
  isAuthenticated: () => {
    const { user } = get()
    return user !== null
  },

  hasRole: (role: UserRole) => {
    const { profile } = get()
    return profile?.role === role
  },

  isAdmin: () => {
    return get().hasRole('admin')
  },

  isCreator: () => {
    const { profile } = get()
    return profile?.role === 'admin' || profile?.role === 'creator'
  },
}))

// ============================================
// Selector Hooks（用于性能优化）
// ============================================

/** 获取用户信息 */
export const useUser = () => useAuthStore((state) => state.user)

/** 获取用户资料 */
export const useProfile = () => useAuthStore((state) => state.profile)

/** 获取加载状态 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)

/** 获取初始化状态 */
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized)

/** 获取错误信息 */
export const useAuthError = () => useAuthStore((state) => state.error)

/** 检查是否已登录 */
export const useIsAuthenticated = () => useAuthStore((state) => state.user !== null)

/** 检查是否是管理员 */
export const useIsAdmin = () => useAuthStore((state) => state.profile?.role === 'admin')

/** 检查是否是创建者或管理员 */
export const useIsCreator = () =>
  useAuthStore((state) => state.profile?.role === 'admin' || state.profile?.role === 'creator')
