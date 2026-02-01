/**
 * 浏览器端 Supabase 客户端
 *
 * 使用标准 @supabase/supabase-js 客户端
 * createBrowserClient from @supabase/ssr 在某些环境下会超时
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建单例客户端
export const createClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createClient should only be used in client components')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// 导出一个共享的客户端实例（可选）
let browserClient: ReturnType<typeof createSupabaseClient> | null = null

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return browserClient
}
