/**
 * 浏览器端 Supabase 客户端
 *
 * 使用 @supabase/ssr 的 createBrowserClient
 * 使用默认 cookie 存储，确保与服务器端兼容
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 诊断日志：验证环境变量是否正确加载
if (typeof window !== 'undefined') {
  console.log('[Supabase Client] Environment check:', {
    urlSet: !!supabaseUrl,
    keySet: !!supabaseAnonKey,
    url: supabaseUrl,
    // 只打印 key 的前几个字符用于验证
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'not set'
  })
}

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
    global.client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // 使用默认的 cookie 存储，不需要自定义 storage
        // 这样服务器端的 createServerClient 才能正确读取会话
      },
    })
  }
  return global.client
}

// createClient 是 getBrowserClient 的别名，保持向后兼容
export const createClient = getBrowserClient
