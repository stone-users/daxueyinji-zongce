import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnswerMap, CatalogEntry, ModulePlan, RulePack, Session, WizardProgress } from '@/engine/types'
import { buildPlan, flattenCatalog, loadCatalog, loadPack, pendingReviewNotes } from '@/engine/rulepack'
import {
  buildSession,
  clearAll,
  evidenceKeys,
  isAnswered,
  isQuestionVisible,
  loadProgress,
  saveProgress,
  saveSession,
} from '@/engine/session'
import SetupQuestions from '@/components/wizard/SetupQuestions'
import ResumePrompt from '@/components/wizard/ResumePrompt'
import ModuleHeader from '@/components/wizard/ModuleCover'
import QuestionCard from '@/components/wizard/QuestionCard'
import { ProgressMap, ProgressBarMobile, type MapEntry } from '@/components/wizard/ProgressMap'
import { ClosingPenalty, ClosingPending } from '@/components/wizard/Closing'

type Phase = 'loading' | 'resume' | 'setup' | 'run'
/** 页面粒度 = 一个模块一张长页 + 收尾两页 */
type Page = { type: 'module'; m: number } | { type: 'penalty' } | { type: 'pending' }

type FlatEntry = CatalogEntry & { level: string }

function buildPages(plans: ModulePlan[]): Page[] {
  const pages: Page[] = plans.map((_, m): Page => ({ type: 'module', m })).filter((p) => p.type === 'module' && plans[p.m].questions.length > 0)
  pages.push({ type: 'penalty' }, { type: 'pending' })
  return pages
}

/** 题卡锚点 id（?item= 回改滚动定位用） */
const anchorId = (qid: string) => `q-${qid}`

