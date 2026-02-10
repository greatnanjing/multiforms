/* ============================================
   MultiForms Admin Logs Page

   操作日志页面：
   - 管理员操作记录
   - 系统活动日志
   - 审计追踪

   路径: /admin/logs
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Filter,
  Shield,
  Clock,
  Loader2,
  ListTodo,
  User,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

// ============================================
// Types
// ============================================

type AdminLog = Database['public']['Tables']['admin_logs']['Row']

const actionLabels: Record<string, string> = {
  login: '登录',
  logout: '登出',
  view_user: '查看用户',
  update_user: '更新用户',
  ban_user: '封禁用户',
  delete_user: '删除用户',
  view_form: '查看表单',
  update_form: '更新表单',
  delete_form: '删除表单',
  ban_form: '封禁表单',
  approve_template: '批准模板',
  delete_template: '删除模板',
  update_settings: '更新设置',
  export_data: '导出数据',
  view_logs: '查看日志'
}

// ============================================
// Components
// ============================================

function LogEntry({ log }: { log: AdminLog }) {
  const actionColors: Record<string, string> = {
    login: 'text-green-400',
    logout: 'text-gray-400',
    view_user: 'text-blue-400',
    update_user: 'text-yellow-400',
    ban_user: 'text-red-400',
    delete_user: 'text-red-500',
    view_form: 'text-blue-400',
    update_form: 'text-yellow-400',
    delete_form: 'text-red-500',
    ban_form: 'text-red-400',
    approve_template: 'text-green-400',
    delete_template: 'text-red-500',
    update_settings: 'text-purple-400',
    export_data: 'text-cyan-400',
    view_logs: 'text-gray-400'
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      {/* 图标 */}
      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        <Shield className="w-5 h-5 text-purple-400" />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'text-sm font-medium',
            actionColors[log.action] || 'text-[var(--text-secondary)]'
          )}>
            {actionLabels[log.action] || log.action}
          </span>
          {log.resource_type && (
            <>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-sm text-[var(--text-secondary)]">{log.resource_type}</span>
            </>
          )}
        </div>
        {log.ip_address && (
          <p className="text-xs text-[var(--text-muted)]">
            IP: {log.ip_address}
          </p>
        )}
        {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
            {JSON.stringify(log.details)}
          </p>
        )}
      </div>

      {/* 时间 */}
      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {new Date(log.created_at || '').toLocaleString('zh-CN')}
      </div>
    </div>
  )
}

// ============================================
// Logs Page Component
// ============================================

export default function AdminLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤日志
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.action === filter
  })

  const actionOptions = [
    { value: 'all', label: '全部操作' },
    { value: 'login', label: '登录/登出' },
    { value: 'view_user', label: '用户操作' },
    { value: 'update_user', label: '用户更新' },
    { value: 'ban_user', label: '用户封禁' },
    { value: 'view_form', label: '表单查看' },
    { value: 'update_form', label: '表单更新' },
    { value: 'delete_form', label: '表单删除' },
    { value: 'update_settings', label: '系统设置' }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">操作日志</h1>
        <p className="text-[var(--text-secondary)]">
          管理员操作记录和系统审计日志
        </p>
      </div>

      {/* 筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="搜索日志..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
        >
          {actionOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* 统计 */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[var(--text-secondary)]">
          共 <span className="text-white font-medium">{filteredLogs.length}</span> 条记录
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          最近 7 天
        </span>
      </div>

      {/* 日志列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
          <ListTodo className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">暂无日志记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
