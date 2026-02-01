/**
 * 浏览器端 Supabase 客户端
 *
 * 使用全局变量确保真正的单例模式
 * 避免 Next.js 热重载时重置模块变量
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
    global.client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    console.log('[Supabase] Singleton client created')
  }
  return global.client
}

// createClient 是 getBrowserClient 的别名，保持向后兼容
export const createClient = getBrowserClient