/** 题目 id 尾部 #n 是引擎全局序号，跨上下文不稳定；匹配一律用稳定段（模块/章节/条目名） */
const stripSeq = (id: string) => id.replace(/#\d+$/, '')

/** 恢复暂存时把旧 id 键映射回本次生成的题目 id（防止引擎序号漂移丢答案） */
function remapAnswers(plans: ModulePlan[], saved: AnswerMap): AnswerMap {
  const byBase = new Map<string, string>()
  for (const p of plans) for (const q of p.questions) byBase.set(stripSeq(q.id), q.id)
  const out: AnswerMap = {}
  for (const [k, v] of Object.entries(saved)) {
    out[byBase.get(stripSeq(k)) ?? k] = v
  }
  return out
}

/** 恢复入口：加载规则包推算上次进度位置（如「学术科研与创新 · 模块页」） */
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
        const pg = buildPages(pl)
        const s = pg[Math.min(progress.stepIndex, pg.length - 1)]
        let label = '入口'
        if (s?.type === 'module') label = `${pl[s.m].name}`
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
  const [pages, setPages] = useState<Page[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [uploaded, setUploaded] = useState<Set<string>>(new Set())
  const [penaltyRead, setPenaltyRead] = useState(false)
  const [meta, setMeta] = useState<{ college: string; grade: string; evalYear: string } | null>(null)
  const [jumpRef, setJumpRef] = useState<string | null>(null) // /wizard?item=<itemRef> 回改定位
  const [jumpModule, setJumpModule] = useState<string | null>(null) // /wizard?module=<id>
  const [highlightQ, setHighlightQ] = useState<string | null>(null) // 回改命中的题卡高亮
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 启动：检测暂存；导出页"回改"链接（?item=itemRef / ?module=id）命中时跳过 ResumePrompt 直接定位
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const item = params.get('item')
    const mod = params.get('module')
    const p = loadProgress()
    if ((item || mod) && p?.college) {
      setJumpRef(item)
      setJumpModule(mod)
      void boot(p.college, p.grade, p.evalYear, p)
      return
    }
    setPhase(p && p.college ? 'resume' : 'setup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 按稳定段定位题目：返回模块序号与本次会话的真实题目 id */
  const findQuestion = useCallback(
    (ref: string): { m: number; qid: string } | null => {
      const base = stripSeq(ref.replace(/\[\d+\]$/, '')) // comp 条目 itemRef 带 [n] 后缀
      for (let m = 0; m < plans.length; m++) {
        const q = plans[m].questions.find((x) => stripSeq(x.id) === base)
        if (q) return { m, qid: q.id }
      }
      return null
    },
    [plans],
  )

  const go = useCallback(
    (next: number) => {
      setDir(next >= pageIndex ? 1 : -1)
      setPageIndex(Math.max(0, Math.min(pages.length - 1, next)))
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    },
    [pageIndex, pages.length],
  )

  const goModule = useCallback(
    (m: number) => {
      const idx = pages.findIndex((p) => p.type === 'module' && p.m === m)
      if (idx >= 0) go(idx)
    },
    [pages, go],
  )

  /** 跳到某题所在模块页，并滚动+高亮该题卡 */
  const jumpToRef = useCallback(
    (ref: string) => {
      const hit = findQuestion(ref)
      if (!hit) return
      goModule(hit.m)
      // 等模块长页渲染完毕后滚动定位并高亮
      window.setTimeout(() => {
        document.getElementById(anchorId(hit.qid))?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightQ(hit.qid)
        if (highlightTimer.current) clearTimeout(highlightTimer.current)
        highlightTimer.current = setTimeout(() => setHighlightQ(null), 2600)
      }, 120)
    },
    [findQuestion, goModule],
  )

  // boot 完成后执行回改定位（?item= 优先，其次 ?module=）
  useEffect(() => {
    if (phase !== 'run' || pages.length === 0) return
    if (jumpRef) {
      jumpToRef(jumpRef)
      setJumpRef(null)
      setJumpModule(null)
    } else if (jumpModule) {
      const m = plans.findIndex((p) => p.id === jumpModule)
      if (m >= 0) goModule(m)
      setJumpModule(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, jumpRef, jumpModule, pages, plans])

  // 佐证已上传集合
  useEffect(() => {
    evidenceKeys().then((ks) => setUploaded(new Set(ks)))
  }, [])

  const boot = useCallback(async (college: string, grade: string, evalYear: string, saved?: WizardProgress | null) => {
    const pk = await loadPack(college)
    const cat = flattenCatalog(await loadCatalog(college))
    const pl = buildPlan(pk, grade, cat.length > 0)
    const pg = buildPages(pl)
    setPack(pk)
    setCatalog(cat)
    setPlans(pl)
    setPages(pg)
    setMeta({ college, grade, evalYear })
    if (saved) {
      setAnswers(remapAnswers(pl, saved.answers ?? {}))
      setPenaltyRead(saved.penaltyRead ?? false)
      setPageIndex(Math.min(saved.stepIndex ?? 0, pg.length - 1))
    } else {
      setAnswers({})
      setPenaltyRead(false)
      setPageIndex(0)
    }
    setPhase('run')
  }, [])

  /** 会话后处理：模块 id → 规则包中文模块名（导出页展示用）；规则包校对 pending 仅留 JSON 供开发排查 */
  const finalizeSession = useCallback(
    (s: Session): Session => {
      const nameById = new Map(plans.map((p) => [p.id, p.name]))
      const cn = (id: string) => nameById.get(id) ?? id
      return {
        ...s,
        items: s.items.map((it) => ({ ...it, module: cn(it.module) })),
        totals: {
          ...s.totals,
          perModule: Object.fromEntries(Object.entries(s.totals.perModule).map(([k, v]) => [cn(k), v])),
        },
        // 开发排查字段：规则包 pending_review 不在任何界面展示，仅随 JSON 导出保留
        ...(pack ? { pack_pending_review: pendingReviewNotes(pack) } : {}),
      }
    },
    [plans, pack],
  )

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
          stepIndex: idx, // 页面粒度：模块页序号（旧版逐题序号会被自然钳制到页数内）
          answers: a,
          penaltyRead: read,
          savedAt: new Date().toISOString(),
        })
        saveSession(finalizeSession(buildSession(pk, pl, a, m.grade, m.evalYear, uploaded)))
      }, 500)
    },
    [meta, pack, plans, uploaded, finalizeSession],
  )

  useEffect(() => {
    if (phase === 'run') persist(answers, pageIndex, penaltyRead)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, pageIndex, penaltyRead, phase, uploaded])

  const finish = useCallback(() => {
    if (pack && meta && plans.length) {
      saveSession(finalizeSession(buildSession(pack, plans, answers, meta.grade, meta.evalYear, uploaded)))
    }
    navigate('/export')
  }, [pack, meta, plans, answers, uploaded, navigate, finalizeSession])

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
  const page = pages[pageIndex]
  const curPlan = page?.type === 'module' ? plans[page.m] : null
  const modulePageCount = pages.filter((p) => p.type === 'module').length
  const isLastModule = page?.type === 'module' && pageIndex === modulePageCount - 1

  // 条件显隐（depends_on）：前置题答案不满足的题不渲染、不计入总题数/未答数
  const visibleOf = (p: ModulePlan) => p.questions.filter((q) => isQuestionVisible(q, p, answers))
  const curVisible = curPlan ? visibleOf(curPlan) : []

  const entries: MapEntry[] = plans
    .map((p, m) => ({ p, m }))
    .filter(({ p }) => p.questions.length > 0)
    .map(({ p, m }) => {
      const vis = visibleOf(p)
      const answered = vis.filter((q) => isAnswered(q, answers[q.id])).length
      const status = answered === vis.length && vis.length > 0 ? 'done' : answered > 0 ? 'partial' : 'todo'
      return {
        id: p.id,
        name: p.name,
        status,
        active: page?.type === 'module' && page.m === m,
        clickable: true, // 未答不卡人：任何模块都可随时跳转
        done: answered,
        total: vis.length,
      }
    })
  const penaltyPageIdx = pages.findIndex((p) => p.type === 'penalty')
  const pendingPageIdx = pages.findIndex((p) => p.type === 'pending')
  const closing: MapEntry[] = [
    { id: 'closing-penalty', name: '减分自查', status: page?.type === 'penalty' ? 'partial' : penaltyRead ? 'done' : 'todo', active: page?.type === 'penalty', clickable: true },
    { id: 'closing-pending', name: '待确认项', status: page?.type === 'pending' ? 'partial' : 'todo', active: page?.type === 'pending', clickable: true },
  ]

  const handleMapJump = (id: string) => {
    if (id === 'closing-penalty') go(penaltyPageIdx)
    else if (id === 'closing-pending') go(pendingPageIdx)
    else {
      const m = plans.findIndex((p) => p.id === id)
      if (m >= 0) goModule(m)
    }
  }

  const currentName = curPlan ? curPlan.name : page?.type === 'penalty' ? '减分自查' : '待确认项'

  return (
    <div>
      <ProgressBarMobile
        entries={entries}
        currentName={currentName}
        currentIndex={curPlan ? entries.findIndex((e) => e.id === curPlan.id) : -1}
        onJump={handleMapJump}
      />
      <div className="mx-auto flex max-w-marketing items-start gap-8 px-4 sm:px-6">
        {/* 左侧进度地图：sticky 悬挂在导航栏下方，长页滚动时保持可见；自身超高可内部滚动 */}
        <div className="sticky top-20 hidden max-h-[calc(100vh-6rem)] self-start overflow-y-auto py-8 lg:block">
          <ProgressMap entries={entries} closing={closing} onJump={handleMapJump} />
        </div>

        <div className="min-w-0 flex-1 py-6 pb-24 md:pb-10">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={pageIndex}
              custom={dir}
              initial={{ opacity: 0, x: 32 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 * dir }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {page?.type === 'module' && curPlan && (
                <div className="mx-auto max-w-wizard">
                  <ModuleHeader
                    moduleId={curPlan.id}
                    name={curPlan.name}
                    index={page.m}
                    total={plans.length}
                    questionCount={curVisible.length}
                    answeredCount={curVisible.filter((q) => isAnswered(q, answers[q.id])).length}
                    maxScore={curPlan.maxScore}
                    note={curPlan.note && curPlan.note.length <= 60 ? curPlan.note : undefined}
                  />
                  {/* 模块长页：所有题卡纵向排列，向下滚动连续作答 */}
                  <div className="mt-6 space-y-6">
                    {curVisible.map((q, qi) => (
                      <div
                        key={q.id}
                        id={anchorId(q.id)}
                        className={cn(
                          'scroll-mt-24 rounded-[14px] transition-shadow duration-500',
                          highlightQ === q.id && 'shadow-[0_0_0_2px_#C05A3E]',
                        )}
                      >
                        <QuestionCard
                          q={q}
                          seqLabel={`${q.moduleName} · Q${qi + 1}`}
                          answer={answers[q.id]}
                          onAnswer={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
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
                      </div>
                    ))}
                  </div>
                  {/* 模块级翻页：未答不拦截 */}
                  <div className="mt-8 flex items-center justify-between">
                    {pageIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => go(pageIndex - 1)}
                        className="rounded-[10px] border border-line bg-card px-5 py-2.5 text-[15px] text-ink-700 transition-colors hover:bg-paper-100"
                      >
                        ← 上一模块
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => go(pageIndex + 1)}
                      className="rounded-[10px] bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
                    >
                      {isLastModule ? '下一步：减分自查 →' : '下一模块 →'}
                    </button>
                  </div>
                </div>
              )}

              {page?.type === 'penalty' && (
                <ClosingPenalty
                  penalties={plans.flatMap((p) => p.penalties)}
                  note={plans.find((p) => p.penaltyNote)?.penaltyNote}
                  read={penaltyRead}
                  onRead={setPenaltyRead}
                  onPrev={() => go(pageIndex - 1)}
                  onNext={() => go(pageIndex + 1)}
                />
              )}

              {page?.type === 'pending' && pack && (
                <ClosingPending
                  items={sessionItems}
                  onJump={jumpToRef}
                  onPrev={() => go(pageIndex - 1)}
                  onFinish={finish}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* 移动端底部固定操作条（模块长页） */}
          {page?.type === 'module' && (
            <div className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center gap-3 border-t border-line bg-[rgba(250,247,241,.92)] px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-[12px] md:hidden">
              <button
                type="button"
                onClick={() => go(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] text-ink-700 disabled:opacity-40"
              >
                ← 上一模块
              </button>
              <button
                type="button"
                onClick={() => persist(answers, pageIndex, penaltyRead)}
                className="flex items-center gap-1 rounded-[10px] border border-line bg-card px-3 py-2 text-[14px] text-ink-500"
                aria-label="暂存"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(pageIndex + 1)}
                className={cn('flex-1 rounded-[10px] bg-primary py-2 text-[15px] font-medium text-primary-foreground')}
              >
                {isLastModule ? '减分自查 →' : '下一模块 →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 顶部右侧：退出并暂存 */}
      <button
        type="button"
        onClick={() => {
          persist(answers, pageIndex, penaltyRead)
          navigate('/')
        }}
        className="fixed right-4 top-20 z-40 text-caption text-ink-300 underline-offset-2 hover:text-ink-500 hover:underline"
      >
        退出并暂存
      </button>
    </div>
  )
}
