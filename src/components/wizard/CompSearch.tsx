import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CirclePlus, Pencil, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CatalogEntry, CompEntry, Question, Score } from '@/engine/types'
import { toScore } from '@/engine/rulepack'
import { awardOptions, rankToAward, scoreCompEntry, scoreProjectEntry, scorePubEntry } from '@/engine/scoring'
import StampBadge from './StampBadge'

type FlatEntry = CatalogEntry & { level: string }

const LEVELS = ['国家级', '省部级', '市地区级', '校级', '院级']
const AUTHORSHIP = ['独立', '一作', '二作', '三作及以后']

interface Draft {
  step: 1 | 2 | 3 | 4 | 5 // 1 名称 2 定级 3 获奖/阶段/类别 4 身份 5 完成
  name: string
  matched: FlatEntry | null
  notFound: boolean
  level: string
  levelSource: 'catalog' | 'manual' | 'modified'
  organizer: string
  award: string
  rank: number | null
  role: '负责人' | '成员'
  phases: string[] // project
  pubType: string // pub
  authorship: string
  count: number
}

const emptyDraft: Draft = {
  step: 1,
  name: '',
  matched: null,
  notFound: false,
  level: '',
  levelSource: 'manual',
  organizer: '',
  award: '',
  rank: null,
  role: '负责人',
  phases: [],
  pubType: '',
  authorship: '独立',
  count: 1,
}

/** 级别 matrix cell 的可用奖项 */
function cellAwards(q: Question, level: string, catalogAwardMap?: Record<string, string>): string[] {
  if (catalogAwardMap) return [...Object.keys(catalogAwardMap), '参加未获奖']
  const cell = q.matrix?.[level] as Record<string, unknown> | undefined
  if (!cell) return awardOptions()
  if (cell['获奖'] != null) return awardOptions()
  const keys = Object.keys(cell).filter((k) => k !== '参加')
  return ['参加未获奖', ...keys, '名次']
}

function draftToEntries(q: Question, d: Draft): CompEntry[] {
  if (q.kind === 'project') {
    return d.phases.map((phase) => {
      const base: CompEntry = {
        name: d.name,
        level: d.level,
        levelSource: d.levelSource,
        organizer: d.organizer || undefined,
        award: '参加未获奖',
        role: d.role,
        phase,
        score: null,
      }
      const { score, note } = scoreProjectEntry(q, base)
      return { ...base, score, scoreNote: note }
    })
  }
  if (q.kind === 'pub') {
    const base: CompEntry = {
      name: d.name,
      level: '',
      levelSource: 'catalog',
      award: '参加未获奖',
      role: d.role,
      pubType: d.pubType,
      authorship: d.authorship,
      count: d.count,
      score: null,
    }
    const { score, note } = scorePubEntry(q, base)
    return [{ ...base, score, scoreNote: note }]
  }
  const award = d.award === '名次' && d.rank ? (rankToAward(q, d.rank) ?? d.award) : d.award
  const catalogMap = d.matched?.award_map
  const mappedAward = catalogMap?.[d.award]
  const base: CompEntry = {
    name: d.name,
    level: d.level,
    levelSource: d.levelSource,
    organizer: d.organizer || d.matched?.organizer || undefined,
    award: d.award,
    rank: d.rank ?? undefined,
    role: d.role,
    score: null,
  }
  if (mappedAward && mappedAward.includes('仅算参加')) {
    const { score, note } = scoreCompEntry(q, { ...base, award: '参加未获奖' })
    return [{ ...base, score, scoreNote: [`目录规定「${d.award}」仅算参加`, note].filter(Boolean).join('；') }]
  }
  const { score, note } = scoreCompEntry(q, { ...base, award: mappedAward ?? award })
  return [{ ...base, score, scoreNote: note }]
}

function fmtScore(s: Score): string {
  if (s == null) return '待评议'
  return Array.isArray(s) ? `+${s[0]}–${s[1]}` : `+${s}`
}

