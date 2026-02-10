/* ============================================
   表单随心填 Root Layout

   根布局文件：
   - Google Fonts 导入
   - 主题提供者
   - Supabase 认证
   - 全局样式
============================================ */

// Force dynamic rendering to prevent build-time Supabase errors
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider } from '@/components/shared/toast'
import { ConfirmProvider } from '@/components/shared/confirm-dialog'

// 元数据配置
export const metadata: Metadata = {
  title: {
    default: '表单随心填 - 1分钟创建专业表单',
    template: '%s | 表单随心填',
  },
  description:
    '表单随心填 是一款在线表单构建工具，支持投票、评分、问卷、信息收集等多种场景。拖拽式操作，1分钟即可创建专业表单。',
  keywords: ['表单', '问卷', '投票', '评分', '信息收集', '在线表单', '表单 builder'],
  authors: [{ name: '表单随心填' }],
  creator: '表单随心填',
  publisher: '表单随心填',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://multiforms.app',
    title: '表单随心填 - 1分钟创建专业表单',
    description: '投票、评分、问卷、信息收集，1分钟创建专业表单',
    siteName: '表单随心填',
  },
  twitter: {
    card: 'summary_large_image',
    title: '表单随心填 - 1分钟创建专业表单',
    description: '投票、评分、问卷、信息收集，1分钟创建专业表单',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className="antialiased overflow-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="nebula" defaultMode="dark">
          <ErrorBoundary>
            <ToastProvider>
              <ConfirmProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </ConfirmProvider>
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
