/* ============================================
   MultiForms Landing Page - Footer
   ============================================ */

import Link from 'next/link'
import { FileText } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="pt-[60px] pb-[30px] px-6 bg-[var(--bg-secondary)] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">MultiForms</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-[250px]">
              5分钟创建专业表单，让数据收集变得简单高效
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 flex-wrap">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">产品</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    功能
                  </a>
                </li>
                <li>
                  <a href="#templates" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    模板
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    价格
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">公司</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    关于
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    帮助
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    联系
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">法律</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    隐私
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                    条款
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
          <p>&copy; 2026 MultiForms. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#A78BFA] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[#A78BFA] transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
