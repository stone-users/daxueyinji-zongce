/**
 * 计分器：作答 → 分值
 * 支持：matrix 级别×参加/获奖、award_rank_map 名次映射、team_rule 派生（成员折算）、
 * cap 截断、mutex 互斥、range_score 建议分+区间、uniform_all、志愿时长折算。
 */
import type { AnswerValue, CompEntry, Question, Score } from './types'
import { isRange, scoreMid, toScore } from './rulepack'

const AWARD_ORDER = ['特等奖', '一等奖', '二等奖', '三等奖', '优秀奖', '参与奖']

/** 团队折算：把规则包中的 team_rule 文本/参数解释为「负责人分 → 成员分」函数 */
export function memberScore(q: Question, leaderScore: number, level?: string, phase?: string): { score: number; note: string } {
  // 1) 结构化 role_multiplier（保险：成员 ×0.8）
  if (q.roleMultiplier) {
    const ratio = q.roleMultiplier['成员'] ?? 1
    const s = Math.round(leaderScore * ratio * 100) / 100
    return { score: s, note: `成员按负责人分值 ×${ratio} 折算，已自动计算` }
  }
  const t = q.teamRuleText ?? ''
  // 2) 「国家/省部/市地减4，校/院减2」（财税学科竞赛）
  let m = t.match(/国家级\/省部级\/市地区级减(\d+(?:\.\d+)?)分[，,]\s*校级\/院级减(\d+(?:\.\d+)?)分/)
  if (m) {
    const high = ['国家级', '省部级', '市地区级'].includes(level ?? '') ? Number(m[1]) : Number(m[2])
    return { score: Math.max(0, leaderScore - high), note: `成员较负责人减 ${high} 分，已自动计算` }
  }
  // 3) 「参加分减半、立项分-3、结项分-2」（金融科研项目）
  m = t.match(/参加分减半[、,，].*?立项分\s*[-−减]\s*(\d+(?:\.\d+)?).*?结项分\s*[-−减]\s*(\d+(?:\.\d+)?)/)
  if (m) {
    if (phase === '参加') return { score: Math.round((leaderScore / 2) * 100) / 100, note: '成员参加分减半，已自动计算' }
    if (phase === '立项') return { score: Math.max(0, leaderScore - Number(m[1])), note: `成员立项分 -${m[1]}，已自动计算` }
    if (phase === '结项') return { score: Math.max(0, leaderScore - Number(m[2])), note: `成员结项分 -${m[2]}，已自动计算` }
    return { score: Math.round((leaderScore / 2) * 100) / 100, note: '成员参加分减半，已自动计算' }
  }
  // 4) 「成员=负责人得分-2」/「少加1分」（金融竞赛、国贸）
  m = t.match(/成员\s*[=＝]\s*负责人(?:得分)?\s*[-−减]\s*(\d+(?:\.\d+)?)/) ?? t.match(/少加\s*(\d+(?:\.\d+)?)\s*分/)
  if (m) return { score: Math.max(0, leaderScore - Number(m[1])), note: `成员较负责人少加 ${m[1]} 分，已自动计算` }
  // 5) 无法解析 → 与负责人同分并标记待确认
  return { score: leaderScore, note: '团队折算规则需评议小组确认，暂按与负责人同分计' }
}

/** 名次 → 奖项（award_rank_map，如财税：第1名→一等、第2-4名→二等、第5-8名→三等；通用兜底：1→一 2→二 3及以后→三） */
export function rankToAward(q: Question, rank: number): string | null {
  const map = q.awardRankMap
  if (map) {
    for (const [k, v] of Object.entries(map)) {
      const m = k.match(/第(\d+)(?:\s*[-–]\s*(\d+))?名/)
      if (m) {
        const lo = Number(m[1])
        const hi = m[2] ? Number(m[2]) : lo
        if (rank >= lo && rank <= hi) return v
      }
    }
  }
  if (rank === 1) return '一等奖'
  if (rank === 2) return '二等奖'
  return '三等奖'
}

