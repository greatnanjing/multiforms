import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  // 测试 1: 获取用户信息 (服务器组件使用 getUser)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // 测试 2: 检查数据库连接（查询 profiles 表，即使表不存在也能看到错误类型）
  const { data: profiles, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase 连接测试</h1>

        {/* 环境变量检查 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">环境变量</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <>
                  <span className="text-green-500">✓ 已配置</span>
                  <span className="text-gray-400">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
                </>
              ) : (
                <span className="text-red-500">✗ 未配置</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <span className="text-green-500">✓ 已配置</span>
              ) : (
                <span className="text-red-500">✗ 未配置</span>
              )}
            </div>
          </div>
        </section>

        {/* 会话检查 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">认证状态</h2>
          {userError ? (
            <div className="text-red-500">
              <p className="font-medium">✗ 用户信息获取失败</p>
              <p className="text-sm">{userError.message}</p>
            </div>
          ) : user ? (
            <div className="text-green-500">
              <p className="font-medium">✓ 已登录</p>
              <p className="text-sm">用户 ID: {user.id}</p>
              <p className="text-sm">邮箱: {user.email}</p>
            </div>
          ) : (
            <div className="text-yellow-600">
              <p className="font-medium">○ 未登录（这是正常的，仅表示没有活跃会话）</p>
            </div>
          )}
        </section>

        {/* 数据库连接检查 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">数据库连接</h2>
          {dbError ? (
            <div className="text-red-500">
              <p className="font-medium">✗ 数据库查询失败</p>
              <p className="text-sm">错误: {dbError.message}</p>
              {dbError.message.includes('does not exist') && (
                <p className="text-sm text-gray-500 mt-2">
                  提示: profiles 表尚未创建，请先在 Supabase 中创建表结构
                </p>
              )}
            </div>
          ) : (
            <div className="text-green-500">
              <p className="font-medium">✓ 数据库连接成功</p>
              <p className="text-sm">profiles 表可访问</p>
            </div>
          )}
        </section>

        {/* 总体状态 */}
        <section className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">总体状态</h2>
          {!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
            <div className="text-red-500 font-medium">✗ 配置不完整，请检查 .env.local 文件</div>
          ) : userError?.message.includes('Invalid') || dbError?.message.includes('Invalid') || dbError?.message.includes('API') ? (
            <div className="text-red-500 font-medium">✗ Supabase 配置有误，请检查 URL 和 ANON_KEY</div>
          ) : (
            <div className="text-green-500 font-medium">✓ Supabase 配置正确！</div>
          )}
        </section>
      </div>
    </div>
  )
}
