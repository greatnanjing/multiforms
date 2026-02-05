/* ============================================
   MultiForms Route Protection Proxy (Next.js 16)

   路由保护代理：
   - 保护管理后台路由 (/admin/*)
   - 保护需要认证的路由 (/dashboard/*, /forms/*)
   - 公开路由：/, /login, /register, /f/*

   路径结构：
   - 公开: (public) - 无需认证
   - 用户: (dashboard) - 需要认证
   - 管理: admin/* - 需要管理员权限

   注意：Next.js 16 使用 proxy.ts 替代 middleware.ts
============================================ */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function proxy(req: NextRequest) {
  const { pathname } = new URL(req.url)

  // 允许的公开路由
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/auth/callback',
    '/test-supabase',
    '/admin-login',
  ]

  // 公开表单路由 (如 /f/xxx)
  if (pathname.startsWith('/f/')) {
    return NextResponse.next()
  }

  // 检查是否是公开路由
  if (publicPaths.includes(pathname) || publicPaths.some(path => pathname.startsWith(path + '/'))) {
    return NextResponse.next()
  }

  // 创建 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // 在 proxy 中不能设置 cookies
        },
        remove(name: string, options: any) {
          // 在 proxy 中不能删除 cookies
        },
      },
    }
  )

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession()

  // 管理后台路由保护
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // 未登录，重定向到管理登录页
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }

    // 检查用户是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      // 不是管理员，重定向到管理登录页并登出
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin-login?error=no_permission', req.url))
    }

    return NextResponse.next()
  }

  // 用户仪表盘路由保护
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/forms')) {
    if (!session) {
      // 未登录，重定向到登录页
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
