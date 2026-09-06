/**
 * 会话存储：localStorage 契约（zongce.session.v1，与导出页共享）
 * + 向导内部进度（zongce.wizard.v1）+ 佐证 IndexedDB（zongce-evidence）
 */
import { openDB, type IDBPDatabase } from 'idb'
import type { AnswerMap, ModulePlan, Question, RulePack, Session, SessionItem, WizardProgress } from './types'
import { MODULE_ORDER } from './types'
import { scoreAnswer } from './scoring'
import { awardRefScore, scoreMid } from './rulepack'

const SESSION_KEY = 'zongce.session.v1'
const PROGRESS_KEY = 'zongce.wizard.v1'
const LAST_SAVED_KEY = 'cufe-zc:last-saved'

// ---------------------------------------------------------------------------
// 佐证 IndexedDB（仅存本地）
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBPDatabase> | null = null
function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('zongce-evidence', 1, {
      upgrade(d) {
        d.createObjectStore('evidence')
      },
    })
  }
  return dbPromise
}

export async function putEvidence(itemRef: string, file: Blob): Promise<void> {
  await (await db()).put('evidence', file, itemRef)
}
export async function getEvidence(itemRef: string): Promise<Blob | undefined> {
  return (await (await db()).get('evidence', itemRef)) as Blob | undefined
}
export async function deleteEvidence(itemRef: string): Promise<void> {
  await (await db()).delete('evidence', itemRef)
}
export async function evidenceKeys(): Promise<string[]> {
  return (await (await db()).getAllKeys('evidence')).map(String)
}

// ---------------------------------------------------------------------------
// 作答判定
// ---------------------------------------------------------------------------

export function isAnswered(q: Question, a: AnswerMap[string] | undefined): boolean {
  if (!a) return false
  switch (a.kind) {
    case 'confirm':
      return a.confirmed
    case 'bool':
    case 'count':
      return true // 选"否/没参加"也是有效作答
    case 'choice':
      return a.label != null
    case 'ext':
      return a.value != null || q.extReadonly === true
    case 'volunteer':
      return a.hours > 0 || a.hoursOut > 0
    case 'comp':
      return a.entries.length > 0
    case 'award':
      return a.none || a.entries.length > 0
    default:
      return false
  }
}

function positiveAnswer(_q: Question, a: AnswerMap[string]): boolean {
  switch (a.kind) {
    case 'confirm':
      return a.confirmed
    case 'bool':
      return a.value
    case 'count':
      return a.participated && (a.count > 0 || Object.values(a.counts ?? {}).some((n) => n > 0))
    case 'choice':
      return a.label != null
    case 'ext':
      return a.value != null
    case 'volunteer':
      return a.hours > 0 || a.hoursOut > 0
    case 'comp':
      return a.entries.length > 0
    case 'award':
      // 「没有此类获奖（+0）」也是明确的有效作答
      return a.none || a.entries.length > 0
    default:
      return false
  }
}

/** 条件显隐：depends_on 前置题当前答案是否让本题可见（前置未作答时一律隐藏） */
export function isQuestionVisible(q: Question, plan: ModulePlan, answers: AnswerMap): boolean {
  if (!q.dependsOn) return true
  const ref = plan.questions.find((x) => x.id === q.dependsOn!.ref)
  const a = answers[q.dependsOn.ref]
  if (!ref || !a || !isAnswered(ref, a)) return false
  const pos = positiveAnswer(ref, a)
  return q.dependsOn.when === 'yes' ? pos : !pos
}

/** mutex 互斥：同组同时选择时取高不累加，返回被剔除的 question id 集合 */
export function mutexExcluded(plans: ModulePlan[], answers: AnswerMap): Set<string> {
  const excluded = new Set<string>()
  for (const plan of plans) {
    for (const q of plan.questions) {
      if (!q.mutexWith?.length || excluded.has(q.id)) continue
      const a = answers[q.id]
      if (!a || !positiveAnswer(q, a)) continue
      const myScore = scoreMid(scoreAnswer(q, a).score) ?? 0
      for (const otherId of q.mutexWith) {
        const o = plan.questions.find((x) => x.id === otherId)
        const oa = answers[otherId]
        if (!o || !oa || !positiveAnswer(o, oa) || excluded.has(otherId)) continue
        const otherScore = scoreMid(scoreAnswer(o, oa).score) ?? 0
        // 取高不累加：剔除分低者；平分剔除 id 较大者保证确定性
        excluded.add(myScore >= otherScore ? otherId : q.id)
      }
    }
  }
  return excluded
}

