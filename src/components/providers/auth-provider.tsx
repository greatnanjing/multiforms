/* ============================================
   MultiForms Auth Provider

   认证状态提供者：
   - 监听 Supabase 认证状态变化
   - 自动更新 authStore
   - 处理会话刷新
   - 处理 Token 刷新

   Usage:
   ```tsx
   import { AuthProvider } from '@/components/providers/auth-provider'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>
             {children}
           </AuthProvider>
         </body>
       </html>
     )
   }
   ```
============================================ */

'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import { useAuthStore, type AuthUser } from '@/stores/authStore'

// ============================================
// Types
// ============================================

interface AuthProviderProps {
  children: ReactNode
}

// ============================================
// Auth Provider Component
// ============================================

/**
 * 认证状态提供者
 *
 * 监听 Supabase 的认证状态变化，并自动更新 Zustand store
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initializingRef = useRef(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    // 防止重复初始化
    if (initializingRef.current) return
    initializingRef.current = true

    // 使用单例 Supabase 客户端
    const supabase = getBrowserClient()
    const store = useAuthStore.getState()

    // 获取当前会话
    const initializeAuth = async () => {
      store.setLoading(true)

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          store.setInitialized(true)
          store.setLoading(false)
          return
        }

        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || new Date().toISOString(),
          }

          store.setUser(authUser)
          // 获取用户资料
          await store.fetchProfile()
        }

        store.setInitialized(true)
        store.setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        store.setInitialized(true)
        store.setLoading(false)
      }
    }

    // 初始化认证状态
    initializeAuth()

    // 监听认证状态变化（只订阅一次）
    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('[Auth] State changed:', event)

          switch (event) {
            case 'INITIAL_SESSION':
              store.setInitialized(true)
              break

            case 'SIGNED_IN':
              if (session?.user) {
                const authUser: AuthUser = {
                  id: session.user.id,
                  email: session.user.email || '',
                  email_confirmed_at: session.user.email_confirmed_at || null,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || new Date().toISOString(),
                }
                store.setUser(authUser)
                // 延迟获取 profile，避免与 INITIAL_SESSION 冲突
                setTimeout(() => store.fetchProfile(), 100)
              }
              break

            case 'SIGNED_OUT':
              store.setUser(null)
              store.setProfile(null)
              break

            case 'TOKEN_REFRESHED':
              if (session?.user) {
                const authUser: AuthUser = {
                  id: session.user.id,
                  email: session.user.email || '',
                  email_confirmed_at: session.user.email_confirmed_at || null,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || new Date().toISOString(),
                }
                store.setUser(authUser)
              }
              break

            case 'USER_UPDATED':
              if (session?.user) {
                const authUser: AuthUser = {
                  id: session.user.id,
                  email: session.user.email || '',
                  email_confirmed_at: session.user.email_confirmed_at || null,
                  created_at: session.user.created_at,
                  updated_at: session.user.updated_at || new Date().toISOString(),
                }
                store.setUser(authUser)
              }
              break

            default:
              break
          }

          store.setLoading(false)
        }
      )

      subscriptionRef.current = subscription
    }

    // 清理函数
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      initializingRef.current = false
    }
  }, []) // 空依赖数组 - 只运行一次

  return <>{children}</>
}

// ============================================
// Export
// ============================================

export default AuthProvider
