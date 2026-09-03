import { motion } from 'framer-motion'
import { Copy, Download, Printer, Trash2 } from 'lucide-react'
import DigitRoll from './DigitRoll'
import type { ZongceSession } from './session'
import { formatNumber, moduleSubtotal } from './session'
import { MODULE_META, moduleColor } from './modules'
import { cn } from '@/lib/utils'

interface HeaderSectionProps {
  session: ZongceSession
  modules: string[]
  counts: { confirmed: number; pendingReview: number; needsEvidence: number; total: number }
  totalScore: number
  exported: boolean
  onExportJson: () => void
  onPrint: () => void
  onCopy: () => void
  onClear: () => void
}

function StatCell({
  label,
  children,
  sub,
  accent,
}: {
  label: string
  children: React.ReactNode
  sub?: React.ReactNode
  accent?: 'seal' | 'warning'
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
      <span className="label-mono text-ink-500">{label}</span>
      <span
        className={cn(
          'font-mono text-[24px] font-semibold leading-[1.2] text-ink-900',
          accent === 'seal' && 'text-seal',
          accent === 'warning' && 'text-warning',
        )}
      >
        {children}
      </span>
      {sub ? <span className="text-caption text-ink-500">{sub}</span> : null}
    </div>
  )
}

export default function HeaderSection({
  session,
  modules,
  counts,
  totalScore,
  exported,
  onExportJson,
  onPrint,
  onCopy,
  onClear,
}: HeaderSectionProps) {
  const savedAt = (() => {
    const d = new Date(session.savedAt)
    if (Number.isNaN(d.getTime())) return session.savedAt
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  })()

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pt-8 sm:pt-10"
    >
      <p className="label-mono text-ink-500">
        问卷向导 <span className="text-success">✓</span> → 导出清单
      </p>
      <h1 className="mt-2 text-[28px] font-bold leading-[1.2] tracking-title-lg text-ink-900 sm:text-display-lg">
        你的综测填报清单
      </h1>
      <p className="mt-2 font-mono text-caption text-ink-500">
        {session.college} · {session.grade} · {session.evalYear} · 生成于 {savedAt}
      </p>

      {/* 汇总统计条 */}
      <div className="mt-6 grid grid-cols-2 divide-line overflow-hidden rounded-[16px] border border-line bg-card shadow-card sm:grid-cols-4 sm:divide-x">
        <StatCell label="预计预填项">
          <DigitRoll value={counts.total} delay={0} />
          <span className="ml-1 text-[13px] font-normal text-ink-500">项</span>
        </StatCell>
        <StatCell
          label="合计参考分"
          sub="参考合计，非最终得分；区间分与评议项以评议小组认定为准。"
        >
          <DigitRoll value={totalScore} delay={0.1} format={(n) => formatNumber(Math.round(n * 10) / 10)} />
        </StatCell>
        <StatCell label="待评议确认" accent="seal">
          <DigitRoll value={counts.pendingReview} delay={0.2} />
          <span className="ml-1 text-[13px] font-normal text-ink-500">项</span>
        </StatCell>
        <StatCell label="待补佐证" accent="warning">
          <DigitRoll value={counts.needsEvidence} delay={0.3} />
          <span className="ml-1 text-[13px] font-normal text-ink-500">项</span>
        </StatCell>
      </div>

      {/* 七模块分值概览 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-line bg-paper-100 px-4 py-3">
        <span className="label-mono text-ink-500">模块分值概览</span>
        {MODULE_META.filter((m) => modules.some((n) => n === m.key || n.includes(m.key))).map((m) => {
          const v = moduleSubtotal(session, m.key)
          return (
            <span key={m.key} className="flex items-center gap-1.5 text-caption text-ink-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
              {m.key}
              <span className="font-mono font-semibold text-ink-900">
                {typeof v === 'number' ? formatNumber(v) : v}
              </span>
            </span>
          )
        })}
        {modules
          .filter((n) => !MODULE_META.some((m) => n === m.key || n.includes(m.key)))
          .map((n) => (
            <span key={n} className="flex items-center gap-1.5 text-caption text-ink-700">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moduleColor(n) }} />
              {n}
            </span>
          ))}
      </div>

      {/* 操作按钮组 */}
      <div className="mt-5 flex flex-wrap items-center justify-start gap-2.5 sm:justify-end print:hidden">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-danger/60 px-4 py-2 text-[14px] font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          <Trash2 className="h-4 w-4" />
          清空本地数据
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] font-medium text-ink-700 shadow-card transition-colors hover:bg-paper-100"
        >
          <Copy className="h-4 w-4" />
          复制清单文本
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] font-medium text-ink-700 shadow-card transition-colors hover:bg-paper-100"
        >
          <Printer className="h-4 w-4" />
          打印 / 存 PDF
        </button>
        <button
          type="button"
          onClick={onExportJson}
          className="relative inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-deep"
        >
          <Download className="h-4 w-4" />
          导出 JSON ↓
          {exported && (
            <motion.span
              initial={{ scale: 1.6, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.34, 1.4, 0.64, 1] }}
              className="pointer-events-none absolute -right-3 -top-5 inline-flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-seal bg-paper-50/90 text-[10px] font-bold leading-tight text-seal"
            >
              <span>已导</span>
              <span>出 ✓</span>
            </motion.span>
          )}
        </button>
      </div>
    </motion.section>
  )
}