/** 与某题互斥且已被选中的题目名（HintBar 提示用） */
export function mutexConflictNames(plans: ModulePlan[], answers: AnswerMap, q: Question): string[] {
  if (!q.mutexWith?.length) return []
  const names: string[] = []
  for (const plan of plans) {
    for (const otherId of q.mutexWith) {
      const o = plan.questions.find((x) => x.id === otherId)
      const oa = answers[otherId]
      if (o && oa && positiveAnswer(o, oa)) names.push(o.sectionName || o.title)
    }
  }
  return names
}

// ---------------------------------------------------------------------------
// 作答 → 会话条目（zongce.session.v1）
// ---------------------------------------------------------------------------

export function buildSession(
  pack: RulePack,
  plans: ModulePlan[],
  answers: AnswerMap,
  grade: string,
  evalYear: string,
  uploaded: Set<string>,
): Session {
  const excluded = mutexExcluded(plans, answers)
  const items: SessionItem[] = []
  const moduleStatus: Record<string, 'done' | 'partial' | 'todo'> = {}
  const perModule: Record<string, number | string> = {}

  for (const plan of plans) {
    let done = 0
    let lo = 0
    let hi = 0
    let hasRange = false
    let visibleCount = 0
    for (const q of plan.questions) {
      // 条件隐藏题：按未答处理（不计分、不计入模块题数），旧答案保留在暂存中以便条件恢复时还原
      if (!isQuestionVisible(q, plan, answers)) continue
      visibleCount++
      const a = answers[q.id]
      if (isAnswered(q, a)) done++
      if (!a || !isAnswered(q, a) || !positiveAnswer(q, a) || excluded.has(q.id)) continue

      // comp/project/pub：每条赛事/项目/发表记录独立成一条 session item
      if (a.kind === 'comp') {
        a.entries.forEach((e, ei) => {
          const notes: string[] = []
          if (e.scoreNote) notes.push(e.scoreNote)
          let status: SessionItem['status'] = 'ok'
          if (e.levelSource !== 'catalog') {
            status = 'pending_review'
            notes.push('手动定级/修改过目录建议级别，定级最终以评议小组认定为准')
          }
          // 规则包未给出团队折算参数时，成员分兜底为同分 → 必须待评议确认
          if (e.scoreNote?.includes('需评议小组确认')) status = 'pending_review'
          if (Array.isArray(e.score)) notes.push(`区间分：建议 ${scoreMid(e.score)} 分，最终由评议小组在区间内定夺`)
          if (q.participationRule && a.kind === 'comp') notes.push(`口径：${q.participationRule}`)
          if (q.evidence?.length && !uploaded.has(q.id) && status === 'ok') status = 'needs_evidence'
          items.push({
            itemRef: `${q.id}[${ei}]`,
            name: `${q.sectionName} · ${e.name}${e.phase ? `（${e.phase}）` : ''}${e.pubType ? `（${e.pubType}）` : ''}`,
            module: q.module,
            score: e.score,
            systemNode: q.systemNode ?? null,
            routeTo: q.routeTo ?? null,
            note: notes.length ? notes.join('；') : null,
            evidence: { suggested: q.evidence?.length ? q.evidence.join('、') : null, uploaded: uploaded.has(q.id) },
            status,
            sourceQuote: q.sourceQuote ?? '',
          })
          if (Array.isArray(e.score)) {
            hasRange = true
            lo += e.score[0]
            hi += e.score[1]
          } else if (typeof e.score === 'number') {
            lo += e.score
            hi += e.score
          }
        })
        continue
      }

      const { score, note, capped } = scoreAnswer(q, a as NonNullable<typeof a>)
      if (score == null && q.kind !== 'ext') continue

      // 状态判定
      let status: SessionItem['status'] = 'ok'
      const notes: string[] = []
      if (note) notes.push(note)
      if (q.kind === 'ext') status = 'external'
      if (Array.isArray(score)) notes.push(`区间分：建议 ${scoreMid(score)} 分，最终由评议小组在区间内定夺`)
      if (capped) notes.push(`已触发上限截断（红字提示过）`)
      if (q.routeTo) notes.push(`系统将填入「${q.routeTo}」栏，请把本说明一并填入得分说明`)
      // award：自填非标准分 → 待评议确认；区间内自填 → 注明参考区间
      if (a.kind === 'award') {
        const customs = a.entries.filter((e) => e.custom)
        if (customs.length) {
          status = 'pending_review'
          notes.push(`自填分数待评议确认：${customs.map((e) => `${e.role ? `${e.role}·` : ''}${e.level} ${e.score} 分`).join('、')}`)
        }
        const ranged = a.entries.filter((e) => Array.isArray(awardRefScore(q, e)))
        if (ranged.length) {
          notes.push(
            `区间内自填：${ranged
              .map((e) => {
                const r = awardRefScore(q, e) as [number, number]
                return `${e.role ? `${e.role}·` : ''}${e.level}（参考区间 ${r[0]}–${r[1]}）`
              })
              .join('、')}，最终由评议小组在区间内定夺`,
          )
        }
      }
      if (q.evidence?.length && !uploaded.has(q.id)) {
        if (status === 'ok') status = 'needs_evidence'
        notes.push(`建议佐证：${q.evidence.join('、')}（未上传）`)
      }

      items.push({
        itemRef: q.id,
        name: q.sectionName && q.sectionName !== q.shortName ? `${q.sectionName} · ${q.shortName}` : q.shortName,
        module: q.module,
        score,
        systemNode: q.systemNode ?? null,
        routeTo: q.routeTo ?? null,
        note: notes.length ? notes.join('；') : null,
        evidence: { suggested: q.evidence?.length ? q.evidence.join('、') : null, uploaded: uploaded.has(q.id) },
        status,
        sourceQuote: q.sourceQuote ?? '',
      })

      if (Array.isArray(score)) {
        hasRange = true
        lo += score[0]
        hi += score[1]
      } else if (typeof score === 'number') {
        lo += score
        hi += score
      }
    }
    moduleStatus[plan.id] = visibleCount === 0 ? 'done' : done === 0 ? 'todo' : done >= visibleCount ? 'done' : 'partial'
    const v = Math.round(lo * 100) / 100
    const h = Math.round(hi * 100) / 100
    perModule[plan.id] = hasRange ? `${v}–${h}` : v
  }

  return {
    version: 1,
    college: pack.meta.college,
    packVersion: pack.meta.version,
    packSourceDoc: pack.meta.source_doc,
    grade,
    evalYear,
    savedAt: new Date().toISOString(),
    moduleStatus: Object.fromEntries(MODULE_ORDER.map((m) => [m, moduleStatus[m] ?? 'todo'])),
    items,
    totals: {
      perModule,
      note: '各模块小计为问卷自评口径，含区间分的模块以"下限–上限"展示；折合总成绩与定级最终以学院评议小组认定为准。',
    },
  }
}

// ---------------------------------------------------------------------------
// localStorage 读写
// ---------------------------------------------------------------------------

function stampSaved(): void {
  try {
    const d = new Date()
    window.localStorage.setItem(LAST_SAVED_KEY, `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
  } catch {
    /* ignore */
  }
}

export function saveSession(s: Session): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    stampSaved()
  } catch {
    /* ignore */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveProgress(p: WizardProgress): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
    stampSaved()
  } catch {
    /* ignore */
  }
}

export function loadProgress(): WizardProgress | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    return raw ? (JSON.parse(raw) as WizardProgress) : null
  } catch {
    return null
  }
}

export function clearAll(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
    window.localStorage.removeItem(PROGRESS_KEY)
    window.localStorage.removeItem(LAST_SAVED_KEY)
  } catch {
    /* ignore */
  }
}
