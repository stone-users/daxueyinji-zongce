import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnswerMap, CatalogEntry, ModulePlan, Question, RulePack, WizardProgress } from '@/engine/types'
import { buildPlan, flattenCatalog, loadCatalog, loadPack, pendingReviewNotes } from '@/engine/rulepack'
import {
  buildSession,
  clearAll,
  evidenceKeys,
  isAnswered,
  loadProgress,
  saveProgress,
  saveSession,
} from '@/engine/session'
import SetupQuestions from '@/components/wizard/SetupQuestions'
import ResumePrompt from '@/components/wizard/ResumePrompt'
import ModuleCover from '@/components/wizard/ModuleCover'
import QuestionCard from '@/components/wizard/QuestionCard'
import { ProgressMap, ProgressBarMobile, type MapEntry } from '@/components/wizard/ProgressMap'
import { ClosingPenalty, ClosingPending } from '@/components/wizard/Closing'

type Phase = 'loading' | 'resume' | 'setup' | 'run'
type Step =
  | { type: 'cover'; m: number }
  | { type: 'q'; m: number; q: number }
  | { type: 'penalty' }
  | { type: 'pending' }

type FlatEntry = CatalogEntry & { level: string }

function buildSteps(plans: ModulePlan[]): Step[] {
  const steps: Step[] = []
  plans.forEach((p, m) => {
    if (p.questions.length === 0) return
    steps.push({ type: 'cover', m })
    p.questions.forEach((_, q) => steps.push({ type: 'q', m, q }))
  })
  steps.push({ type: 'penalty' }, { type: 'pending' })
  return steps
}

/** 恢复入口：加载规则包推算上次进度位置（如「学术科研与创新 · 第 4 题」） */
function ResumeGate({
  progress,
  onResume,
  onRestart,
}: {
  progress: WizardProgress
  onResume: () => void
  onRestart: () => void
}) {
  const [where, setWhere] = useState('')
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const pk = await loadPack(progress.college)
        const pl = buildPlan(pk, progress.grade, true)
        const st = buildSteps(pl)
        const s = st[Math.min(progress.stepIndex, st.length - 1)]
        let label = '入口'
        if (s?.type === 'q') label = `${pl[s.m].name} · 第 ${s.q + 1} 题`
        else if (s?.type === 'cover') label = `${pl[s.m].name} · 模块封面`
        else if (s?.type === 'penalty') label = '减分自查'
        else if (s?.type === 'pending') label = '待确认项'
        if (alive) setWhere(label)
      } catch {
        if (alive) setWhere('上次进度')
      }
    })()
    return () => {
      alive = false
    }
  }, [progress])
  return <ResumePrompt where={where || '上次进度'} onResume={onResume} onRestart={onRestart} />
}

