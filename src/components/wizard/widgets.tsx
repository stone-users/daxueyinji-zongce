import { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AwardEntry, Question } from '@/engine/types'
import { awardRefScore, scoreMid } from '@/engine/rulepack'
import StampBadge from './StampBadge'

// ---------------------------------------------------------------------------
// 5.1 confirm-card · 全员基本分 / uniform_all 一键确认（含盖章动效）
// ---------------------------------------------------------------------------

export function ConfirmCard({
  q,
  confirmed,
  onChange,
}: {
  q: Question
  confirmed: boolean
  onChange: (v: boolean) => void
}) {
  const [shake, setShake] = useState(false)
  const mid = scoreMid(q.baseScore ?? null)
  return (
    <motion.div
      animate={shake ? { y: [0, -1.5, 1.5, 0] } : {}}
      transition={{ duration: 0.12 }}
      className={cn(
        'relative overflow-visible rounded-[14px] border bg-card px-6 py-8 text-center transition-colors duration-300',
        confirmed ? 'border-success' : 'border-line',
      )}
    >
      {confirmed && <StampBadge variant="confirmed" animate className="absolute -right-3 -top-4 bg-card/80" />}
      {q.uniformAll && (
        <span className="mb-3 inline-block rounded-[6px] border border-seal px-2 py-0.5 font-serif text-[12px] font-bold text-seal">
          全班 / 全年级统一
        </span>
      )}
      <div className="font-mono text-[32px] font-semibold tabular-nums text-ink-900">
        {mid != null ? `+${mid}` : '待评议'}
        <span className="ml-1 text-[15px] font-normal text-ink-500">分</span>
      </div>
      <p className="mx-auto mt-3 max-w-md text-body text-ink-700">
        {q.uniformAll ? '此项为全班/全年级统一分值，无特殊情况每位同学均可获得。' : '此项为全员基本分，无特殊情况每位同学均可获得。'}
      </p>
      {q.desc && <p className="mx-auto mt-2 max-w-md text-caption text-ink-500">{q.desc}</p>}
      <button
        type="button"
        disabled={confirmed}
        onClick={() => {
          onChange(true)
          setShake(true)
          setTimeout(() => setShake(false), 140)
        }}
        className={cn(
          'mt-5 rounded-[10px] border-2 px-6 py-2.5 text-[15px] font-medium transition-all duration-200 ease-out-expo',
          confirmed
            ? 'cursor-default border-success bg-success-soft text-success'
            : 'border-seal text-seal hover:-translate-y-0.5 hover:bg-seal-soft',
        )}
      >
        {confirmed ? '已确认 ✓' : '确认无误，盖章'}
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// 是 / 否 大选项卡（bool；yes-no-count 的第一步复用）
// ---------------------------------------------------------------------------

export function BoolCards({
  value,
  onChange,
  yes = '是',
  no = '否',
}: {
  value: boolean | null
  onChange: (v: boolean) => void
  yes?: string
  no?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { v: true, label: yes },
        { v: false, label: no },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            'rounded-[12px] border px-4 py-4 text-[16px] font-medium transition-all duration-200 ease-out-expo',
            value === o.v
              ? 'border-primary bg-primary/5 text-primary shadow-card'
              : 'border-line bg-card text-ink-700 hover:border-primary/50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 数字步进器（次数/小时复用）
// ---------------------------------------------------------------------------

export function Stepper({
  value,
  onChange,
  min = 0,
  max,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
}) {
  const clamp = (n: number) => Math.max(min, max != null ? Math.min(max, n) : n)
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-card text-ink-700 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="减少"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="h-12 w-24 rounded-[10px] border border-line bg-card text-center font-mono text-[28px] font-semibold tabular-nums text-ink-900 focus:border-primary focus:outline-none disabled:opacity-40"
      />
      <button
        type="button"
        disabled={disabled || (max != null && value >= max)}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-card text-ink-700 transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="增加"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5.2 yes-no-count · 是否参加 + 次数（cap 截断由上层 HintBar 提示）
// ---------------------------------------------------------------------------

export function YesNoCount({
  q,
  participated,
  count,
  counts,
  onChange,
  capReached,
}: {
  q: Question
  participated: boolean | null
  count: number
  counts?: Record<string, number>
  onChange: (v: { participated: boolean; count: number; counts?: Record<string, number> }) => void
  capReached: boolean
}) {
  // multi_count：一题多计数行（如通报表扬 校级/院级），各级别独立记次数
  if (q.counters?.length) {
    const cur = counts ?? {}
    const setCount = (key: string, n: number) => {
      const next = { ...cur, [key]: n }
      onChange({ participated: Object.values(next).some((v) => v > 0), count: 0, counts: next })
    }
    let total = 0
    let hasRange = false
    for (const c of q.counters) {
      const n = cur[c.key] ?? 0
      if (Array.isArray(c.unitScore)) hasRange = true
      else total += (c.unitScore ?? 0) * n
    }
    return (
      <div className="space-y-3">
        {q.counters.map((c) => {
          const n = cur[c.key] ?? 0
          const per = Array.isArray(c.unitScore) ? `${c.unitScore[0]}–${c.unitScore[1]}` : String(c.unitScore ?? 0)
          const sub = n > 0 && !Array.isArray(c.unitScore) ? String((c.unitScore ?? 0) * n) : null
          return (
            <div key={c.key} className="flex flex-wrap items-center gap-4 rounded-[12px] bg-paper-100 px-4 py-4">
              <span className="text-body text-ink-700">{c.label}</span>
              <Stepper value={n} max={99} onChange={(v) => setCount(c.key, v)} />
              <span className="text-caption text-ink-500">每次 +{per} 分</span>
              {sub && (
                <span className="ml-auto font-mono text-[15px] font-semibold tabular-nums text-ink-900">
                  {per} × {n} 次 = +{sub}
                </span>
              )}
            </div>
          )
        })}
        {!hasRange && total > 0 && (
          <p className={cn('font-mono text-[15px] font-semibold tabular-nums', capReached ? 'text-danger' : 'text-ink-900')}>
            合计 +{total}
            {q.cap != null && <span className="ml-2 font-sans text-caption font-normal text-ink-500">上限 {q.cap} 分</span>}
          </p>
        )}
      </div>
    )
  }
  const unit = q.baseScore
  const per = Array.isArray(unit) ? `${unit[0]}–${unit[1]}` : unit ?? 0
  const subtotal =
    participated && count > 0
      ? Array.isArray(unit)
        ? `${unit[0] * count}–${unit[1] * count}`
        : String((unit ?? 0) * count)
      : null
  return (
    <div className="space-y-4">
      <BoolCards value={participated} yes="参加了 / 有" no="没参加 / 没有" onChange={(v) => onChange({ participated: v, count: v ? Math.max(1, count) : 0 })} />
      {participated && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-4 rounded-[12px] bg-paper-100 px-4 py-4"
        >
          <span className="text-body text-ink-700">次数</span>
          <Stepper value={count} min={1} max={capReached ? count : 99} onChange={(n) => onChange({ participated: true, count: n })} />
          {q.scoreText && <span className="text-caption text-ink-500">{q.scoreText}</span>}
          {subtotal && (
            <span className={cn('ml-auto font-mono text-[15px] font-semibold tabular-nums', capReached ? 'text-danger' : 'text-ink-900')}>
              {per} × {count} 次 = +{subtotal}
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5.3 anchor-radio · 自评档位单选（行为锚点）
// ---------------------------------------------------------------------------

export function AnchorRadio({
  q,
  value,
  onChange,
}: {
  q: Question
  value: string | null
  onChange: (label: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {q.options?.map((opt) => {
          const active = value === opt.label
          const mid = scoreMid(opt.score)
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.label)}
              className={cn(
                'flex w-full items-start gap-3 rounded-[12px] border bg-card px-4 py-3.5 text-left transition-all duration-200 ease-out-expo',
                active ? 'border-[1.5px] border-primary bg-primary/5 shadow-card' : 'border-line hover:border-primary/50',
              )}
            >
              <span
                className={cn(
                  'mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                  active ? 'border-primary bg-primary' : 'border-ink-300',
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[18px] font-bold text-ink-900">{opt.label}</span>
                  <span className="shrink-0 font-mono text-[14px] font-semibold tabular-nums text-ink-700">
                    {mid == null ? '待评议' : Array.isArray(opt.score) ? `${opt.score[0]}–${opt.score[1]} 分` : `+${mid} 分`}
                  </span>
                </span>
                {opt.desc && <span className="mt-1 block text-body text-ink-700">{opt.desc}</span>}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-caption text-ink-500">自评档位，评议小组将结合材料复核。</p>
      {q.multiParty && (
        <div className="rounded-[10px] bg-paper-100 px-4 py-3 text-caption text-ink-500">
          评议分（{Math.round((q.multiParty.weights['评议小组'] ?? 0.3) * 100)}%）与辅导员评分（
          {Math.round((q.multiParty.weights['辅导员'] ?? 0.3) * 100)}%）由评议方填写，此处无需作答。
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5.5 ext-port · 外部成绩输入端口
// ---------------------------------------------------------------------------

export function ExtPort({
  q,
  value,
  onChange,
}: {
  q: Question
  value: number | null
  onChange: (v: number | null) => void
}) {
  if (q.extReadonly) {
    return (
      <div className="rounded-[12px] border border-line bg-paper-100 px-5 py-5">
        <p className="text-body text-ink-700">此项由评议小组/相关部门填写（满分 {q.extMax ?? '—'} 分），问卷仅作提示，无需作答。</p>
        {q.desc && <p className="mt-2 text-caption text-ink-500">{q.desc}</p>}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          min={0}
          max={q.extMax}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="h-14 w-40 rounded-[12px] border border-line bg-card px-4 font-mono text-[28px] font-semibold tabular-nums text-ink-900 focus:border-primary focus:outline-none"
        />
        <span className="text-body text-ink-500">分{q.extMax ? `（满分 ${q.extMax}）` : ''}</span>
      </div>
      <div className="rounded-[10px] bg-warning-soft px-4 py-2.5 text-caption text-warning-foreground">
        请以教务系统成绩为准，本工具不做成绩核验。
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5.6 number-input · 志愿时长（小时数 + 校内/院内折算）
// ---------------------------------------------------------------------------

export function VolunteerHours({
  q,
  hours,
  hoursOut,
  venue,
  onChange,
  capped,
}: {
  q: Question
  hours: number
  hoursOut: number
  venue: '校内' | '院内'
  onChange: (v: { hours: number; hoursOut: number; venue: '校内' | '院内' }) => void
  capped: boolean
}) {
  const rate = q.ratePerHour ?? 0.2
  const hasConv = !!q.hourConversion
  const inR = q.hourConversion?.['校内小时'] ?? 1
  const outR = q.hourConversion?.['院内小时'] ?? 1
  const total = hasConv
    ? Math.round((hours * inR + hoursOut * outR) * rate * 100) / 100
    : Math.round(hours * rate * 100) / 100
  return (
    <div className="space-y-4">
      {hasConv ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] bg-paper-100 px-4 py-4">
            <p className="mb-2 text-body text-ink-700">校内时长（×{inR}）</p>
            <Stepper value={hours} onChange={(n) => onChange({ hours: n, hoursOut, venue })} />
          </div>
          <div className="rounded-[12px] bg-paper-100 px-4 py-4">
            <p className="mb-2 text-body text-ink-700">院内时长（×{outR}）</p>
            <Stepper value={hoursOut} onChange={(n) => onChange({ hours, hoursOut: n, venue })} />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 rounded-[12px] bg-paper-100 px-4 py-4">
          <span className="text-body text-ink-700">小时数</span>
          <Stepper value={hours} onChange={(n) => onChange({ hours: n, hoursOut, venue })} />
          <div className="flex rounded-full border border-line bg-card p-0.5 text-[13px]">
            {(['校内', '院内'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ hours, hoursOut, venue: v })}
                className={cn(
                  'rounded-full px-3 py-1 transition-colors',
                  venue === v ? 'bg-primary text-primary-foreground' : 'text-ink-500 hover:text-ink-900',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className={cn('font-mono text-[15px] font-semibold tabular-nums', capped ? 'text-danger' : 'text-ink-900')}>
        {hasConv
          ? `（校内 ${hours}h×${inR} + 院内 ${hoursOut}h×${outR}）× ${rate} 分/小时 = +${total}`
          : `${hours} 小时 × ${rate} 分/小时 = +${total}`}
        {q.cap != null && <span className="ml-2 font-sans text-caption font-normal text-ink-500">上限 {q.cap} 分</span>}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5.7 award-list · 获奖记录卡：逐条添加（身份 → 级别 → 分数 级联），sum/max 聚合
// ---------------------------------------------------------------------------

type AwardValue = { none: boolean; entries: AwardEntry[] }

export function AwardList({
  q,
  value,
  onChange,
}: {
  q: Question
  value: AwardValue | null
  onChange: (v: AwardValue) => void
}) {
  const spec = q.award
  const entries = value?.entries ?? []
  const none = value?.none ?? false
  // 级联选择状态（ hooks 须在早退之前）
  const [adding, setAdding] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [level, setLevel] = useState<string | null>(null)
  const [scoreText, setScoreText] = useState('')

  if (!spec) return <p className="text-caption text-ink-500">本题分值结构缺失，请略过。</p>

  const needRole = !!spec.roles?.length
  const ref = level ? awardRefScore(q, { role: role ?? undefined, level }) : null
  const refRange = Array.isArray(ref) ? ref : null
  const scoreNum = Number(scoreText)
  const scoreValid = scoreText.trim() !== '' && Number.isFinite(scoreNum) && scoreNum >= 0

  const pickLevel = (lv: string) => {
    setLevel(lv)
    const r = awardRefScore(q, { role: role ?? undefined, level: lv })
    // 固定分预填标准分；区间预填中值（输入框仍限定在区间内）
    setScoreText(r == null ? '' : Array.isArray(r) ? String(scoreMid(r)) : String(r))
  }

  const resetPicker = () => {
    setRole(null)
    setLevel(null)
    setScoreText('')
  }

  const confirmEntry = () => {
    if (!level || !scoreValid || (needRole && !role)) return
    let v = scoreNum
    if (refRange) v = Math.min(refRange[1], Math.max(refRange[0], v)) // 区间分值限定 [lo,hi]
    v = Math.round(v * 100) / 100
    const custom = typeof ref === 'number' && v !== ref // 改过标准固定分 → 待评议确认
    const entry: AwardEntry = {
      ...(needRole ? { role: role! } : {}),
      level,
      score: v,
      ...(custom ? { custom: true } : {}),
    }
    onChange({ none: false, entries: [...entries, entry] })
    resetPicker() // 保持添加态，方便继续 push 下一条
  }

  const removeEntry = (i: number) => {
    const next = entries.filter((_, ei) => ei !== i)
    onChange({ none: false, entries: next })
  }

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-[14px] transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      {/* 未作答态：两个大按钮 */}
      {entries.length === 0 && !none && !adding && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-[12px] border border-line bg-card px-4 py-4 text-[16px] font-medium text-ink-700 transition-all duration-200 ease-out-expo hover:border-primary/50"
          >
            + 添加一条获奖
          </button>
          <button
            type="button"
            onClick={() => onChange({ none: true, entries: [] })}
            className="rounded-[12px] border border-line bg-card px-4 py-4 text-[16px] font-medium text-ink-700 transition-all duration-200 ease-out-expo hover:border-primary/50"
          >
            没有此类获奖（+0）
          </button>
        </div>
      )}

      {/* 「没有此类获奖」已答态 */}
      {none && (
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-paper-100 px-4 py-4">
          <span className="text-body text-ink-700">已标记：没有此类获奖，计 0 分</span>
          <button
            type="button"
            onClick={() => {
              onChange({ none: false, entries: [] })
              setAdding(true)
            }}
            className="ml-auto rounded-[10px] border border-line bg-card px-3.5 py-1.5 text-caption text-ink-700 transition-colors hover:border-primary/50"
          >
            改为添加获奖
          </button>
        </div>
      )}

      {/* 已添加的记录列表 */}
      {entries.length > 0 && (
        <div className="space-y-2.5">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[12px] bg-paper-100 px-4 py-3">
              <span className="min-w-0 flex-1 text-body text-ink-900">
                {e.role ? `${e.role} · ` : ''}
                {e.level}
                {e.custom && (
                  <span className="ml-2 rounded-[6px] border border-warning px-1.5 py-0.5 text-[11px] text-warning">自填·待评议确认</span>
                )}
              </span>
              <span className="font-mono text-[15px] font-semibold tabular-nums text-ink-900">+{e.score}</span>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="inline-flex items-center gap-1 rounded-[8px] border border-line px-2.5 py-1.5 text-caption text-danger transition-colors hover:bg-danger-soft"
                aria-label="删除该条"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 级联添加表单：身份 → 级别 → 分数 */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3 rounded-[12px] border border-line bg-card px-4 py-4"
        >
          {needRole && (
            <div>
              <p className="mb-2 text-caption text-ink-500">第一步 · 你的身份</p>
              <div className="flex flex-wrap gap-2">
                {spec.roles!.map((r) =>
                  chip(r, role === r, () => {
                    setRole(r)
                    setLevel(null)
                    setScoreText('')
                  }),
                )}
              </div>
            </div>
          )}
          {(!needRole || role) && (
            <div>
              <p className="mb-2 text-caption text-ink-500">{needRole ? '第二步' : '第一步'} · 获奖级别</p>
              <div className="flex flex-wrap gap-2">{spec.levels.map((lv) => chip(lv, level === lv, () => pickLevel(lv)))}</div>
            </div>
          )}
          {level && (
            <div>
              <p className="mb-2 text-caption text-ink-500">
                {needRole ? '第三步' : '第二步'} · 分数
                {refRange && <span className="ml-1 text-ink-700">参考区间 {refRange[0]}–{refRange[1]} 分（区间内自填）</span>}
                {typeof ref === 'number' && <span className="ml-1 text-ink-700">参考分 +{ref} 分（可修改）</span>}
                {ref == null && <span className="ml-1 text-warning">该组合无标准分，请按评议口径填写</span>}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  value={scoreText}
                  min={refRange ? refRange[0] : 0}
                  max={refRange ? refRange[1] : undefined}
                  onChange={(e) => setScoreText(e.target.value)}
                  className="h-12 w-28 rounded-[10px] border border-line bg-card px-3 text-center font-mono text-[24px] font-semibold tabular-nums text-ink-900 focus:border-primary focus:outline-none"
                />
                <span className="text-body text-ink-500">分</span>
                <button
                  type="button"
                  disabled={!scoreValid || (needRole && !role)}
                  onClick={confirmEntry}
                  className="ml-auto rounded-[10px] bg-primary px-5 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  确认添加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false)
                    resetPicker()
                  }}
                  className="rounded-[10px] border border-line bg-card px-4 py-2.5 text-[14px] text-ink-700 transition-colors hover:bg-paper-100"
                >
                  收起
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 已答列表态的底部操作：继续添加 / 清零重来 */}
      {(entries.length > 0 || adding) && (
        <div className="flex flex-wrap items-center gap-3">
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] text-ink-700 transition-colors hover:border-primary/50"
            >
              + 添加一条获奖
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onChange({ none: true, entries: [] })
              setAdding(false)
              resetPicker()
            }}
            className="rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] text-ink-500 transition-colors hover:bg-paper-100"
          >
            没有此类获奖（+0）
          </button>
          {entries.length > 0 && (
            <span className="ml-auto text-caption text-ink-500">
              {spec.aggregate === 'max' ? '多条取最高一项计入（取高不累加）' : '多条累加计入'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
