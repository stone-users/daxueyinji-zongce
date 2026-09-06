import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { RulePack } from '@/engine/types'
import { COLLEGES, loadPack } from '@/engine/rulepack'
import { GRADES } from '@/engine/types'

const EVAL_YEARS = ['2024–2025 学年（2024.9.1 – 2025.8.31）', '2025–2026 学年（2025.9.1 – 2026.8.31）']

/** 阶段零：入口三问（学院 → 年级 → 学年确认），一页三段逐段解锁 */
export default function SetupQuestions({
  onDone,
}: {
  onDone: (v: { college: string; grade: string; evalYear: string }) => void
}) {
  const [college, setCollege] = useState<string | null>(null)
  const [pack, setPack] = useState<RulePack | null>(null)
  const [grade, setGrade] = useState<string | null>(null)

  // 选中学院即预加载规则包（学年比对 + applicability_warning 强提示用）
  useEffect(() => {
    if (!college) return
    let alive = true
    loadPack(college).then((p) => {
      if (alive) setPack(p)
    })
    return () => {
      alive = false
    }
  }, [college])
  const [evalYear, setEvalYear] = useState<string>(EVAL_YEARS[0])
  const [otherOpen, setOtherOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailDone, setEmailDone] = useState(false)

  const yearMismatch = !!pack?.meta.applicability_warning && !evalYear.startsWith('2024–2025')
  const ready = college && grade && evalYear && !yearMismatch

  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="text-display-lg text-ink-900">开始之前，三个小问题。</h1>
        <p className="mt-3 text-body-lg text-ink-500">用于加载你学院的规则包，只存在本机。</p>
      </motion.div>

      {/* Q0.1 学院 */}
      <Section n={1} title="你的学院？">
        <div className="grid gap-3 sm:grid-cols-2">
          {COLLEGES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setCollege(c.name)}
              className={cn(
                'flex items-center justify-between rounded-[14px] border bg-card px-5 py-4 text-left shadow-card transition-all duration-200 ease-out-expo',
                college === c.name ? 'border-[1.5px] border-primary bg-primary/5' : 'border-line hover:-translate-y-0.5 hover:shadow-card-hover',
              )}
            >
              <span className="min-w-0 whitespace-nowrap font-serif text-sm font-bold text-ink-900">{c.name}</span>
              <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">已支持</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <button type="button" onClick={() => setOtherOpen((v) => !v)} className="text-caption text-ink-300 hover:text-ink-500">
            其他学院（排队中）{otherOpen ? '▲' : '▼'}
          </button>
          {otherOpen && (
            <div className="mt-2 rounded-[12px] border border-line bg-paper-100 p-4">
              {emailDone ? (
                <p className="text-body text-success">已登记，规则包拆解完成后会通知你。</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="留下邮箱，拆解到你的学院时通知你"
                    className="min-w-0 flex-1 rounded-[10px] border border-line bg-card px-3 py-2 text-body focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!email.includes('@')}
                    onClick={() => setEmailDone(true)}
                    className="rounded-[10px] bg-primary px-4 py-2 text-[14px] text-primary-foreground disabled:opacity-40"
                  >
                    登记
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Q0.2 年级 */}
      <AnimatePresence>
        {college && (
          <Section n={2} title="你的年级？" animated>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={cn(
                    'rounded-full border px-5 py-2 text-[15px] transition-colors',
                    grade === g ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            {grade === '大四' && (
              <p className="mt-3 rounded-[10px] bg-warning-soft px-4 py-2.5 text-caption text-warning-foreground">
                大四部分模块评价期不同，问卷已按大四口径过滤题目。
              </p>
            )}
          </Section>
        )}
      </AnimatePresence>

      {/* Q0.3 学年确认 */}
      <AnimatePresence>
        {college && grade && (
          <Section n={3} title="确认评价学年" animated>
            <div className="space-y-2.5">
              {EVAL_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setEvalYear(y)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[12px] border bg-card px-4 py-3.5 text-left transition-colors',
                    evalYear === y ? 'border-[1.5px] border-primary bg-primary/5' : 'border-line hover:border-primary/50',
                  )}
                >
                  <span className={cn('h-4 w-4 shrink-0 rounded-full border-2', evalYear === y ? 'border-primary bg-primary' : 'border-ink-300')} />
                  <span className="text-body text-ink-900">{y}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-caption text-ink-500">细则依据：评价时间范围以材料落款时间为准（前一年 9 月 1 日至当年 8 月 31 日）。</p>
            {yearMismatch && (
              <p className="mt-3 rounded-[10px] bg-danger-soft px-4 py-3 text-body text-danger">
                该学院规则包仅适用 2024–2025 学年，请确认你的评价学年后再继续。（{pack?.meta.applicability_warning}）
              </p>
            )}
          </Section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        disabled={!ready}
        onClick={() => ready && onDone({ college: college!, grade: grade!, evalYear })}
        animate={ready ? { scale: [1, 1.02, 1] } : {}}
        className={cn(
          'mt-8 w-full rounded-[10px] py-3.5 text-[16px] font-medium transition-all duration-200',
          ready
            ? 'border-2 border-seal bg-primary text-primary-foreground shadow-card hover:bg-primary-deep'
            : 'cursor-not-allowed bg-paper-200 text-ink-300',
        )}
      >
        生成我的问卷 →
      </motion.button>
    </div>
  )
}

function Section({ n, title, children, animated }: { n: number; title: string; children: React.ReactNode; animated?: boolean }) {
  const inner = (
    <div className="mt-8 rounded-[14px] border border-line bg-card p-5 shadow-card sm:p-6">
      <p className="label-mono text-primary">Q0.{n}</p>
      <h2 className="mt-1.5 text-title-sm text-ink-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
  if (!animated) return inner
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {inner}
    </motion.div>
  )
}