/** 区间获奖分 → 按奖项取点：一等=上限、三等=下限、二等=中值；可被 award_rank_map（区间上限/区间中值/区间下限/三等奖-1）覆盖 */
function awardFromRange(q: Question, award: string, range: [number, number]): number {
  const [lo, hi] = range
  const mid = Math.round(((lo + hi) / 2) * 100) / 100
  const mapVal = q.awardRankMap?.[award]
  if (mapVal) {
    if (mapVal.includes('上限')) return hi
    if (mapVal.includes('中值')) return mid
    if (mapVal.includes('下限')) return lo
    const m = mapVal.match(/三等奖\s*[-−]\s*(\d+(?:\.\d+)?)/)
    if (m) return Math.max(0, lo - Number(m[1])) // 三等奖-1 → 区间下限-1
    if (mapVal.includes('不算获奖')) return 0
  }
  if (award === '特等奖' || award === '一等奖') return hi
  if (award === '二等奖') return mid
  if (award === '三等奖') return lo
  if (award === '优秀奖') return Math.max(0, lo - 1) // 通用：优秀奖按三等奖-1（以各院原文为准时已由 map 覆盖）
  return 0 // 参与/参加未获奖
}

/** comp 条目计分：级别 matrix（{参加, 一等奖..} 或 {参加, 获奖: [lo,hi]}） */
export function scoreCompEntry(q: Question, e: CompEntry): { score: Score; note?: string } {
  const cell = q.matrix?.[e.level] as Record<string, unknown> | undefined
  if (!cell) return { score: null, note: '级别未匹配到矩阵，需人工核定' }
  const participation = toScore(cell['参加'])
  const awardVal = e.award === '名次' && e.rank ? rankToAward(q, e.rank) : e.award
  const noAward = e.award === '参加未获奖' || e.award === '参与奖' || awardVal === '参与奖'
  let awardScore: Score = 0
  let range: [number, number] | null = null
  if (!noAward && awardVal) {
    if (isRange(cell['获奖'])) {
      range = cell['获奖']
      awardScore = awardFromRange(q, awardVal, range)
    } else {
      // 固定获奖档（保险：一等奖/二等奖/三等奖 各列）；特等奖按一等奖计
      const key = awardVal === '特等奖' ? '一等奖' : awardVal
      awardScore = toScore(cell[key]) ?? toScore(cell['获奖']) ?? null
      if (awardScore == null) return { score: participation, note: `「${awardVal}」未在矩阵中，暂按参加分计，定级以评议小组认定为准` }
    }
  }
  const part = typeof participation === 'number' ? participation : 0
  let total = part + (typeof awardScore === 'number' ? awardScore : 0)
  let note: string | undefined
  // 区间端点与建议分同步做成员折算
  let lo = part + (range ? range[0] : 0)
  let hi = part + (range ? range[1] : 0)
  if (e.role === '成员') {
    const ms = memberScore(q, total, e.level)
    note = ms.note
    const adj = (v: number) => Math.max(0, Math.round((v - (total - ms.score)) * 100) / 100)
    lo = adj(lo)
    hi = adj(hi)
    total = ms.score
  }
  if (range) {
    return { score: [lo, hi], note: [note, `建议分 ${total}，区间 ${lo}–${hi}，最终由评议小组在区间内定夺`].filter(Boolean).join('；') }
  }
  return { score: total, note }
}

/** project 条目计分：阶段 matrix（参加/立项/结项 × 级别） */
export function scoreProjectEntry(q: Question, e: CompEntry): { score: Score; note?: string } {
  const phaseMatrix = q.matrix?.[e.phase ?? '参加'] as Record<string, unknown> | undefined
  if (!phaseMatrix) return { score: null }
  const raw = toScore(phaseMatrix[e.level] ?? phaseMatrix['统一'])
  if (raw == null || Array.isArray(raw)) return { score: raw }
  if (e.role === '成员') {
    const ms = memberScore(q, raw, e.level, e.phase)
    return { score: ms.score, note: ms.note }
  }
  return { score: raw }
}

const AUTHORSHIP_COLS = ['独立', '一作', '二作', '三作及以后']

/** pub 条目计分：刊物类别行 [独立, 一作, 二作, 三作+]；值可为 '×0.8' 比例 */
export function scorePubEntry(q: Question, e: CompEntry): { score: Score; note?: string } {
  const row = q.matrix?.[e.pubType ?? ''] as unknown[] | undefined
  if (!Array.isArray(row)) return { score: null, note: '刊物类别未匹配到矩阵，需人工核定' }
  const col = AUTHORSHIP_COLS.indexOf(e.authorship ?? '独立')
  const v = row[col < 0 ? 0 : col]
  if (typeof v === 'number') return { score: v * (e.count ?? 1) }
  if (typeof v === 'string' && v.startsWith('×')) {
    const base = typeof row[0] === 'number' ? row[0] : 0
    const ratio = Number(v.slice(1))
    return { score: Math.round(base * ratio * 100) / 100 * (e.count ?? 1), note: `按独立完成分 ${v} 折算` }
  }
  return { score: null }
}

