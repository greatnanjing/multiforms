/* ============================================
   MultiForms Admin Users Page

   用户管理页面：
   - 用户列表
   - 搜索和筛选
   - 用户状态管理
   - 角色管理

   路径: /admin/users
============================================ */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Filter,
  UserPlus,
  Ban,
  ShieldCheck,
  Mail,
  Calendar,
  Loader2,
  ChevronDown,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, UserRole, UserStatus } from '@/types'

// ============================================
// Types
// ============================================

interface FilterState {
  search: string
  role: UserRole | 'all'
  status: UserStatus | 'all'
}

// ============================================
// Components
// ============================================

function UserRow({
  user,
  onViewDetail,
  onToggleStatus,
  onChangeRole
}: {
  user: Profile
  onViewDetail: (id: string) => void
  onToggleStatus: (id: string, currentStatus: UserStatus) => void
  onChangeRole: (id: string, role: UserRole) => void
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    creator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    guest: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const statusColors: Record<UserStatus, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    banned: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const roleLabels: Record<UserRole, string> = {
    admin: '管理员',
    creator: '创作者',
    guest: '访客'
  }

  const statusLabels: Record<UserStatus, string> = {
    active: '正常',
    inactive: '未激活',
    banned: '已封禁'
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
      {/* 用户信息 */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {(user.nickname || user.email?.charAt(0) || 'U').toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">
            {user.nickname || '未设置昵称'}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-white font-medium">{user.form_count || 0}</p>
          <p className="text-[var(--text-muted)] text-xs">表单</p>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">{user.submission_count || 0}</p>
          <p className="text-[var(--text-muted)] text-xs">提交</p>
        </div>
      </div>

      {/* 角色标签 */}
    <button
      onClick={() => setShowRoleMenu(!showRoleMenu)}
      className={cn(
        'relative px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
        roleColors[user.role as UserRole]
      )}
    >
      {roleLabels[user.role as UserRole]}
      <ChevronDown className="w-3 h-3 ml-1" />

      {showRoleMenu && (
        <div className="absolute top-full mt-1 right-0 z-10 w-32 rounded-lg bg-[var(--bg-secondary)] border border-white/10 shadow-xl overflow-hidden">
          {(['admin', 'creator', 'guest'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => {
                onChangeRole(user.id, role)
                setShowRoleMenu(false)
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors',
                user.role === role && 'bg-white/10'
              )}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      )}
    </button>

      {/* 状态标签 */}
    <span className={cn(
      'px-3 py-1.5 rounded-lg border text-xs font-medium',
      statusColors[user.status as UserStatus]
    )}>
      {statusLabels[user.status as UserStatus]}
    </span>

      {/* 注册时间 */}
      <div className="hidden md:block text-xs text-[var(--text-muted)]">
        {new Date(user.created_at).toLocaleDateString('zh-CN')}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewDetail(user.id)}
          className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
          title="查看详情"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(user.id, user.status as UserStatus)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            user.status === 'banned'
              ? 'hover:bg-green-500/10 text-green-400 hover:text-green-300'
              : 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
          )}
          title={user.status === 'banned' ? '解封用户' : '封禁用户'}
        >
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Users Page Component
// ============================================

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])

  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    status: 'all'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchSearch =
      !filters.search ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(filters.search.toLowerCase())

    const matchRole = filters.role === 'all' || user.role === filters.role
    const matchStatus = filters.status === 'all' || user.status === filters.status

    return matchSearch && matchRole && matchStatus
  })

  // 处理角色变更
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // 更新本地状态
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  // 处理状态切换
  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus: UserStatus = currentStatus === 'banned' ? 'active' : 'banned'

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          status: newStatus,
          banned_at: newStatus === 'banned' ? new Date().toISOString() : null
        })
        .eq('id', userId)

      if (error) throw error

      // 更新本地状态
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面描述 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[var(--text-secondary)]">
            管理平台用户、角色和权限
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
          <UserPlus className="w-4 h-4" />
          添加用户
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="搜索用户邮箱或昵称..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* 筛选按钮组 */}
        <div className="flex gap-3">
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | 'all' })}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="creator">创作者</option>
            <option value="guest">访客</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus | 'all' })}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">所有状态</option>
            <option value="active">正常</option>
            <option value="inactive">未激活</option>
            <option value="banned">已封禁</option>
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[var(--text-secondary)]">
          共 <span className="text-white font-medium">{filteredUsers.length}</span> 位用户
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          管理员 <span className="text-purple-400 font-medium">{users.filter(u => u.role === 'admin').length}</span>
        </span>
        <span className="text-[var(--text-muted)]">|</span>
        <span className="text-[var(--text-secondary)]">
          创作者 <span className="text-blue-400 font-medium">{users.filter(u => u.role === 'creator').length}</span>
        </span>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">没有找到匹配的用户</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <UserRow
              key={user.id}
              user={user}
              onViewDetail={(id) => router.push(`/admin/users/${id}`)}
              onToggleStatus={handleToggleStatus}
              onChangeRole={handleRoleChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
