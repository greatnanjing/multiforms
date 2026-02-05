/* ============================================
   MultiForms Landing Page - Navbar
   ============================================ */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Menu, X } from 'lucide-react'

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '#features', label: '功能' },
    { href: '#templates', label: '模板' },
    { href: '#pricing', label: '价格' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-white/5 py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-heading">MultiForms</span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-[#6366F1] after:to-[#8B5CF6] hover:after:w-full after:transition-all"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] border border-white/10 rounded-xl hover:bg-white/5 hover:border-[#6366F1] hover:text-[#A78BFA] transition-all"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5 transition-all"
            >
              注册
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-[var(--text-primary)]"
            aria-label="菜单"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-[var(--bg-primary)]/95 backdrop-blur-xl p-6 transform transition-transform">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <nav className="flex flex-col gap-2 mt-16">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-5 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="w-full h-px bg-white/10 my-2" />
              <Link
                href="/login"
                className="px-5 py-3 text-base font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] rounded-xl transition-all"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-5 py-3 text-base font-medium text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl text-center mt-2"
              >
                免费注册
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