/** 单题作答 → 分值与说明（count/anchor/bool/confirm/ext/volunteer） */
export function scoreAnswer(q: Question, a: AnswerValue): { score: Score; note?: string; capped?: boolean; capValue?: number } {
  switch (a.kind) {
    case 'confirm':
      return { score: a.confirmed ? (q.baseScore ?? null) : null }
    case 'bool':
      return { score: a.value ? (q.baseScore ?? null) : 0 }
    case 'choice': {
      const opt = q.options?.find((o) => o.label === a.label)
      if (!opt) return { score: null }
      const note = Array.isArray(opt.score)
        ? `建议分 ${scoreMid(opt.score)} 分，区间 ${opt.score[0]}–${opt.score[1]}，最终由评议小组在区间内定夺`
        : undefined
      return { score: opt.score, note }
    }
    case 'count': {
      // multi_count：一题多计数行，得分 = Σ counts[key] × unitScore（0 次的行不进说明文案）
      if (q.counters?.length) {
        const counts = a.counts ?? {}
        const anyCount = q.counters.some((c) => (counts[c.key] ?? 0) > 0)
        if (!a.participated && !anyCount) return { score: 0 }
        let lo = 0
        let hi = 0
        let hasRange = false
        const parts: string[] = []
        for (const c of q.counters) {
          const n = counts[c.key] ?? 0
          if (n <= 0) continue
          parts.push(`${c.label} ×${n}`)
          if (Array.isArray(c.unitScore)) {
            hasRange = true
            lo += c.unitScore[0] * n
            hi += c.unitScore[1] * n
          } else {
            lo += (c.unitScore ?? 0) * n
            hi += (c.unitScore ?? 0) * n
          }
        }
        let score: Score = hasRange ? [lo, hi] : lo
        const mid = scoreMid(score)
        if (q.cap != null && mid != null && mid > q.cap) {
          if (Array.isArray(score)) {
            const ratio = q.cap / mid
            score = [Math.floor(score[0] * ratio * 100) / 100, q.cap]
          } else score = q.cap
          return { score, capped: true, capValue: q.cap, note: `本项加分上限 ${q.cap} 分，已按上限计入` }
        }
        const note = [
          parts.length ? parts.join('、') : '',
          hasRange ? `建议分 ${scoreMid(score)} 分，区间 ${lo}–${hi}，最终由评议小组在区间内定夺` : '',
        ]
          .filter(Boolean)
          .join('；')
        return { score, note: note || undefined }
      }
      if (!a.participated || a.count <= 0) return { score: 0 }
      const unit = q.baseScore
      let score: Score
      if (Array.isArray(unit)) score = [unit[0] * a.count, unit[1] * a.count]
      else score = (unit ?? 0) * a.count
      const mid = scoreMid(score)
      if (q.cap != null && mid != null && mid > q.cap) {
        // 上限截断
        if (Array.isArray(score)) {
          const ratio = q.cap / mid
          score = [Math.floor(score[0] * ratio * 100) / 100, q.cap]
        } else score = q.cap
        return { score, capped: true, capValue: q.cap, note: `本项加分上限 ${q.cap} 分，已按上限计入` }
      }
      const note = Array.isArray(score)
        ? `建议分 ${scoreMid(score)} 分，区间 ${score[0]}–${score[1]}，最终由评议小组在区间内定夺`
        : undefined
      return { score, note }
    }
    case 'ext':
      return { score: a.value }
    case 'volunteer': {
      const rate = q.ratePerHour ?? 0.2
      let score: number
      let note: string | undefined
      if (q.hourConversion) {
        const inR = q.hourConversion['校内小时'] ?? 1
        const outR = q.hourConversion['院内小时'] ?? 1
        score = (a.hours * inR + a.hoursOut * outR) * rate
        note = `校内 ${a.hours}h×${inR} + 院内 ${a.hoursOut}h×${outR}，×${rate} 分/小时`
      } else {
        score = a.hours * rate
        note = `${a.hours} 小时 × ${rate} 分/小时`
      }
      score = Math.round(score * 100) / 100
      if (q.cap != null && score > q.cap) {
        return { score: q.cap, capped: true, capValue: q.cap, note: `${note}；上限 ${q.cap} 分，已按上限计入` }
      }
      return { score, note }
    }
    case 'comp': {
      const mids = a.entries.map((e) => scoreMid(e.score) ?? 0)
      return { score: mids.reduce((s, x) => s + x, 0) }
    }
    default:
      return { score: null }
  }
}

export function awardOptions(): string[] {
  return ['参加未获奖', ...AWARD_ORDER.filter((a) => a !== '参与奖'), '名次']
}
