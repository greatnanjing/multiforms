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

import { useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  // 使用 selector 获取稳定的函数引用
  const setUser = useAuthStore((state) => state.setUser)
  const setProfile = useAuthStore((state) => state.setProfile)
  const setInitialized = useAuthStore((state) => state.setInitialized)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    // 创建 Supabase 客户端
    const supabase = createClient()

    // 获取当前会话
    const initializeAuth = async () => {
      setLoading(true)

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setInitialized(true)
          setLoading(false)
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

          setUser(authUser)

          // 获取用户资料
          await fetchProfile()
        }

        setInitialized(true)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setInitialized(true)
        setLoading(false)
      }
    }

    // 初始化认证状态
    initializeAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED', session) => {
      console.log('Auth state changed:', event)

      switch (event) {
        case 'INITIAL_SESSION':
          // 初始会话已加载（由 initializeAuth 处理，这里只标记初始化完成）
          setInitialized(true)
          break

        case 'SIGNED_IN':
          // 用户登录
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || new Date().toISOString(),
            }

            setUser(authUser)
            await fetchProfile()
          }
          break

        case 'SIGNED_OUT':
          // 用户登出
          setUser(null)
          setProfile(null)
          break

        case 'TOKEN_REFRESHED':
          // Token 已刷新
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || new Date().toISOString(),
            }

            setUser(authUser)
          }
          break

        case 'USER_UPDATED':
          // 用户信息更新
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at || null,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || new Date().toISOString(),
            }

            setUser(authUser)
            await fetchProfile()
          }
          break

        default:
          break
      }

      setLoading(false)
    })

    // 清理函数
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setInitialized, fetchProfile, setLoading])

  return <>{children}</>
}

// ============================================
// Export
// ============================================

export default AuthProvider
