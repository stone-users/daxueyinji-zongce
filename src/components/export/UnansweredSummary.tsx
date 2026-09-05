import { motion } from 'framer-motion'
import { PencilLine } from 'lucide-react'
import { Link } from 'react-router'
import { moduleColor } from './modules'

export interface UnansweredItem {
  itemRef: string
  title: string
  moduleName: string
}

/** 未填项总览：善意提醒，不阻塞导出；每条可点击跳回向导对应题 */
export default function UnansweredSummary({ items }: { items: UnansweredItem[] }) {
  if (items.length === 0) return null

  // 按模块分组，保持规则包模块顺序
  const groups: { module: string; items: UnansweredItem[] }[] = []
  for (const it of items) {
    const g = groups.find((x) => x.module === it.moduleName)
    if (g) g.items.push(it)
    else groups.push({ module: it.moduleName, items: [it] })
  }

  return (
    <motion.section
      id="unanswered-summary"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-[16px] border border-line bg-paper-100 p-5 sm:p-6 print:hidden"
    >
      <h2 className="text-title-sm text-ink-900">还有 {items.length} 道题没来得及填。</h2>
      <p className="mt-2 text-body text-ink-500">
        不影响你导出这张清单——只是怕漏掉能加的分，哪天想起来了，点一条就能跳回去补上。
      </p>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.module}>
            <p className="flex items-center gap-1.5 label-mono text-ink-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moduleColor(g.module) }} />
              {g.module} · {g.items.length}
            </p>
            <ul className="mt-2 space-y-2">
              {g.items.map((it) => (
                <li key={it.itemRef}>
                  <Link
                    to={`/wizard?item=${encodeURIComponent(it.itemRef)}`}
                    className="group flex items-center justify-between gap-3 rounded-[10px] border border-line bg-card px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <span className="min-w-0 truncate text-body text-ink-700">{it.title}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-primary">
                      <PencilLine className="h-3 w-3" />
                      去填
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
