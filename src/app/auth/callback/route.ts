/* ============================================
   MultiForms Auth Callback Route Handler

   处理 Supabase 认证回调（服务端）：
   - 邮箱验证确认
   - OAuth 登录回调
   - 密码重置回调

   这是 Next.js 16 App Router 的推荐方式
============================================ */

import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // 如果有错误，重定向到登录页并显示错误信息
  if (error) {
    const redirectUrl = new URL('/login', requestUrl)
    redirectUrl.searchParams.set('error', error)
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // 如果有验证码，交换会话
  if (code) {
    const supabase = await createClient()

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      // 交换失败，重定向到登录页
      const redirectUrl = new URL('/login', requestUrl)
      redirectUrl.searchParams.set('error', 'exchange_failed')
      redirectUrl.searchParams.set('error_description', sessionError.message)
      return NextResponse.redirect(redirectUrl)
    }

    // 验证成功，重定向到 dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl))
  }

  // 没有验证码也没有错误，直接重定向到登录页
  return NextResponse.redirect(new URL('/login', requestUrl))
}
