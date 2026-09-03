import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { HELP_SECTIONS } from '@/components/help/sections'

function useActiveSection(): string {
  const [active, setActive] = useState<string>(HELP_SECTIONS[0].id)

  useEffect(() => {
    const sections = HELP_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}

/**
 * 帮助页锚点目录：
 * - 桌面端（lg+）：左侧粘性竖排目录
 * - 移动端：顶部横向滚动条
 */
export default function HelpToc() {
  const active = useActiveSection()

  return (
    <nav aria-label="帮助页目录" className="lg:sticky lg:top-24">
      {/* 桌面端竖排 */}
      <ul className="hidden space-y-1 lg:block">
        {HELP_SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'group flex items-baseline gap-3 rounded-[10px] px-3 py-2 text-body transition-all duration-200 ease-out-expo',
                active === s.id
                  ? 'bg-paper-100 text-ink-900 font-medium'
                  : 'text-ink-500 hover:bg-paper-100/60 hover:text-ink-700',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[11px] tracking-mono',
                  active === s.id ? 'text-seal' : 'text-ink-300 group-hover:text-ink-500',
                )}
              >
                {s.index}
              </span>
              <span>{s.label}</span>
              {active === s.id && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 self-center rounded-full bg-seal" />
              )}
            </a>
          </li>
        ))}
      </ul>

      {/* 移动端横滚 */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:hidden">
        <ul className="flex gap-2 whitespace-nowrap">
          {HELP_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors',
                  active === s.id
                    ? 'border-seal/40 bg-seal-soft text-seal font-medium'
                    : 'border-line bg-card text-ink-500 hover:text-ink-700',
                )}
              >
                <span className="font-mono text-[10px]">{s.index}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
