/* ============================================
   MultiForms Environment Variable Validation

   环境变量验证工具：
   - 启动时验证必需的环境变量
   - 提供类型安全的访问方法
   - 防止运行时崩溃
============================================ */

/**
 * 必需的环境变量列表
 */
const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase 项目 URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase 匿名密钥',
} as const

/**
 * 环境变量验证错误
 */
class EnvValidationError extends Error {
  constructor(missingVar: string, description: string) {
    super(
      `缺少必需的环境变量: ${missingVar} (${description})。\n` +
      `请在 .env.local 文件中设置此变量。`
    )
    this.name = 'EnvValidationError'
  }
}

/**
 * 验证所有必需的环境变量
 * 在应用启动时调用
 */
export function validateEnv(): void {
  // 仅在服务端验证
  if (typeof window !== 'undefined') {
    return
  }

  const missingVars: string[] = []

  for (const [envVar, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[envVar]) {
      missingVars.push(`${envVar} (${description})`)
    }
  }

  if (missingVars.length > 0) {
    throw new EnvValidationError(
      missingVars[0],
      `缺少 ${missingVars.length} 个必需的环境变量:\n${missingVars.join('\n')}`
    )
  }
}

/**
 * 获取 Supabase 环境变量（类型安全）
 * 如果变量不存在，抛出明确的错误
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new EnvValidationError('NEXT_PUBLIC_SUPABASE_URL', 'Supabase 项目 URL')
  }

  if (!anonKey) {
    throw new EnvValidationError('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase 匿名密钥')
  }

  return { url, anonKey }
}

/**
 * 获取可选的环境变量，提供默认值
 */
export function getOptionalEnv<T extends string>(
  key: string,
  defaultValue: T
): T {
  return (process.env[key] as T) ?? defaultValue
}
