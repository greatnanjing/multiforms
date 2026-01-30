import { createBrowserClient } from '@supabase/ssr'

/**
 * 浏览器端 Supabase 客户端缓存
 * 确保只创建一个实例
 */
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件（使用 'use client' 指令的组件）
 *
 * 注意：此函数仅在浏览器端运行，环境变量由构建时注入
 */
export function createClient() {
  // 浏览器端环境变量由 Next.js 在构建时注入
  // 如果未设置，返回空字符串（运行时会有实际值）
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  // 复用已创建的客户端实例
  if (clientInstance) {
    return clientInstance
  }

  clientInstance = createBrowserClient(url, key)
  return clientInstance
}
