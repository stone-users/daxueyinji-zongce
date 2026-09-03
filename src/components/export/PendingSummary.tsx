import { motion } from 'framer-motion'
import { PencilLine } from 'lucide-react'
import { Link } from 'react-router'
import type { SessionItem } from './session'

interface PendingSummaryProps {
  pendingReview: SessionItem[]
  needsEvidence: SessionItem[]
}

/** 待确认汇总条：提交前需再确认的评议项与待补佐证项 */
export default function PendingSummary({ pendingReview, needsEvidence }: PendingSummaryProps) {
  const total = pendingReview.length + needsEvidence.length
  if (total === 0) return null

  return (
    <motion.section
      id="pending-summary"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-32 rounded-[16px] border border-warning/50 bg-warning-soft p-5 sm:p-6"
    >
      <h2 className="text-title-sm text-ink-900">提交前，请再确认这 {total} 项。</h2>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {pendingReview.length > 0 && (
          <div>
            <p className="label-mono text-seal">待评议确认 · {pendingReview.length}</p>
            <ul className="mt-2 space-y-2.5">
              {pendingReview.map((it, i) => (
                <motion.li
                  key={it.itemRef}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[10px] border border-line bg-card px-3.5 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-body font-medium text-ink-900">{it.name}</p>
                    <Link
                      to={`/wizard?item=${encodeURIComponent(it.itemRef)}`}
                      className="inline-flex shrink-0 items-center gap-1 text-[12px] text-primary print:hidden"
                    >
                      <PencilLine className="h-3 w-3" />
                      回改
                    </Link>
                  </div>
                  <p className="mt-1 text-caption text-ink-500">
                    {it.note ?? '区间分或定级最终以评议小组认定为准。'}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {needsEvidence.length > 0 && (
          <div>
            <p className="label-mono text-warning">待补佐证 · {needsEvidence.length}</p>
            <ul className="mt-2 space-y-2.5">
              {needsEvidence.map((it, i) => (
                <motion.li
                  key={it.itemRef}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[10px] border border-line bg-card px-3.5 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-body font-medium text-ink-900">{it.name}</p>
                    <Link
                      to={`/wizard?item=${encodeURIComponent(it.itemRef)}`}
                      className="inline-flex shrink-0 items-center gap-1 text-[12px] text-primary print:hidden"
                    >
                      <PencilLine className="h-3 w-3" />
                      回改
                    </Link>
                  </div>
                  <p className="mt-1 text-caption text-warning">
                    建议材料：{it.evidence.suggested ?? '按学院要求准备原件'}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  )
}
