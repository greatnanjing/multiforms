import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * 创建服务器端 Supabase 客户端
 * 用于服务器组件、路由处理器、服务器操作
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在服务器组件中设置 cookie 可能会失败
            // 这是一个已知限制，不会影响功能
          }
        },
      },
    }
  )
}
