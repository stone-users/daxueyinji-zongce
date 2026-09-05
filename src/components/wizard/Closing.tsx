import { motion } from 'framer-motion'
import { TriangleAlert, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { PackItem, SessionItem } from '@/engine/types'
import { toScore } from '@/engine/rulepack'
import StampBadge from './StampBadge'

function penaltyText(it: PackItem): string {
  const score = toScore(it.score)
  const unit = typeof it.unit === 'string' ? it.unit : ''
  const parts: string[] = []
  if (it.severity === 'veto') parts.push('【一票否决】')
  if (score != null) parts.push(Array.isArray(score) ? `扣 ${score[0]}–${score[1]} 分` : `扣 ${Math.abs(score)} 分${unit ? `/${unit.replace('分/', '')}` : ''}`)
  if (typeof it.note === 'string') parts.push(it.note)
  if (typeof it.penalty_clause === 'string') parts.push(String(it.penalty_clause))
  if (typeof it.special === 'string') parts.push(String(it.special))
  if (typeof it.route_to === 'string') parts.push(`计入系统「${it.route_to}」栏`)
  return parts.join('；')
}

/** 收尾页一：减分自查（只读提示列表 + 必勾确认） */
export function ClosingPenalty({
  penalties,
  note,
  read,
  onRead,
  onPrev,
  onNext,
}: {
  penalties: PackItem[]
  note?: string
  read: boolean
  onRead: (v: boolean) => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="mx-auto max-w-wizard px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <span className="rounded-[6px] bg-danger-soft px-2 py-0.5 text-[12px] font-medium text-danger">只读</span>
        <h1 className="mt-3 text-display-lg text-ink-900">最后一步核对 · 减分项自查。</h1>
        <p className="mt-3 rounded-[10px] bg-paper-100 px-4 py-3 text-body text-ink-700">
          以下项目不出现在问卷中，也不会预填。请自行核对——<strong>如有以下情况，请主动向评议小组申报</strong>，隐瞒不报后果更严重。
        </p>
        {note && <p className="mt-2 text-caption text-ink-500">{note}</p>}
      </motion.div>

      <ul className="mt-6 space-y-2.5">
        {penalties.map((p, i) => (
          <motion.li
            key={`${p.name}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3 rounded-[12px] bg-danger-soft px-4 py-3.5"
          >
            <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-danger" />
            <div>
              <p className="text-body font-medium text-ink-900">{p.name}</p>
              {penaltyText(p) && <p className="mt-0.5 text-caption text-ink-700">{penaltyText(p)}</p>}
            </div>
          </motion.li>
        ))}
        {penalties.length === 0 && <li className="text-body text-ink-500">本学院规则包未列出独立减分条款。</li>}
      </ul>

      <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-[12px] border border-line bg-card px-4 py-3.5">
        <input
          type="checkbox"
          checked={read}
          onChange={(e) => onRead(e.target.checked)}
          className="h-[18px] w-[18px] accent-[#5E8C61]"
        />
        <span className="text-body text-ink-900">我已阅读并理解以上减分说明</span>
      </label>

      <NavRow prev={onPrev} next={onNext} nextLabel="继续 →" nextDisabled={!read} />
    </div>
  )
}

/** 收尾页二：待确认项（仅用户作答中产生的待确认集合；规则包校对 pending 属开发信息，不在此展示） */
export function ClosingPending({
  items,
  onJump,
  onPrev,
  onFinish,
}: {
  items: SessionItem[]
  onJump: (itemRef: string) => void
  onPrev: () => void
  onFinish: () => void
}) {
  const pendingItems = items.filter((i) => i.status === 'pending_review')
  const needEvidence = items.filter((i) => i.status === 'needs_evidence')
  const empty = pendingItems.length === 0 && needEvidence.length === 0

  return (
    <div className="mx-auto max-w-wizard px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="text-display-lg text-ink-900">这些项目，需要你留意。</h1>
      </motion.div>

      {empty ? (
        <div className="mt-8 flex flex-col items-center rounded-[16px] border border-line bg-card px-6 py-12 text-center">
          <img src="/empty-folder.svg" alt="" className="h-32 w-auto" />
          <p className="mt-4 text-body-lg text-ink-700">没有遗留问题，干净利落 ✨</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {pendingItems.length > 0 && (
            <Section title="手动定级 / 修改过目录建议的条目">
              {pendingItems.map((it) => (
                <PendingRow key={it.itemRef} item={it} stamp="pending" onJump={onJump} />
              ))}
            </Section>
          )}
          {needEvidence.length > 0 && (
            <Section title="建议补佐证的加分项">
              {needEvidence.map((it) => (
                <PendingRow key={it.itemRef} item={it} stamp="material" onJump={onJump} />
              ))}
            </Section>
          )}
        </div>
      )}

      <NavRow prev={onPrev} next={onFinish} nextLabel="生成导出清单 →" primary />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-title-sm text-ink-900">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </section>
  )
}

function PendingRow({ item, stamp, onJump }: { item: SessionItem; stamp: 'pending' | 'material'; onJump: (ref: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(item.itemRef)}
        className="flex w-full items-center gap-3 rounded-[12px] border border-line bg-card px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <StampBadge variant={stamp} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body text-ink-900">{item.name}</span>
          {item.note && <span className="block truncate text-caption text-ink-500">{item.note}</span>}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
      </button>
    </li>
  )
}

export function NavRow({
  prev,
  next,
  nextLabel,
  nextDisabled,
  primary,
}: {
  prev?: () => void
  next?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  primary?: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {prev ? (
        <button type="button" onClick={prev} className="rounded-[10px] border border-line bg-card px-5 py-2.5 text-[15px] text-ink-700 transition-colors hover:bg-paper-100">
          ← 上一步
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          type="button"
          disabled={nextDisabled}
          onClick={next}
          className={
            primary
              ? 'rounded-[10px] bg-primary px-6 py-3 text-[16px] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40'
              : 'rounded-[10px] bg-primary px-5 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40'
          }
        >
          {nextLabel ?? '下一步 →'}
        </button>
      )}
    </div>
  )
}

/** 完成页未用时回退（导出页尚未就绪时的保底） */
export function GoExport() {
  return (
    <Link to="/export" className="rounded-[10px] bg-primary px-6 py-3 text-[16px] text-primary-foreground">
      前往导出清单 →
    </Link>
  )
}
