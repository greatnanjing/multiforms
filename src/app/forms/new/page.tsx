/* ============================================
   MultiForms New Form Page

   新建表单页面：
   - 创建空表单
   - 跳转到编辑器

   路径: /forms/new
============================================ */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewFormPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    const createNewForm = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Auth error:', userError)
          router.push('/login')
          return
        }

        // 创建新表单
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // 检查用户权限
        const role = profile?.role || user.user_metadata?.role || 'guest'

        // 创建表单（type: collection 表示通用收集类型）
        // short_id 由数据库触发器自动生成
        const { data: newForm, error: createError } = await supabase
          .from('forms')
          .insert({
            user_id: user.id,
            title: '未命名表单',
            description: '',
            type: 'collection', // 必填字段：vote/survey/rating/feedback/collection
            status: 'draft',
          })
          .select()
          .single()

        if (createError) {
          console.error('[New Form] Failed to create form:', createError)
          setError('创建表单失败')
          setErrorDetails(`${createError.message} (Code: ${createError.code})`)
          setIsCreating(false)
          return
        }

        // 跳转到编辑页面
        router.push(`/forms/${newForm.id}/edit`)
      } catch (err) {
        console.error('[New Form] Error:', err)
        setError('创建表单失败')
        setErrorDetails(err instanceof Error ? err.message : JSON.stringify(err))
        setIsCreating(false)
      }
    }

    createNewForm()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">创建失败</h2>
          <p className="text-red-400 mb-2">{error}</p>
          {errorDetails && (
            <p className="text-sm text-[var(--text-muted)] mb-6 font-mono bg-black/20 p-2 rounded">
              {errorDetails}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setIsCreating(true)
                setError(null)
                setErrorDetails(null)
              }}
              className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
            >
              重试
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className={cn(
                'px-6 py-2.5 rounded-xl',
                'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)]',
                'text-white font-medium'
              )}
            >
              返回仪表盘
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">正在创建表单...</p>
      </div>
    </div>
  )
}
