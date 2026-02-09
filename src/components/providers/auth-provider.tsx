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
          // 检查是否为临时会话（用户选择了"不记住我"）
          const wasTempSession = localStorage.getItem('was_temp_session')
          const isTempSession = sessionStorage.getItem('temp_session')

          // 如果之前是临时会话，但 sessionStorage 已被清空（浏览器重新打开）
          // 则需要自动登出
          if (wasTempSession && !isTempSession) {
            console.log('[AuthProvider] Temporary session expired (browser closed), signing out...')
            localStorage.removeItem('was_temp_session')
            await supabase.auth.signOut()
            store.setUser(null)
            store.setProfile(null)
            store.setInitialized(true)
            store.setLoading(false)
            return
          }

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

                const currentPath = window.location.pathname

                // 管理员登录页面：不在这里处理重定向，让页面自己处理
                // 避免在 auth provider 中进行异步操作导致渲染阻塞
                if (currentPath === '/admin-login') {
                  // 异步获取 profile，不阻塞
                  store.fetchProfile().catch((err) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('[AuthProvider] Profile fetch failed:', err)
                    }
                  })
                  return
                }

                // 普通用户登录：直接重定向
                if (currentPath === '/login' || currentPath === '/register') {
                  router.replace('/dashboard')
                  // 异步获取 profile
                  store.fetchProfile().catch((err) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('[AuthProvider] Profile fetch failed:', err)
                    }
                  })
                } else {
                  // 其他情况：异步获取 profile
                  store.fetchProfile().catch((err) => {
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('[AuthProvider] Profile fetch failed:', err)
                    }
                  })
                }
              }
              break

            case 'SIGNED_OUT':
              store.setUser(null)
              store.setProfile(null)
              // 清理临时会话标记
              sessionStorage.removeItem('temp_session')
              localStorage.removeItem('was_temp_session')
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