// ---------------------------------------------------------------------------
// comp-search 三段式（名称 → 定级 → 获奖/阶段/类别 → 身份），支持多条目堆叠
// ---------------------------------------------------------------------------

export default function CompSearch({
  q,
  catalog,
  entries,
  onChange,
}: {
  q: Question
  catalog: FlatEntry[]
  entries: CompEntry[]
  onChange: (entries: CompEntry[]) => void
}) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<FlatEntry[]>([])
  const [showSug, setShowSug] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const needName = q.kind !== 'pub' // pub 无赛事名，用作品/文章名占位即可

  // 150ms 防抖模糊搜索
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const kw = query.trim()
      if (!kw) {
        setSuggestions([])
        return
      }
      setSuggestions(catalog.filter((e) => e.name.toLowerCase().includes(kw.toLowerCase())).slice(0, 8))
    }, 150)
  }, [query, catalog])

  const commit = (d: Draft) => {
    onChange([...entries, ...draftToEntries(q, d)])
    setDraft(null)
    setQuery('')
  }

  const removeAt = (i: number) => onChange(entries.filter((_, idx) => idx !== i))

  const totalText = useMemo(() => {
    if (!entries.length) return ''
    return entries.map((e) => `${e.name || e.pubType}${e.level ? ` · ${e.level}` : ''}${e.phase ? ` · ${e.phase}` : ''}${e.award && q.kind === 'comp' ? ` · ${e.award}` : ''} · ${e.role ?? ''} → ${fmtScore(e.score)} 分`).join('\n')
  }, [entries, q.kind])

  return (
    <div className="space-y-4">
      {q.whitelistRequired && (
        <div className="rounded-[10px] bg-paper-100 px-4 py-2.5 text-caption text-ink-500">
          本学院仅认定目录内赛事的参加分{q.catalogAvailable ? '' : '（目录暂未收录进规则包，未命中时将走人工定级并标记待评议确认）'}。
        </div>
      )}
      {q.hardConstraints?.length ? (
        <div className="rounded-[10px] bg-paper-100 px-4 py-2.5 text-caption text-ink-500">
          硬性条件：{q.hardConstraints.join('；')}
        </div>
      ) : null}

      {/* 已添加条目 */}
      <AnimatePresence initial={false}>
        {entries.map((e, i) => (
          <motion.div
            key={`${e.name}-${e.phase ?? ''}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative flex items-center gap-3 rounded-[10px] border border-line bg-paper-50 px-4 py-3"
          >
            {e.levelSource !== 'catalog' && q.kind === 'comp' && (
              <StampBadge variant="pending" className="absolute -right-2 -top-3 scale-75 bg-card" />
            )}
            <span className="min-w-0 flex-1 truncate text-body text-ink-900">
              {e.name || e.pubType}
              <span className="text-ink-500">
                {e.level ? ` · ${e.level}` : ''}
                {e.phase ? ` · ${e.phase}` : ''}
                {e.pubType ? ` · ${e.pubType}` : ''}
                {e.authorship && q.kind === 'pub' ? ` · ${e.authorship}` : ''}
                {q.kind === 'comp' && e.award ? ` · ${e.award}${e.rank ? `（第${e.rank}名）` : ''}` : ''}
                {q.kind !== 'pub' && e.role ? ` · ${e.role}` : ''}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[15px] font-semibold tabular-nums text-ink-900">{fmtScore(e.score)} 分</span>
            <button type="button" onClick={() => removeAt(i)} className="shrink-0 text-ink-300 transition-colors hover:text-danger" aria-label="删除">
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 新条目三段式 */}
      {draft ? (
        <div className="space-y-4 rounded-[12px] border border-line bg-card p-4">
          {/* 步骤摘要 */}
          {draft.name && (
            <button type="button" onClick={() => setDraft({ ...draft, step: 1 })} className="flex items-center gap-2 text-caption text-ink-500 hover:text-primary">
              <Pencil className="h-3 w-3" /> {q.kind === 'pub' ? `作品：${draft.name || '（未填）'}` : `比赛：${draft.name}`}
            </button>
          )}

          {/* ① 名称 */}
          {draft.step === 1 && (
            <div className="relative">
              <label className="mb-1.5 block text-body text-ink-700">{q.kind === 'pub' ? '作品/文章名称' : '比赛名称'}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowSug(true)
                  }}
                  onFocus={() => setShowSug(true)}
                  placeholder={catalog.length ? '输入关键词搜索目录…' : '输入名称'}
                  className="w-full rounded-[10px] border border-line bg-card py-2.5 pl-9 pr-3 text-body text-ink-900 focus:border-primary focus:outline-none"
                />
              </div>
              {showSug && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[10px] border border-line bg-card shadow-card-hover">
                  {suggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, name: s.name, matched: s, level: s.level, levelSource: 'catalog', step: q.kind === 'comp' ? 2 : 3 })
                        setQuery(s.name)
                        setShowSug(false)
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-body text-ink-700 hover:bg-paper-100"
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="shrink-0 rounded bg-paper-100 px-1.5 py-0.5 text-[11px] text-primary">{s.level}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-caption text-primary hover:underline"
                  onClick={() => {
                    if (!query.trim()) return
                    setDraft({ ...draft, name: query.trim(), matched: null, notFound: true, step: q.kind === 'comp' ? 2 : 3 })
                    setShowSug(false)
                  }}
                >
                  找不到？使用「{query.trim() || '手动输入'}」继续 →
                </button>
                <button type="button" className="text-caption text-ink-300 hover:text-ink-500" onClick={() => setDraft(null)}>
                  取消
                </button>
              </div>
            </div>
          )}

          {/* ② 定级 */}
          {draft.step === 2 &&
            q.kind !== 'pub' &&
            (draft.matched ? (
              <div className="space-y-3">
                <p className="text-body text-ink-700">
                  目录建议级别：
                  <span className="ml-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-[14px] font-medium text-primary">{draft.level}</span>
                </p>
                <p className="text-caption text-ink-500">依据主办方：{draft.matched.organizer ?? '—'}</p>
                <LevelEditor
                  value={draft.level}
                  onChange={(lv) => setDraft({ ...draft, level: lv, levelSource: lv === draft.matched!.level ? 'catalog' : 'modified' })}
                />
                {draft.levelSource === 'modified' && (
                  <p className="rounded-[8px] bg-warning-soft px-3 py-2 text-caption text-warning-foreground">
                    你修改了目录建议级别，本条将标记「待评议确认」，定级最终以评议小组认定为准。
                  </p>
                )}
                <NextButton onClick={() => setDraft({ ...draft, step: 3 })} />
              </div>
            ) : q.whitelistRequired && q.catalogAvailable ? (
              <div className="space-y-3 rounded-[10px] bg-danger-soft px-4 py-3">
                <p className="text-body text-danger">该赛事不在学院认定目录内，不计分。</p>
                <button
                  type="button"
                  className="text-caption text-primary hover:underline"
                  onClick={() => {
                    setDraft({ ...emptyDraft })
                    setQuery('')
                  }}
                >
                  ← 换一场比赛
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-[10px] bg-paper-100 px-4 py-3 text-caption leading-relaxed text-ink-700">
                  目录未收录该活动。判断指引——看主办方代表谁：全国性协会/教育部 → 国家级；省级厅局 → 省部级；市级部门 → 市地区级；学校/企业 → 校级；院系/社团 → 院级。
                </div>
                <input
                  value={draft.organizer}
                  onChange={(e) => setDraft({ ...draft, organizer: e.target.value })}
                  placeholder="主办方名称（评议小组复核依据，必填）"
                  className="w-full rounded-[10px] border border-line bg-card px-3 py-2.5 text-body text-ink-900 focus:border-primary focus:outline-none"
                />
                <LevelEditor value={draft.level} onChange={(lv) => setDraft({ ...draft, level: lv, levelSource: 'manual' })} />
                <p className="rounded-[8px] bg-warning-soft px-3 py-2 text-caption text-warning-foreground">
                  手动定级的条目将标记「待评议确认」，定级最终以评议小组认定为准。
                </p>
                <NextButton disabled={!draft.level || !draft.organizer.trim()} onClick={() => setDraft({ ...draft, step: 3 })} />
              </div>
            ))}

          {/* ③ 获奖 / 阶段 / 类别 */}
          {draft.step === 3 && q.kind === 'comp' && (
            <div className="space-y-3">
              <p className="text-body text-ink-700">获奖情况</p>
              <div className="flex flex-wrap gap-2">
                {cellAwards(q, draft.level, draft.matched?.award_map).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDraft({ ...draft, award: a })}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-[14px] transition-colors',
                      draft.award === a ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {draft.award === '名次' && (
                <div className="flex items-center gap-2">
                  <span className="text-body text-ink-700">第</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.rank ?? ''}
                    onChange={(e) => setDraft({ ...draft, rank: Number(e.target.value) || null })}
                    className="h-10 w-20 rounded-[10px] border border-line bg-card text-center font-mono text-[18px] tabular-nums focus:border-primary focus:outline-none"
                  />
                  <span className="text-body text-ink-700">
                    名{draft.rank ? `（按规则折算为：${rankToAward(q, draft.rank) ?? '—'}）` : ''}
                  </span>
                </div>
              )}
              <NextButton disabled={!draft.award || (draft.award === '名次' && !draft.rank)} onClick={() => setDraft({ ...draft, step: q.teamRuleText || q.roleMultiplier ? 4 : 5 })} />
            </div>
          )}
          {draft.step === 3 && q.kind === 'project' && (
            <div className="space-y-3">
              <p className="text-body text-ink-700">本学年项目进展到哪个阶段？（可多选）</p>
              <div className="flex flex-wrap gap-2">
                {q.phaseNames?.map((p) => {
                  const on = draft.phases.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDraft({ ...draft, phases: on ? draft.phases.filter((x) => x !== p) : [...draft.phases, p] })}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-[14px] transition-colors',
                        on ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              {q.matrix && draft.phases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-body text-ink-700">项目级别</p>
                  <LevelEditor value={draft.level} onChange={(lv) => setDraft({ ...draft, level: lv, levelSource: 'manual' })} />
                </div>
              )}
              <NextButton disabled={!draft.phases.length || !draft.level} onClick={() => setDraft({ ...draft, step: q.teamRuleText || q.roleMultiplier ? 4 : 5 })} />
            </div>
          )}
          {draft.step === 3 && q.kind === 'pub' && (
            <div className="space-y-3">
              <p className="text-body text-ink-700">发表载体类别</p>
              <div className="space-y-2">
                {q.pubRows?.map((r) => {
                  const row = q.matrix?.[r] as unknown[]
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDraft({ ...draft, pubType: r })}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[10px] border px-4 py-2.5 text-left text-body transition-colors',
                        draft.pubType === r ? 'border-primary bg-primary/5 text-primary' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                      )}
                    >
                      {r}
                      <span className="font-mono text-[13px] tabular-nums text-ink-500">{Array.isArray(row) ? `独立 ${toScore(row[0]) ?? '—'} 分/篇` : ''}</span>
                    </button>
                  )
                })}
              </div>
              <NextButton disabled={!draft.pubType} onClick={() => setDraft({ ...draft, step: 4 })} />
            </div>
          )}

          {/* ④ 身份 / 作者位次 */}
          {draft.step === 4 && q.kind !== 'pub' && (
            <div className="space-y-3">
              <p className="text-body text-ink-700">你在团队中的身份</p>
              <div className="grid grid-cols-2 gap-3">
                {(['负责人', '成员'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDraft({ ...draft, role: r })}
                    className={cn(
                      'rounded-[12px] border px-4 py-3 text-[15px] font-medium transition-colors',
                      draft.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {draft.role === '成员' && (q.teamRuleText || q.roleMultiplier) && (
                <p className="text-caption text-ink-500">成员折算将按学院规则自动计算（{q.roleMultiplier ? `×${q.roleMultiplier['成员'] ?? 1}` : q.teamRuleText}）。</p>
              )}
              <NextButton onClick={() => setDraft({ ...draft, step: 5 })} />
            </div>
          )}
          {draft.step === 4 && q.kind === 'pub' && (
            <div className="space-y-3">
              <p className="text-body text-ink-700">作者位次</p>
              <div className="flex flex-wrap gap-2">
                {AUTHORSHIP.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDraft({ ...draft, authorship: a })}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-[14px] transition-colors',
                      draft.authorship === a ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-body text-ink-700">
                篇数
                <input
                  type="number"
                  min={1}
                  value={draft.count}
                  onChange={(e) => setDraft({ ...draft, count: Math.max(1, Number(e.target.value) || 1) })}
                  className="h-10 w-20 rounded-[10px] border border-line bg-card text-center font-mono text-[18px] tabular-nums focus:border-primary focus:outline-none"
                />
              </div>
              <NextButton onClick={() => setDraft({ ...draft, step: 5 })} />
            </div>
          )}

          {/* ⑤ 预览并加入 */}
          {draft.step === 5 && (
            <div className="space-y-3">
              {draftToEntries(q, draft).map((e, i) => (
                <div key={i} className="rounded-[10px] bg-paper-100 px-4 py-3 text-body text-ink-900">
                  {e.name}
                  <span className="text-ink-500">
                    {e.level ? ` · ${e.level}` : ''}
                    {e.phase ? ` · ${e.phase}` : ''}
                    {e.pubType ? ` · ${e.pubType}` : ''}
                    {e.award && q.kind === 'comp' ? ` · ${e.award}` : ''} · {q.kind === 'pub' ? e.authorship : e.role}
                  </span>
                  <span className="ml-2 font-mono font-semibold tabular-nums">{fmtScore(e.score)} 分</span>
                  {e.scoreNote && <span className="block text-caption text-ink-500">{e.scoreNote}</span>}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => commit(draft)}
                  className="rounded-[10px] bg-primary px-5 py-2 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
                >
                  加入清单
                </button>
                <button type="button" onClick={() => setDraft(null)} className="rounded-[10px] px-4 py-2 text-[14px] text-ink-500 hover:text-ink-900">
                  放弃
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft({ ...emptyDraft, pubType: '' })
            setQuery('')
          }}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-line px-4 py-2.5 text-body text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <CirclePlus className="h-4 w-4" />
          {entries.length ? '再加一场 / 一条' : needName ? '添加一场比赛 / 项目' : '添加一篇发表记录'}
        </button>
      )}

      {totalText && entries.length > 1 && (
        <p className="text-caption text-ink-500">
          共 {entries.length} 条。
          {q.participationRule ? `口径：${q.participationRule}` : ''}
        </p>
      )}
      {q.participationRule && entries.length <= 1 && <p className="text-caption text-ink-500">口径：{q.participationRule}</p>}
    </div>
  )
}

function LevelEditor({ value, onChange }: { value: string; onChange: (lv: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-ink-500">修改级别：</span>
      {LEVELS.map((lv) => (
        <button
          key={lv}
          type="button"
          onClick={() => onChange(lv)}
          className={cn(
            'rounded-full border px-3 py-1 text-[13px] transition-colors',
            value === lv ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-card text-ink-700 hover:border-primary/50',
          )}
        >
          {lv}
        </button>
      ))}
    </div>
  )
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="rounded-[10px] bg-primary px-5 py-2 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        下一步
      </button>
    </div>
  )
}
