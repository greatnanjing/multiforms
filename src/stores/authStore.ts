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

      set({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '登出失败'
      set({ error: message, isLoading: false })
    }
  },

  // ============================================
  // 获取用户资料
  // ============================================
  fetchProfile: async () => {
    const { user } = get()

    if (!user) {
      set({ profile: null })
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error)
        set({ profile: null })
        return
      }

      set({ profile: data })
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ profile: null })
    }
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
