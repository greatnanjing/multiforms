/* ============================================
   MultiForms Dashboard Loading Page

   仪表盘加载状态页面：
   - 居中加载动画
   - 品牌渐变色
   - 显示 "加载中..." 提示

   路径: /dashboard/loading
============================================ */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo 图标 */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-start)] to-[var(--primary-end)] flex items-center justify-center shadow-lg animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-white"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
        </div>

        {/* 加载提示 */}
        <div className="flex items-center gap-3">
          {/* Spinner */}
          <div className="w-5 h-5 border-2 border-[var(--primary-start)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">加载中...</p>
        </div>
      </div>
    </div>
  )
}
