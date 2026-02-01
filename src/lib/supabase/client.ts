/**
 * 浏览器端 Supabase 客户端
 *
 * 使用 @supabase/ssr 的 createBrowserClient
 * 确保会话存储在 cookies 中，让 middleware 能正确读取
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
        // 使用 cookies 存储，确保 middleware 能读取会话
        flowType: 'pkce', // 使用 PKCE flow，更安全
      },
    })
    console.log('[Supabase] Singleton client created')
  }
  return global.client
}

// createClient 是 getBrowserClient 的别名，保持向后兼容
export const createClient = getBrowserClient
