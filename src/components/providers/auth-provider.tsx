/* ============================================
   MultiForms Auth Provider

   认证状态提供者：
   - 监听 Supabase 认证状态变化
   - 自动更新 authStore
   - 处理会话刷新
============================================ */

'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'
import { useAuthStore, type AuthUser } from '@/stores/authStore'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const initializingRef = useRef(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // 检查是否为 AbortError
  const isAbortError = (error: unknown): boolean => {
    return (
      error instanceof Error &&
      (error.name === 'AbortError' ||
       error.message.includes('abort') ||
       error.message.includes('signal'))
    )
  }

  useEffect(() => {
    if (initializingRef.current) return
    initializingRef.current = true

    const supabase = getBrowserClient()
    const store = useAuthStore.getState()

    const initializeAuth = async () => {
      store.setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at || null,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || new Date().toISOString(),
          }
          store.setUser(authUser)
          // 不等待 profile 完成，让页面先渲染
          store.fetchProfile().catch(() => {
            // profile 获取失败也不影响登录
          })
        }
        // 立即设置初始化完成，不等待 profile
        store.setInitialized(true)
        store.setLoading(false)
      } catch (error) {
        // AbortError 静默处理
        if (!isAbortError(error)) {
          console.error('Error initializing auth:', error)
        }
        store.setInitialized(true)
        store.setLoading(false)
      }
    }

    initializeAuth()

    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
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
                // 不等待 profile 完成，让页面先渲染
                store.fetchProfile().catch(() => {})

                // 登录成功后重定向
                const currentPath = window.location.pathname
                if (currentPath === '/login' || currentPath === '/register') {
                  router.replace('/dashboard')
                } else if (currentPath === '/admin-login') {
                  router.replace('/admin/dashboard')
                }
              }
              break

            case 'SIGNED_OUT':
              store.setUser(null)
              store.setProfile(null)
              router.replace('/login')
              break

            case 'TOKEN_REFRESHED':
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
          }

          store.setLoading(false)
        }
      )

      subscriptionRef.current = subscription
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      initializingRef.current = false
    }
  }, [router])

  return <>{children}</>
}

export default AuthProvider
