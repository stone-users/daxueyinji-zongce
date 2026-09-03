import { useEffect, useState } from 'react'
import { moduleColor } from './modules'
import { cn } from '@/lib/utils'

interface AnchorNavProps {
  modules: string[]
  pendingReview: number
  needsEvidence: number
}

/** 模块锚点导航：粘在顶栏下方，scroll-spy 高亮当前可视分组 */
export default function AnchorNav({ modules, pendingReview, needsEvidence }: AnchorNavProps) {
  const [active, setActive] = useState<string>(modules[0] ?? '')

  useEffect(() => {
    const sections = modules
      .map((m) => document.getElementById(`module-${m}`))
      .filter((el): el is HTMLElement => Boolean(el))
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace(/^module-/, ''))
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [modules])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="sticky top-16 z-40 -mx-4 border-b border-line bg-[rgba(250,247,241,.85)] px-4 backdrop-blur-[12px] sm:-mx-6 sm:px-6 print:hidden">
      <div className="flex h-11 items-center gap-1 overflow-x-auto">
        {modules.map((m) => {
          const isActive = active === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => scrollTo(`module-${m}`)}
              className={cn(
                'relative flex h-full shrink-0 items-center gap-1.5 px-3 text-[14px] transition-colors',
                isActive ? 'font-bold text-ink-900' : 'text-ink-500 hover:text-ink-700',
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moduleColor(m) }} />
              {m}
              <span
                className={cn(
                  'absolute inset-x-3 bottom-0 h-[2px] rounded-full transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
                style={{ backgroundColor: moduleColor(m) }}
              />
            </button>
          )
        })}
        {(pendingReview > 0 || needsEvidence > 0) && (
          <button
            type="button"
            onClick={() => scrollTo('pending-summary')}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-warning/50 bg-warning-soft px-3 py-1 font-mono text-[12px] text-warning"
          >
            {pendingReview > 0 && <span>待评议 {pendingReview}</span>}
            {needsEvidence > 0 && <span>待补 {needsEvidence}</span>}
          </button>
        )}
      </div>
    </nav>
  )
}
