/** 与向导页共享的 localStorage 会话契约（zongce.session.v1）。本文件仅供导出页读取/写入。 */

export const SESSION_KEY = 'zongce.session.v1'
export const EVIDENCE_DB_NAME = 'zongce-evidence'

export type ItemStatus = 'ok' | 'pending_review' | 'needs_evidence' | 'external'
export type ModuleStatus = 'done' | 'partial' | 'todo'

export interface SessionItem {
  itemRef: string
  name: string
  module: string
  score: number | [number, number] | null
  systemNode: string | null
  routeTo: string | null
  note: string | null
  evidence: { suggested: string | null; uploaded: boolean }
  status: ItemStatus
  sourceQuote: string
}

export interface ZongceSession {
  version: 1
  college: string
  packVersion: string
  packSourceDoc: string
  grade: string
  evalYear: string
  savedAt: string
  moduleStatus: Record<string, ModuleStatus>
  items: SessionItem[]
  totals: { perModule: Record<string, number | string>; note: string }
  /** 开发排查专用：规则包校对待确认事项（pending_review），不在任何界面展示 */
  pack_pending_review?: string[]
}

/** 宽松校验 + 读取本地暂存 */
export function loadSession(): ZongceSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ZongceSession>
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) return null
    return parsed as ZongceSession
  } catch {
    return null
  }
}

export function saveSession(session: ZongceSession) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* localStorage 不可用时静默降级为内存态 */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* noop */
  }
}

/** 从导入的 JSON 文本恢复会话 */
export function parseSessionJson(text: string): ZongceSession | null {
  try {
    const parsed = JSON.parse(text) as Partial<ZongceSession>
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) return null
    return parsed as ZongceSession
  } catch {
    return null
  }
}

/** 分数显示：区间分展示区间，另注明评议小组定夺 */
export function formatScore(score: SessionItem['score']): {
  main: string
  isRange: boolean
} {
  if (score === null || score === undefined) return { main: '—', isRange: false }
  if (Array.isArray(score)) {
    return { main: `${score[0]}–${score[1]}`, isRange: true }
  }
  return { main: formatNumber(score, true), isRange: false }
}

export function formatNumber(n: number, withSign = false): string {
  const rounded = Math.round(n * 10) / 10
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  if (withSign && rounded > 0) return `+${str}`
  return str
}

/** 模块小计：优先 totals.perModule 数值，其次按条目求和（区间取中值） */
export function moduleSubtotal(session: ZongceSession, moduleName: string): number | string {
  const fromTotals = session.totals?.perModule?.[moduleName]
  if (typeof fromTotals === 'number') return fromTotals
  if (typeof fromTotals === 'string') return fromTotals
  let sum = 0
  for (const it of session.items) {
    if (it.module !== moduleName) continue
    if (typeof it.score === 'number') sum += it.score
    else if (Array.isArray(it.score)) sum += (it.score[0] + it.score[1]) / 2
  }
  return Math.round(sum * 10) / 10
}

/** 合计参考分（数值模块求和；字符串项忽略） */
export function totalReferenceScore(session: ZongceSession): number {
  const modules = Array.from(new Set(session.items.map((i) => i.module)))
  let sum = 0
  for (const m of modules) {
    const v = moduleSubtotal(session, m)
    if (typeof v === 'number') sum += v
  }
  return Math.round(sum * 10) / 10
}
