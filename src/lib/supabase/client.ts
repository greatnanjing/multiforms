/**
 * 浏览器端 Supabase 客户端
 *
 * 使用 @supabase/ssr 的 createBrowserClient
 * 配置 cookies 存储以确保 middleware 能读取会话
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 使用全局变量，热重载时不会丢失
const getGlobal = () => {
  if (typeof window === 'undefined') return null
  return (window as any).__SUPABASE_CLIENT__ ??= {}
}

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be used in client components')
  }

  const global = getGlobal()
  if (!global.client) {
    console.log('[Supabase] Creating singleton browser client...')
    global.client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // 关键：配置 cookies 存储和刷新
        storage: {
          getItem: (key) => {
            const cookies = document.cookie.split(';')
            const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
            return cookie ? cookie.split('=')[1] : null
          },
          setItem: (key, value) => {
            // 设置 cookie，确保 httpOnly 安全
            document.cookie = `${key}=${value}; path=/; max-age=3600; SameSite=Lax`
          },
          removeItem: (key) => {
            document.cookie = `${key}=; path=/; max-age=-1`
          },
        },
      },
    })
    console.log('[Supabase] Singleton client created with cookie storage')
  }
  return global.client
}

// createClient 是 getBrowserClient 的别名，保持向后兼容
export const createClient = getBrowserClient