export default function Wizard() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [pack, setPack] = useState<RulePack | null>(null)
  const [catalog, setCatalog] = useState<FlatEntry[]>([])
  const [plans, setPlans] = useState<ModulePlan[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [uploaded, setUploaded] = useState<Set<string>>(new Set())
  const [penaltyRead, setPenaltyRead] = useState(false)
  const [meta, setMeta] = useState<{ college: string; grade: string; evalYear: string } | null>(null)
  const [jumpRef, setJumpRef] = useState<string | null>(null) // /wizard?item=<itemRef> 回改定位
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 启动：检测暂存；导出页"回改"链接（?item=itemRef）命中时跳过 ResumePrompt 直接定位
  useEffect(() => {
    const item = new URLSearchParams(window.location.search).get('item')
    const p = loadProgress()
    if (item && p?.college) {
      setJumpRef(item)
      void boot(p.college, p.grade, p.evalYear, p)
      return
    }
    setPhase(p && p.college ? 'resume' : 'setup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // boot 完成后执行回改定位
  useEffect(() => {
    if (phase !== 'run' || !jumpRef || steps.length === 0) return
    const base = jumpRef.replace(/\[\d+\]$/, '')
    const idx = steps.findIndex((s) => s.type === 'q' && plans[s.m]?.questions[s.q]?.id === base)
    if (idx >= 0) {
      setDir(1)
      setStepIndex(idx)
    }
    setJumpRef(null)
  }, [phase, jumpRef, steps, plans])

  // 佐证已上传集合
  useEffect(() => {
    evidenceKeys().then((ks) => setUploaded(new Set(ks)))
  }, [])

  const boot = useCallback(async (college: string, grade: string, evalYear: string, saved?: WizardProgress | null) => {
    const pk = await loadPack(college)
    const cat = flattenCatalog(await loadCatalog(college))
    const pl = buildPlan(pk, grade, cat.length > 0)
    setPack(pk)
    setCatalog(cat)
    setPlans(pl)
    setSteps(buildSteps(pl))
    setMeta({ college, grade, evalYear })
    if (saved) {
      setAnswers(saved.answers ?? {})
      setPenaltyRead(saved.penaltyRead ?? false)
      setStepIndex(Math.min(saved.stepIndex ?? 0, buildSteps(pl).length - 1))
    } else {
      setAnswers({})
      setPenaltyRead(false)
      setStepIndex(0)
    }
    setPhase('run')
  }, [])

  // 自动暂存（防抖 500ms）：内部进度 + 会话契约
  const persist = useCallback(
    (a: AnswerMap, idx: number, read: boolean, m = meta, pk = pack, pl = plans) => {
      if (!m || !pk || !pl.length) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveProgress({
          college: m.college,
          grade: m.grade,
          evalYear: m.evalYear,
          stepIndex: idx,
          answers: a,
          penaltyRead: read,
          savedAt: new Date().toISOString(),
        })
        saveSession(buildSession(pk, pl, a, m.grade, m.evalYear, uploaded))
      }, 500)
    },
    [meta, pack, plans, uploaded],
  )

  useEffect(() => {
    if (phase === 'run') persist(answers, stepIndex, penaltyRead)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, stepIndex, penaltyRead, phase, uploaded])

  const go = useCallback(
    (next: number) => {
      setDir(next >= stepIndex ? 1 : -1)
      setStepIndex(Math.max(0, Math.min(steps.length - 1, next)))
    },
    [stepIndex, steps.length],
  )

  const finish = useCallback(() => {
    if (pack && meta && plans.length) {
      saveSession(buildSession(pack, plans, answers, meta.grade, meta.evalYear, uploaded))
    }
    navigate('/export')
  }, [pack, meta, plans, answers, uploaded, navigate])

  const jumpToRef = useCallback(
    (ref: string) => {
      const base = ref.replace(/\[\d+\]$/, '') // comp 条目 itemRef 带 [n] 后缀
      const idx = steps.findIndex((s) => s.type === 'q' && plans[s.m]?.questions[s.q]?.id === base)
      if (idx >= 0) go(idx)
    },
    [steps, plans, go],
  )

  // 会话条目（收尾页用）。注意：所有 Hook 必须在早退 return 之前调用。
  const sessionItems = useMemo(
    () => (pack && meta ? buildSession(pack, plans, answers, meta.grade, meta.evalYear, uploaded).items : []),
    [pack, meta, plans, answers, uploaded],
  )

  // -------------------------------------------------------------------------
  if (phase === 'loading') {
    return <div className="mx-auto max-w-wizard px-4 py-24 text-center text-ink-500">加载中…</div>
  }

  if (phase === 'resume') {
    const p = loadProgress()!
    return (
      <ResumeGate
        progress={p}
        onResume={() => void boot(p.college, p.grade, p.evalYear, p)}
        onRestart={() => {
          clearAll()
          setPhase('setup')
        }}
      />
    )
  }

  if (phase === 'setup') {
    return (
      <SetupQuestions onDone={({ college, grade, evalYear }) => void boot(college, grade, evalYear, null)} />
    )
  }

  // ---------------------------------------------------------------- run ---
  const step = steps[stepIndex]
  const curPlan = step && step.type !== 'penalty' && step.type !== 'pending' ? plans[step.m] : null
  const curQ: Question | null = step?.type === 'q' ? plans[step.m].questions[step.q] : null

  const entries: MapEntry[] = plans.map((p) => {
    const answered = p.questions.filter((q) => isAnswered(q, answers[q.id])).length
    const status = p.questions.length === 0 || answered === p.questions.length ? 'done' : answered > 0 ? 'partial' : 'todo'
    const active = curPlan?.id === p.id
    return { id: p.id, name: p.name, status, active, clickable: status !== 'todo' && !active }
  })
  const closing: MapEntry[] = [
    { id: 'closing-penalty', name: '减分自查', status: step?.type === 'penalty' ? 'partial' : penaltyRead ? 'done' : 'todo', active: step?.type === 'penalty', clickable: false },
    { id: 'closing-pending', name: '待确认项', status: step?.type === 'pending' ? 'partial' : 'todo', active: step?.type === 'pending', clickable: false },
  ]

  const qSeqInModule = step?.type === 'q' ? step.q + 1 : 0

  return (
    <div>
      <ProgressBarMobile
        entries={entries}
        currentName={curPlan ? curPlan.name : step?.type === 'penalty' ? '减分自查' : '待确认项'}
        currentIndex={curPlan ? plans.findIndex((p) => p.id === curPlan.id) : -1}
      />
      <div className="mx-auto flex max-w-marketing items-start gap-8 px-4 sm:px-6">
        <div className="hidden py-8 lg:block">
          <ProgressMap
            entries={entries}
            closing={closing}
            onJump={(id) => {
              const m = plans.findIndex((p) => p.id === id)
              const idx = steps.findIndex((s) => s.type === 'q' && s.m === m)
              if (idx >= 0) go(idx)
            }}
          />
        </div>

        <div className="min-w-0 flex-1 py-6 pb-24 md:pb-10">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={stepIndex}
              custom={dir}
              initial={{ opacity: 0, x: 32 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 * dir }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step?.type === 'cover' && curPlan && (
                <ModuleCover
                  moduleId={curPlan.id}
                  name={curPlan.name}
                  index={step.m}
                  total={plans.length}
                  questionCount={curPlan.questions.length}
                  note={curPlan.note && curPlan.note.length <= 60 ? curPlan.note : undefined}
                  onEnter={() => go(stepIndex + 1)}
                />
              )}

              {step?.type === 'q' && curQ && (
                <div className="mx-auto max-w-wizard">
                  <QuestionCard
                    q={curQ}
                    seqLabel={`${curQ.moduleName} · Q${qSeqInModule}`}
                    answer={answers[curQ.id]}
                    onAnswer={(a) => setAnswers((prev) => ({ ...prev, [curQ.id]: a }))}
                    plans={plans}
                    answers={answers}
                    catalog={catalog}
                    onEvidence={(ref, has) =>
                      setUploaded((prev) => {
                        const n = new Set(prev)
                        if (has) n.add(ref)
                        else n.delete(ref)
                        return n
                      })
                    }
                  />
                  <p className="mt-3 text-center text-caption text-ink-300">
                    本模块第 {qSeqInModule} / {curPlan?.questions.length} 题
                  </p>
                  {/* 桌面端卡内操作行 */}
                  <div className="mt-4 hidden items-center justify-between md:flex">
                    <button
                      type="button"
                      onClick={() => go(stepIndex - 1)}
                      className="rounded-[10px] border border-line bg-card px-5 py-2.5 text-[15px] text-ink-700 transition-colors hover:bg-paper-100"
                    >
                      ← 上一步
                    </button>
                    <div className="flex items-center gap-4">
                      {curQ.skippable && (
                        <button type="button" onClick={() => go(stepIndex + 1)} className="text-caption text-ink-300 hover:text-ink-500">
                          跳过此题
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => go(stepIndex + 1)}
                        className="rounded-[10px] bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
                      >
                        下一步 →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step?.type === 'penalty' && (
                <ClosingPenalty
                  penalties={plans.flatMap((p) => p.penalties)}
                  note={plans.find((p) => p.penaltyNote)?.penaltyNote}
                  read={penaltyRead}
                  onRead={setPenaltyRead}
                  onPrev={() => go(stepIndex - 1)}
                  onNext={() => go(stepIndex + 1)}
                />
              )}

              {step?.type === 'pending' && pack && (
                <ClosingPending
                  reviewNotes={pendingReviewNotes(pack)}
                  items={sessionItems}
                  onJump={jumpToRef}
                  onPrev={() => go(stepIndex - 1)}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* 移动端底部固定操作条 */}
          {step?.type === 'q' && (
            <div className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center gap-3 border-t border-line bg-[rgba(250,247,241,.92)] px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-[12px] md:hidden">
              <button
                type="button"
                onClick={() => go(stepIndex - 1)}
                className="rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] text-ink-700"
              >
                ← 上一步
              </button>
              <button
                type="button"
                onClick={() => persist(answers, stepIndex, penaltyRead)}
                className="flex items-center gap-1 rounded-[10px] border border-line bg-card px-3 py-2 text-[14px] text-ink-500"
                aria-label="暂存"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(stepIndex + 1)}
                className={cn('flex-1 rounded-[10px] bg-primary py-2 text-[15px] font-medium text-primary-foreground')}
              >
                下一步 →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 顶部右侧：退出并暂存 */}
      <button
        type="button"
        onClick={() => {
          persist(answers, stepIndex, penaltyRead)
          navigate('/')
        }}
        className="fixed right-4 top-20 z-40 text-caption text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline"
      >
        退出并暂存
      </button>
    </div>
  )
}
