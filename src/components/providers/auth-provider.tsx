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

    initializeAuth()

    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('[Auth] Event:', event)

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
                await store.fetchProfile()

                // 登录成功后重定向
                const currentPath = window.location.pathname
                if (currentPath === '/login' || currentPath === '/register') {
                  console.log('[Auth] Redirecting to /dashboard')
                  router.replace('/dashboard')
                } else if (currentPath === '/admin-login') {
                  console.log('[Auth] Redirecting to /admin/dashboard')
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
