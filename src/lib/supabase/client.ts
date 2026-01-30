import { createBrowserClient } from '@supabase/ssr'

/**
 * 浏览器端环境变量缓存
 * 避免重复检查
 */
let clientEnvCache: { url: string; key: string } | null = null

/**
 * 获取浏览器端 Supabase 配置
 */
function getBrowserSupabaseEnv() {
  if (clientEnvCache) {
    return clientEnvCache
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '缺少必需的 Supabase 环境变量。请确保已设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。'
    )
  }

  clientEnvCache = { url, key }
  return clientEnvCache
}

/**
 * 创建浏览器端 Supabase 客户端
 * 用于客户端组件（使用 'use client' 指令的组件）
 */
export function createClient() {
  const { url, key } = getBrowserSupabaseEnv()
  return createBrowserClient(url, key)
}
