/* ============================================
   MultiForms Root Layout

   根布局文件：
   - Google Fonts 导入
   - 主题提供者
   - Supabase 认证
   - 全局样式
============================================ */

// Force dynamic rendering to prevent build-time Supabase errors
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { ToastProvider } from '@/components/shared/toast'
import { ConfirmProvider } from '@/components/shared/confirm-dialog'

// 字体配置
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// 元数据配置
export const metadata: Metadata = {
  title: {
    default: 'MultiForms - 5分钟创建专业表单',
    template: '%s | MultiForms',
  },
  description:
    'MultiForms 是一款在线表单构建工具，支持投票、评分、问卷、信息收集等多种场景。拖拽式操作，5分钟即可创建专业表单。',
  keywords: ['表单', '问卷', '投票', '评分', '信息收集', '在线表单', '表单 builder'],
  authors: [{ name: 'MultiForms' }],
  creator: 'MultiForms',
  publisher: 'MultiForms',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://multiforms.app',
    title: 'MultiForms - 5分钟创建专业表单',
    description: '投票、评分、问卷、信息收集，5分钟创建专业表单',
    siteName: 'MultiForms',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MultiForms - 5分钟创建专业表单',
    description: '投票、评分、问卷、信息收集，5分钟创建专业表单',
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
        className={`${inter.variable} font-sans antialiased`}
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
