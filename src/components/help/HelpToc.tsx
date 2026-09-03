import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { HELP_SECTIONS } from './sections'

/** 帮助页锚点目录：桌面端左侧 sticky + scroll-spy；移动端顶部横向滚动 */
export default function HelpToc() {
  const [active, setActive] = useState<string>(HELP_SECTIONS[0].id)

  useEffect(() => {
    const sections = HELP_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* 桌面端：sticky 侧栏 */}
      <nav className="sticky top-24 hidden self-start lg:block" aria-label="帮助目录">
        <p className="label-mono text-ink-300">CONTENTS</p>
        <ul className="mt-3 space-y-1">
          {HELP_SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => jump(s.id)}
                className={cn(
                  'block w-full rounded-[8px] px-3 py-2 text-left text-body transition-colors',
                  active === s.id
                    ? 'bg-paper-100 font-medium text-primary'
                    : 'text-ink-500 hover:bg-paper-100 hover:text-ink-900',
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 移动端：顶部横向滚动条 */}
      <nav className="sticky top-16 z-30 -mx-4 border-b border-line bg-[rgba(250,247,241,.92)] px-4 py-2.5 backdrop-blur-[12px] lg:hidden" aria-label="帮助目录">
        <div className="flex gap-2 overflow-x-auto">
          {HELP_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
                active === s.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-line bg-card text-ink-700',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
