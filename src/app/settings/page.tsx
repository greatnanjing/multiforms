/* ============================================
   MultiForms Settings Page

   设置页面：
   - 账户设置
   - 偏好设置

   路径: /settings
============================================ */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { User, Bell, Lock, Palette, Globe } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Lock },
    { id: 'appearance', label: '外观设置', icon: Palette },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* 页面描述 */}
        <div className="mb-6">
          <p className="text-[var(--text-secondary)]">
            管理您的账户和偏好设置
          </p>
        </div>

        {/* 设置内容 */}
        <div className="glass-card">
          {/* 标签导航 */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px
                    ${activeTab === tab.id
                      ? 'text-white border-[var(--primary-start)]'
                      : 'text-[var(--text-secondary)] border-transparent hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">个人资料</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        昵称
                      </label>
                      <input
                        type="text"
                        placeholder="输入您的昵称"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-start)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        邮箱
                      </label>
                      <input
                        type="email"
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    保存更改
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">通知设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">新回复通知</p>
                      <p className="text-sm text-[var(--text-muted)]">当表单有新回复时通知我</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-white/10 relative transition-colors">
                      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">周报摘要</p>
                      <p className="text-sm text-[var(--text-muted)]">每周发送表单数据摘要</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-white/10 relative transition-colors">
                      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">安全设置</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-left">
                      <p className="text-white font-medium">修改密码</p>
                      <p className="text-sm text-[var(--text-muted)]">更改您的登录密码</p>
                    </div>
                    <span className="text-[var(--text-secondary)]">→</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-left">
                      <p className="text-white font-medium">两步验证</p>
                      <p className="text-sm text-[var(--text-muted)]">添加额外的安全保护</p>
                    </div>
                    <span className="text-[var(--text-muted)]">→</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white mb-4">外观设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                      主题
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {['nebula', 'ocean', 'sunset', 'forest'].map((theme) => (
                        <button
                          key={theme}
                          className="h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 opacity-60 hover:opacity-100 transition-opacity"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                      语言
                    </label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--primary-start)] transition-colors">
                      <option value="zh">简体中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
