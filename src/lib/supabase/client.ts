import { createBrowserClient } from '@supabase/ssr'

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件（使用 'use client' 指令的组件）
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return createBrowserClient(url, key)
}
