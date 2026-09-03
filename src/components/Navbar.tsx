import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { navbarVariantFor } from '@/lib/navbar'
import type { NavbarVariant } from '@/lib/navbar'

const MARKETING_LINKS = [
  { label: '产品价值', href: '/#why' },
  { label: '支持学院', href: '/#colleges' },
  { label: '帮助与隐私', href: '/help' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <img src="/logo-seal.svg" alt="大学印记" className="h-8 w-8 rounded-md" />
      <span className="font-serif text-[18px] font-bold text-ink-900 tracking-title">
        大学印记
      </span>
      <span className="label-mono text-ink-500 border border-line rounded px-1.5 py-0.5 hidden sm:inline-block">
        综测助手
      </span>
    </Link>
  )
}

function SaveStatus() {
  const [time] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('cufe-zc:last-saved')
    } catch {
      return null
    }
  })
  return (
    <div className="flex items-center gap-2 text-caption text-ink-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="font-mono text-[12px]">
        {time ? `已自动保存 ${time}` : '暂存进度 · 自动保存已开启'}
      </span>
    </div>
  )
}

export default function Navbar({
  variant,
  section,
}: {
  /** 不传则按当前路由自动切换 */
  variant?: NavbarVariant
  /** 精简版：当前所在环节名，如「问卷向导 · 学术科研」 */
  section?: string
}) {
  const { pathname } = useLocation()
  const mode = variant ?? navbarVariantFor(pathname)
  const sectionName =
    section ?? (pathname.startsWith('/export') ? '导出清单' : '问卷向导')

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 w-full border-b border-line',
        'bg-[rgba(250,247,241,.85)] backdrop-blur-[12px]',
      )}
    >
      <div className="mx-auto flex h-full max-w-marketing items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 min-w-0">
          <Logo />
          {mode === 'compact' && (
            <span className="hidden md:inline-block truncate border-l border-line pl-4 text-caption text-ink-500">
              {sectionName}
            </span>
          )}
        </div>

        {mode === 'marketing' ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:flex items-center gap-1">
              {MARKETING_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="rounded-[10px] px-3 py-2 text-body text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <Link
              to="/wizard"
              className="ml-1 inline-flex items-center rounded-[10px] bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground shadow-card transition-all duration-200 ease-out-expo hover:bg-primary-deep"
            >
              开始填报
            </Link>
          </nav>
        ) : (
          <SaveStatus />
        )}
      </div>
    </header>
  )
}
