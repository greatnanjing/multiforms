/* ============================================
   MultiForms Admin Settings Page

   系统设置页面：
   - 系统配置参数
   - 功能开关
   - 限制设置

   路径: /admin/settings
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  RefreshCw,
  Loader2,
  Settings,
  Globe,
  Users,
  Shield,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface SystemSetting {
  key: string
  value: any
  description: string | null
}

// ============================================
// Components
// ============================================

function SettingSection({
  icon: Icon,
  title,
  children
}: {
  icon: any
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ============================================
// Settings Page Component
// ============================================

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'public.%')

      if (error) throw error

      // 转换为对象
      const settingsObj: Record<string, any> = {}
      data?.forEach((s: SystemSetting) => {
        settingsObj[s.key] = s.value
      })

      setSettings(settingsObj)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // 更新每个设置
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('system_settings')
          .update({ value })
          .eq('key', key)
      }

      alert('设置已保存')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">系统设置</h1>
          <p className="text-[var(--text-secondary)]">
            配置平台参数和功能开关
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      {/* 基本设置 */}
      <SettingSection icon={Globe} title="基本设置">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">站点名称</label>
            <input
              type="text"
              value={settings['public.site_name'] || ''}
              onChange={(e) => updateSetting('public.site_name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">站点描述</label>
            <textarea
              value={settings['public.site_description'] || ''}
              onChange={(e) => updateSetting('public.site_description', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>
      </SettingSection>

      {/* 用户设置 */}
      <SettingSection icon={Users} title="用户设置">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">允许用户注册</p>
              <p className="text-xs text-[var(--text-muted)]">新用户可以自行注册账号</p>
            </div>
            <button
              onClick={() => updateSetting('public.user_registration', !settings['public.user_registration'])}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                settings['public.user_registration'] ? 'bg-green-500' : 'bg-gray-600'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                settings['public.user_registration'] ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">访客创建表单</p>
              <p className="text-xs text-[var(--text-muted)]">未登录用户可创建表单</p>
            </div>
            <button
              onClick={() => updateSetting('public.guest_form_creation', !settings['public.guest_form_creation'])}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                settings['public.guest_form_creation'] ? 'bg-green-500' : 'bg-gray-600'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                settings['public.guest_form_creation'] ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm font-medium text-white mb-2">访客最大表单数</p>
            <input
              type="number"
              value={settings['public.max_forms_per_guest'] || 3}
              onChange={(e) => updateSetting('public.max_forms_per_guest', parseInt(e.target.value) || 3)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </SettingSection>

      {/* 限制设置 */}
      <SettingSection icon={Shield} title="限制设置">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm font-medium text-white mb-2">访客表单最大提交数</p>
            <input
              type="number"
              value={settings['public.max_responses_per_form'] || 100}
              onChange={(e) => updateSetting('public.max_responses_per_form', parseInt(e.target.value) || 100)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">单个表单的最大提交数量</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm font-medium text-white mb-2">最大文件上传大小 (MB)</p>
            <input
              type="number"
              value={(parseInt(settings['storage.max_file_size']) || 10485760) / (1024 * 1024)}
              onChange={(e) => updateSetting('storage.max_file_size', (parseInt(e.target.value) || 10) * 1024 * 1024)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">单个文件的最大大小</p>
          </div>
        </div>
      </SettingSection>

      {/* 数据库设置 */}
      <SettingSection icon={Database} title="数据库信息">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">11</p>
            <p className="text-xs text-[var(--text-muted)]">数据表</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-purple-400">6</p>
            <p className="text-xs text-[var(--text-muted)]">枚举类型</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-blue-400">6</p>
            <p className="text-xs text-[var(--text-muted)]">辅助函数</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-green-400">RLS</p>
            <p className="text-xs text-[var(--text-muted)]">已启用</p>
          </div>
        </div>
      </SettingSection>
    </div>
  )
}
