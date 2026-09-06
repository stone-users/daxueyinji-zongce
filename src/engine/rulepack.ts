/**
 * 规则包加载 + 规则包 → 题目实例生成
 * 机制进代码、参数进配置：此处只做"schema → 题型"的通用映射，不含任何学院特例。
 */
import { load as loadYaml } from 'js-yaml'
import type {
  AnchorOption,
  AwardSpec,
  Catalog,
  CatalogEntry,
  ModulePlan,
  PackItem,
  PackModule,
  PackSection,
  Question,
  RulePack,
  Score,
} from './types'

export interface CollegeInfo {
  name: string
  file: string
  catalogFile?: string
}

/** 已支持学院 → 规则包文件（入口三问的数据源，全校统一，唯一允许硬编码的清单） */
export const COLLEGES: CollegeInfo[] = [
  { name: '保险学院', file: '保险学院-规则包-v0.1.yaml', catalogFile: '保险学院-活动等级目录-v0.1.yaml' },
  { name: '金融学院', file: '金融学院-规则包-v0.1.yaml' },
  { name: '财政税务学院', file: '财政税务学院-规则包-v0.1.yaml' },
  { name: '国际经济与贸易学院', file: '国际经济与贸易学院-规则包-v0.1.yaml' },
]

const packCache = new Map<string, RulePack>()
const catalogCache = new Map<string, Catalog>()

async function fetchYaml(path: string): Promise<unknown> {
  const res = await fetch(encodeURI(path))
  if (!res.ok) throw new Error(`规则包加载失败：${path}（HTTP ${res.status}）`)
  return loadYaml(await res.text())
}

export async function loadPack(college: string): Promise<RulePack> {
  const cached = packCache.get(college)
  if (cached) return cached
  const info = COLLEGES.find((c) => c.name === college)
  if (!info) throw new Error(`暂未支持的学院：${college}`)
  const pack = (await fetchYaml(`/rulepacks/${info.file}`)) as RulePack
  packCache.set(college, pack)
  return pack
}

/** 加载 linked_configs 中的活动等级目录（没有则为 null，comp-search 走兜底分支） */
export async function loadCatalog(college: string): Promise<Catalog | null> {
  const info = COLLEGES.find((c) => c.name === college)
  if (!info?.catalogFile) return null
  const cached = catalogCache.get(college)
  if (cached) return cached
  try {
    const cat = (await fetchYaml(`/rulepacks/${info.catalogFile}`)) as Catalog
    catalogCache.set(college, cat)
    return cat
  } catch {
    return null
  }
}

/** 目录扁平化为可搜索条目 */
export function flattenCatalog(cat: Catalog | null): Array<CatalogEntry & { level: string }> {
  if (!cat?.catalog) return []
  const out: Array<CatalogEntry & { level: string }> = []
  for (const [level, entries] of Object.entries(cat.catalog)) {
    if (!Array.isArray(entries)) continue
    for (const e of entries) out.push({ ...e, level })
  }
  return out
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

const CN_NUM: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6 }

export function isRange(v: unknown): v is [number, number] {
  return Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number'
}

/** 把 YAML 里的分数字段统一为 Score：数字 / [lo,hi] / "12-15" / null */
export function toScore(v: unknown): Score {
  if (typeof v === 'number') return v
  if (isRange(v)) return [v[0], v[1]]
  if (typeof v === 'string') {
    const m = v.match(/^(-?\d+(?:\.\d+)?)\s*[-–~]\s*(-?\d+(?:\.\d+)?)$/)
    if (m) return [Number(m[1]), Number(m[2])]
    const n = Number(v)
    if (!Number.isNaN(n) && v.trim() !== '') return n
  }
  return null
}

export function scoreMid(s: Score): number | null {
  if (s == null) return null
  return Array.isArray(s) ? (s[0] + s[1]) / 2 : s
}

export function scoreTextOf(s: Score): string {
  if (s == null) return '待评议'
  if (Array.isArray(s)) return `${s[0]}–${s[1]} 分`
  return `+${s} 分`
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

/** 解析 anchor 字段：'优=描述；良=描述' → {优: 描述, ...} */
function parseAnchor(anchor: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (typeof anchor !== 'string') return out
  for (const part of anchor.split(/[；;]/)) {
    const idx = part.indexOf('=') >= 0 ? part.indexOf('=') : part.indexOf('：')
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
  }
  return out
}

// ---------------------------------------------------------------------------
// 题目生成
// ---------------------------------------------------------------------------

interface Ctx {
  pack: RulePack
  grade: string
  catalogAvailable: boolean
  /** depends_on 待解析队列（编译完成后按模块把条目 name 解析成 question id） */
  pendingDepends: Array<{ q: Question; name: string; when: 'yes' | 'no' }>
  /** 已挂依赖的题（item 级优先于 section 级传染） */
  hasDepends: Set<string>
}

interface RawDepends {
  name: string
  when: 'yes' | 'no'
}

/** 解析 depends_on: {item: 前置条目name, when: yes|no}；缺 item 视为无效 */
function parseDepends(v: unknown): RawDepends | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  const name = str(o.item)
  if (!name) return null
  return { name, when: str(o.when) === 'no' ? 'no' : 'yes' }
}

/** award 题某条记录（身份/级别）对应的标准分值（固定分或区间），用于参考分展示与导出说明 */
export function awardRefScore(q: Question, e: { role?: string; level: string }): Score {
  const spec = q.award
  if (!spec) return null
  if (spec.roles) {
    const table = spec.scoreOf as Record<string, Record<string, Score>>
    return table[e.role ?? '']?.[e.level] ?? null
  }
  return (spec.scoreOf as Record<string, Score>)[e.level] ?? null
}

let qSeq = 0
function qid(moduleId: string, sectionId: string, name: string): string {
  qSeq += 1
  return `${moduleId}/${sectionId}/${name}#${qSeq}`
}

function baseQ(
  ctx: Ctx,
  mod: PackModule,
  sec: PackSection,
  kind: Question['kind'],
  title: string,
  itemName: string,
): Question {
  return {
    id: qid(mod.id, sec.id ?? sec.name ?? 'sec', itemName),
    module: mod.id,
    moduleName: mod.name,
    sectionName: sec.name ?? '',
    shortName: itemName,
    kind,
    title,
    systemNode: (sec.system_node as string) ?? null,
    skippable: kind !== 'confirm',
    catalogAvailable: ctx.catalogAvailable,
  }
}

/** tiers map → anchor 选项（值可为数字 / [lo,hi] / "12-15"） */
function tierOptions(tiers: Record<string, unknown>, anchor?: unknown): AnchorOption[] {
  const descs = parseAnchor(anchor)
  return Object.entries(tiers).map(([label, v]) => ({
    label,
    score: toScore(v),
    desc: descs[label],
  }))
}

/** 按年级解析 tiers_by_grade：键可为"大三"或"大一大二"等组合写法 */
function pickGradeEntry(byGrade: Record<string, unknown>, grade: string): unknown {
  for (const [k, v] of Object.entries(byGrade)) {
    if (k.includes(grade)) return v
  }
  return undefined
}

/** "每多一类 +10 上限 60" 形态 → 预计算的门类数档位 */
function countTierOptions(entry: Record<string, unknown>): AnchorOption[] | null {
  const keys = Object.keys(entry)
  const baseKey = keys.find((k) => k.startsWith('基础'))
  const stepKey = keys.find((k) => k.includes('每多一类'))
  if (!baseKey || !stepKey) return null
  const base = toScore(entry[baseKey])
  const stepM = String(entry[stepKey]).match(/\+?\s*(\d+(?:\.\d+)?)/)
  const cap = toScore(entry['上限'])
  if (typeof base !== 'number' || !stepM) return null
  const step = Number(stepM[1])
  const capN = typeof cap === 'number' ? cap : base + step * 3
  const thM = baseKey.match(/([一二两三四五六])类/)
  const threshold = thM ? (CN_NUM[thM[1]] ?? 2) : 2
  const opts: AnchorOption[] = [{ label: `少于 ${threshold} 个组类`, score: 0 }]
  for (let n = threshold; base + (n - threshold) * step < capN; n++) {
    opts.push({ label: `${n} 个组类`, score: base + (n - threshold) * step })
  }
  opts.push({ label: `${Math.round((capN - base) / step) + threshold} 个组类及以上`, score: capN })
  return opts
}

/** item → 单个题目（返回 null 表示不生成题目：penalty / derived / 年级不适用）；附带解析 item 级 depends_on */
function itemToQuestion(ctx: Ctx, mod: PackModule, sec: PackSection, item: PackItem): Question | null {
  const q = itemToQuestionRaw(ctx, mod, sec, item)
  if (q) {
    const dep = parseDepends(item.depends_on)
    if (dep && !ctx.hasDepends.has(q.id)) {
      ctx.pendingDepends.push({ q, name: dep.name, when: dep.when })
      ctx.hasDepends.add(q.id)
    }
  }
  return q
}

function itemToQuestionRaw(ctx: Ctx, mod: PackModule, sec: PackSection, item: PackItem): Question | null {
  const type = str(item.type) ?? 'bonus'
  if (type === 'penalty' || type === 'derived') return null

  const name = item.name
  const hint = str(item.question_hint)
  const note = str(item.note)
  const requirement = str(item.requirement)
  const desc = [requirement, note].filter(Boolean).join('；') || undefined
  const common: Partial<Question> = {
    desc,
    evidence: strArr(item.evidence),
    sourceQuote: str(item.source_quote) ?? str(sec.source_quote),
    routeTo: str(item.route_to) ?? null,
    rule: str(item.rule),
    mutexNames: strArr(item.mutex_with),
  }

  // 年级过滤：如"大三同学此项满分"
  const special = str(item.special)
  if (special) {
    const m = special.match(/(大[一二三四])同学此项满分/)
    if (m) {
      if (ctx.grade === m[1]) {
        const q = baseQ(ctx, mod, sec, 'confirm', `${name}（${m[1]}全员满分）`, name)
        Object.assign(q, common, {
          baseScore: toScore(item.score),
          desc: `细则规定：${special}。一键确认即可。`,
        })
        return q
      }
    }
  }

  if (type === 'base') {
    const isDefault = item.default === true
    const q = baseQ(
      ctx,
      mod,
      sec,
      isDefault ? 'confirm' : 'bool',
      isDefault ? `${name}：全员基本分 ${toScore(item.score) ?? ''} 分` : hint ?? `本学年你是否满足「${name}」？`,
      name,
    )
    Object.assign(q, common, { baseScore: toScore(item.score), uniformAll: item.uniform_all === true })
    return q
  }

  if (type === 'external_input') {
    const q = baseQ(ctx, mod, sec, 'ext', hint ?? `请填写「${name}」成绩/分数`, name)
    Object.assign(q, common, {
      extMax: typeof sec.max_score === 'number' ? sec.max_score : typeof mod.max_score === 'number' ? mod.max_score : 100,
      desc: [str(item.formula) ? `计算口径：${str(item.formula)}` : null, desc].filter(Boolean).join('；') || undefined,
    })
    return q
  }

  if (type === 'tiered' || item.tiers || item.tiers_by_grade) {
    // 年级分档
    const byGrade = item.tiers_by_grade as Record<string, unknown> | undefined
    if (byGrade && item.grade_scope) {
      const entry = pickGradeEntry(byGrade, ctx.grade)
      if (entry == null) return null // 本年级不适用
      if (typeof entry === 'string' && !/按上表|同上/.test(entry)) {
        // 如"大三：不开设体育课，由辅导员建议统一加分（建议15分）"
        const sug = entry.match(/建议(\d+(?:\.\d+)?)分/)
        const q = baseQ(ctx, mod, sec, 'confirm', hint ?? name, name)
        Object.assign(q, common, {
          baseScore: sug ? Number(sug[1]) : null,
          desc: `细则规定（${ctx.grade}）：${entry}`,
        })
        return q
      }
      if (typeof entry === 'string') {
        // "大一大二：按上表……" → 回退到 item.tiers
        const q = baseQ(ctx, mod, sec, 'anchor', hint ?? `${name}：选择最符合你情况的档位`, name)
        Object.assign(q, common, {
          options: tierOptions((item.tiers as Record<string, unknown>) ?? {}, item.anchor),
          desc: [desc, `（${ctx.grade}）${entry}`].filter(Boolean).join('；') || undefined,
        })
        return q
      }
      const entryObj = entry as Record<string, unknown>
      if (entryObj['统一'] != null) {
        const q = baseQ(ctx, mod, sec, 'confirm', `${name}（${ctx.grade}统一分值）`, name)
        Object.assign(q, common, { baseScore: toScore(entryObj['统一']), uniformAll: true })
        return q
      }
      const counted = countTierOptions(entryObj)
      if (counted) {
        const q = baseQ(ctx, mod, sec, 'anchor', hint ?? `${name}：选择最符合你情况的档位`, name)
        Object.assign(q, common, { options: counted, desc: [desc, str(item.special)].filter(Boolean).join('；') || undefined })
        return q
      }
      const q = baseQ(ctx, mod, sec, 'anchor', hint ?? `${name}：选择最符合你情况的档位`, name)
      Object.assign(q, common, { options: tierOptions(entryObj, item.anchor) })
      return q
    }
    const q = baseQ(ctx, mod, sec, 'anchor', hint ?? `${name}：选择最符合你情况的档位`, name)
    Object.assign(q, common, {
      options: tierOptions((item.tiers as Record<string, unknown>) ?? {}, item.anchor),
      desc: [desc, str(item.embedded_adjust) && typeof item.embedded_adjust === 'string' ? `内嵌加减：${str(item.embedded_adjust)}` : null]
        .filter(Boolean)
        .join('；') || undefined,
    })
    return q
  }

  // 志愿服务时长
  if (str(item.rate)?.includes('小时')) {
    const rateM = String(item.rate).match(/(\d+(?:\.\d+)?)\s*分\s*\/\s*小时/)
    const q = baseQ(ctx, mod, sec, 'volunteer', hint ?? `本学年你的「${name}」是多少小时？`, name)
    Object.assign(q, common, {
      ratePerHour: rateM ? Number(rateM[1]) : 0.2,
      cap: typeof item.cap === 'number' ? item.cap : undefined,
      hourConversion: (item.hour_conversion as Record<string, number>) ?? undefined,
    })
    return q
  }

  // 获奖记录卡（widget: award_list）：多条添加、级联选择身份/级别、区间自填、sum/max 聚合
  if (str(item.widget) === 'award_list') {
    const src = (item.score_by_level ?? item.score_range_by_level ?? item.matrix) as Record<string, unknown> | undefined
    if (src && Object.keys(src).length > 0) {
      const keys = Object.keys(src)
      // 顶层值全部为对象 → 顶层键是身份维度（负责人/成员）
      const roleKeys = keys.filter((k) => typeof src[k] === 'object' && src[k] !== null && !Array.isArray(src[k]))
      const hasRoles = roleKeys.length > 0 && roleKeys.length === keys.length
      const aggregate: AwardSpec['aggregate'] = str(item.aggregate) === 'sum' ? 'sum' : 'max'
      let award: AwardSpec
      if (hasRoles) {
        const levels = Object.keys(src[roleKeys[0]] as Record<string, unknown>)
        const scoreOf: Record<string, Record<string, Score>> = {}
        for (const r of roleKeys) {
          scoreOf[r] = {}
          for (const [lv, v] of Object.entries(src[r] as Record<string, unknown>)) scoreOf[r][lv] = toScore(v)
        }
        award = { roles: roleKeys, levels, scoreOf, aggregate }
      } else {
        const scoreOf: Record<string, Score> = {}
        for (const [k, v] of Object.entries(src)) scoreOf[k] = toScore(v)
        award = { levels: keys, scoreOf, aggregate }
      }
      const q = baseQ(ctx, mod, sec, 'award', hint ?? `本学年你获得过「${name}」吗？有的话逐条添加`, name)
      Object.assign(q, common, {
        award,
        cap: typeof item.cap === 'number' ? item.cap : undefined,
        desc: [desc, str(item.rule) ? `口径：${str(item.rule)}` : null].filter(Boolean).join('；') || undefined,
      })
      return q
    }
    console.warn(`[rulepack] award_list 缺少分值结构（score_by_level / score_range_by_level / matrix）：${name}，已按普通加分题处理`)
  }

  // 级别分（score_by_level / score_range_by_level / item 内 matrix）
  const sbl = (item.score_by_level ?? item.score_range_by_level) as Record<string, unknown> | undefined
  const itemMatrix = item.matrix as Record<string, unknown> | undefined
  if (sbl || itemMatrix) {
    const src = (sbl ?? itemMatrix)!
    const options: AnchorOption[] = []
    const flatten = (prefix: string, obj: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(prefix ? `${prefix} · ${k}` : k, v as Record<string, unknown>)
        else options.push({ label: prefix ? `${prefix} · ${k}` : k, score: toScore(v) })
      }
    }
    flatten('', src)
    const q = baseQ(ctx, mod, sec, 'anchor', hint ?? `${name}：选择你获得的级别/档次`, name)
    Object.assign(q, common, { options, desc: [desc, str(item.rule) ? `口径：${str(item.rule)}` : null].filter(Boolean).join('；') || undefined })
    return q
  }

  // 多次数型加分（multi_count：同一荣誉分级别且可多次，如通报表扬 校级/院级 各记次数）
  const mc = item.multi_count as Array<Record<string, unknown>> | undefined
  if (Array.isArray(mc) && mc.length > 0) {
    const counters = mc.map((c, i) => {
      const label = str(c.label) ?? `第${i + 1}类`
      return { key: label, label, unitScore: toScore(c.score) }
    })
    const q = baseQ(ctx, mod, sec, 'count', hint ?? `本学年你是否「${name}」？各级别分别有几次？`, name)
    Object.assign(q, common, {
      counters,
      cap: typeof item.cap === 'number' ? item.cap : undefined,
      scoreText: counters
        .map((c) => `${c.label} 每次 ${Array.isArray(c.unitScore) ? `+${c.unitScore[0]}–${c.unitScore[1]}` : `+${c.unitScore ?? 0}`} 分`)
        .join('；'),
    })
    return q
  }

  // 次数型加分
  const unit = str(item.unit)
  const score = toScore(item.score)
  if (unit?.includes('次') || unit?.includes('项') || unit?.includes('篇') || hint?.includes('几次')) {
    const q = baseQ(ctx, mod, sec, 'count', hint ?? `本学年你是否有「${name}」的经历？有几次？`, name)
    Object.assign(q, common, {
      baseScore: score,
      unit,
      cap: typeof item.cap === 'number' ? item.cap : undefined,
      scoreText: score != null ? `每${(unit ?? '次').replace(/^分\//, '')} ${Array.isArray(score) ? `+${score[0]}–${score[1]}` : `+${score}`} 分` : undefined,
    })
    return q
  }

  // 普通加分/其它 → 是否题
  const q = baseQ(ctx, mod, sec, 'bool', hint ?? `本学年你是否有「${name}」？`, name)
  Object.assign(q, common, { baseScore: score })
  return q
}

/** matrix 章节 → comp / project / pub 题目 + special_items / extra 附加题 */
function matrixToQuestions(ctx: Ctx, mod: PackModule, sec: PackSection): Question[] {
  const out: Question[] = []
  const matrix = sec.matrix as Record<string, unknown>
  const keys = Object.keys(matrix)
  const LEVELS = ['国家级', '省部级', '市地区级', '校级', '院级']
  const isLevelFirst = keys.some((k) => LEVELS.includes(k))
  const isPhaseFirst = !isLevelFirst && keys.some((k) => ['参加', '立项', '结项'].includes(k))

  const common: Partial<Question> = {
    matrix,
    participationRule: str(sec.participation_rule),
    awardRule: str(sec.award_rule),
    teamRuleText: str(typeof sec.team_rule === 'string' ? sec.team_rule : (sec.team_rule as Record<string, unknown>)?.rule),
    roleMultiplier: sec.role_multiplier as Record<string, number> | undefined,
    awardRankMap: sec.award_rank_map as Record<string, string> | undefined,
    whitelistRequired: sec.whitelist_required === true,
    levelDetermination: str(sec.level_determination),
    sourceQuote: str(sec.source_quote),
    routeTo: str(sec.route_to) ?? null,
    rule: str(sec.rule),
    evidence: strArr(sec.evidence),
    cap: typeof sec.cap === 'number' ? sec.cap : undefined,
    desc: [str(sec.classification_note), str(sec.cap_note)].filter(Boolean).join('；') || undefined,
  }

  if (isLevelFirst) {
    const q = baseQ(ctx, mod, sec, 'comp', `本学年你参加过「${sec.name}」相关的比赛/活动吗？`, sec.name ?? 'matrix')
    Object.assign(q, common, { matrixLevels: keys.filter((k) => LEVELS.includes(k)) })
    out.push(q)
  } else if (isPhaseFirst) {
    const q = baseQ(ctx, mod, sec, 'project', `本学年你参与过「${sec.name}」吗？（大创、课题等）`, sec.name ?? 'matrix')
    Object.assign(q, common, { phaseNames: keys, matrixLevels: LEVELS })
    out.push(q)
  } else {
    // 刊物类别 × 作者位次
    const q = baseQ(ctx, mod, sec, 'pub', `本学年你发表过「${sec.name}」吗？`, sec.name ?? 'matrix')
    Object.assign(q, common, {
      pubRows: keys,
      hardConstraints: strArr(sec.hard_constraints),
    })
    out.push(q)
  }

  // 附加特殊条目（中财吉尼斯、运动会方阵、文章入选会议等）
  const extras = [...strArr(undefined), ...((sec.special_items as PackItem[]) ?? []), ...((sec.extra as PackItem[]) ?? [])]
  for (const it of extras) {
    if (!it || typeof it !== 'object' || !it.name) continue
    const q = itemToQuestion(ctx, mod, sec, { type: 'bonus', ...it })
    if (q) out.push(q)
  }
  return out
}

function isPenaltyItem(i: PackItem): boolean {
  if (str(i.type) === 'penalty') return true
  const sev = str(i.severity)
  if (sev === 'veto' || sev === 'zero_item') return true
  if (typeof i.score === 'number' && (i.score as number) < 0) return true
  if (Array.isArray(i.score) && typeof i.score[1] === 'number' && (i.score[1] as number) < 0) return true
  const tiers = i.tiers as Record<string, unknown> | undefined
  if (tiers && Object.keys(tiers).length > 0) {
    const vals = Object.values(tiers).map(toScore)
    if (vals.every((v) => typeof v === 'number' && v < 0)) return true
  }
  if (/否决/.test(i.name)) return true
  return false
}

function isPenaltySection(sec: PackSection): boolean {
  const idName = `${sec.id ?? ''} ${sec.name ?? ''}`
  if (/jianfen|chufa|减分|处罚/.test(idName)) return true
  const items = sec.items ?? []
  return items.length > 0 && items.every(isPenaltyItem)
}

/** 递归展开章节生成题目；外层包装负责 section 级 depends_on 传染 */
function walkSection(ctx: Ctx, mod: PackModule, sec: PackSection, plan: ModulePlan, inheritedDepends: RawDepends[] = []): void {
  const secDep = parseDepends(sec.depends_on)
  const chain = secDep ? [...inheritedDepends, secDep] : inheritedDepends
  const qStart = plan.questions.length
  walkSectionInner(ctx, mod, sec, plan, chain)
  if (chain.length) {
    const innermost = chain[chain.length - 1]
    for (let i = qStart; i < plan.questions.length; i++) {
      const q = plan.questions[i]
      if (!ctx.hasDepends.has(q.id)) {
        ctx.pendingDepends.push({ q, name: innermost.name, when: innermost.when })
        ctx.hasDepends.add(q.id)
      }
    }
  }
}

function walkSectionInner(ctx: Ctx, mod: PackModule, sec: PackSection, plan: ModulePlan, chain: RawDepends[]): void {
  // 嵌套 sections 先展开（如智育人文素质 → 通识/读书）
  if (sec.sections) for (const sub of sec.sections) walkSection(ctx, mod, sub, plan, chain)

  // 减分章节 → 收尾自查
  if (isPenaltySection(sec)) {
    plan.penalties.push(...(sec.items ?? []))
    if (!plan.penaltyNote) plan.penaltyNote = str(sec.note)
    if (!plan.penaltySystemNode) plan.penaltySystemNode = (sec.system_node as string) ?? null
    return
  }

  // 全员统一分板块
  if (typeof sec.uniform_all === 'number') {
    const q = baseQ(ctx, mod, sec, 'confirm', `${sec.name}：全班/全年级统一 ${sec.uniform_all} 分`, sec.name ?? 'uniform')
    Object.assign(q, {
      baseScore: sec.uniform_all,
      uniformAll: true,
      systemNode: (sec.system_node as string) ?? null,
      sourceQuote: str(sec.source_quote),
      desc: '细则规定此项为全员统一分值，确认即可。',
    })
    plan.questions.push(q)
  }

  // 章节级 tiers（职务档位等）→ 一题，跳过内部 base 子项避免重复计分
  if (sec.tiers && !sec.items?.some((i) => str(i.type) === 'tiered')) {
    const q = baseQ(ctx, mod, sec, 'anchor', `「${sec.name}」：选择最符合你情况的档位`, sec.name ?? 'tiers')
    Object.assign(q, {
      options: tierOptions(sec.tiers as Record<string, unknown>),
      desc: [str(sec.note), str(sec.exclusions) ? `不计入：${strArr(sec.exclusions).join('、')}` : null, str(sec.rule) ? `口径：${str(sec.rule)}` : null]
        .filter(Boolean)
        .join('；') || undefined,
      sourceQuote: str(sec.source_quote),
      systemNode: (sec.system_node as string) ?? null,
    })
    plan.questions.push(q)
    return
  }

  // 章节级 external_input（业绩能力分等评议方填写项）
  if (str(sec.type) === 'external_input') {
    const q = baseQ(ctx, mod, sec, 'ext', `「${sec.name}」`, sec.name ?? 'ext')
    Object.assign(q, {
      extReadonly: true,
      extMax: typeof sec.max_score === 'number' ? sec.max_score : 70,
      desc: [str(sec.note), str(sec.conversion) ? `折算口径：${str(sec.conversion)}` : null].filter(Boolean).join('；') || undefined,
      systemNode: (sec.system_node as string) ?? null,
      sourceQuote: str(sec.source_quote),
    })
    plan.questions.push(q)
    return
  }

  if (sec.matrix) {
    plan.questions.push(...matrixToQuestions(ctx, mod, sec))
    return
  }

  // 章节类型标记：multi_party（金融德育基本分）
  const multiParty =
    str(sec.type) === 'multi_party'
      ? { weights: (sec.weights as Record<string, number>) ?? {}, note: str(sec.note) }
      : undefined

  for (const item of sec.items ?? []) {
    if (str(item.type) === 'penalty') {
      plan.penalties.push(item)
      continue
    }
    const q = itemToQuestion(ctx, mod, sec, item)
    if (!q) continue
    // embedded_adjust 结构化（财税）：按校对结论"仅提示不采集"，展示为说明
    if (item.embedded_adjust && typeof item.embedded_adjust === 'object') {
      q.embeddedNote = '本项含内嵌基础分+加减（如入党加分/违纪扣分），由班干部与辅导员资料核定，问卷仅提示不采集。'
    }
    if (multiParty) q.multiParty = multiParty
    if (q.desc || q.embeddedNote || q.multiParty || item.anchor) {
      // anchor 描述已在 options 内
    }
    plan.questions.push(q)
  }
}

/** 规则包 + 年级 → 七模块作答计划 */
export function buildPlan(pack: RulePack, grade: string, catalogAvailable: boolean): ModulePlan[] {
  const ctx: Ctx = { pack, grade, catalogAvailable, pendingDepends: [], hasDepends: new Set() }
  const plans: ModulePlan[] = []
  for (const mod of pack.modules ?? []) {
    const plan: ModulePlan = {
      id: mod.id,
      name: mod.name,
      maxScore: mod.max_score,
      formula: str(mod.formula),
      note: str(mod.note),
      questions: [],
      penalties: [],
    }
    for (const sec of mod.sections ?? []) walkSection(ctx, mod, sec, plan)
    plans.push(plan)
  }
  // 解析 depends_on 条目 name → 同模块前置题 id（解析不到仅告警，不阻断编译）
  for (const plan of plans) {
    for (const pd of ctx.pendingDepends.filter((x) => x.q.module === plan.id)) {
      const ref = plan.questions.find((o) => o.id !== pd.q.id && (o.id.includes(`/${pd.name}#`) || o.title.includes(pd.name)))
      if (ref) pd.q.dependsOn = { ref: ref.id, when: pd.when }
      else console.warn(`[rulepack] depends_on 未解析：「${pd.q.shortName}」依赖的「${pd.name}」在模块 ${plan.id} 内未找到，已忽略该条件`)
    }
  }
  // 解析 mutex_with 名称 → 题目 id（模块内匹配）
  for (const plan of plans) {
    for (const q of plan.questions) {
      if (!q.mutexNames?.length) continue
      q.mutexWith = q.mutexNames
        .map((n) => plan.questions.find((o) => o.id !== q.id && (o.title.includes(n) || o.id.includes(`/${n}#`)))?.id)
        .filter((x): x is string => Boolean(x))
    }
  }
  return plans
}

/** 规则包待确认事项：pending_review 逐条 + review_resolution 中仍为 ⏳ 的未闭环项 */
export function pendingReviewNotes(pack: RulePack): string[] {
  const out: string[] = []
  const pr = pack.pending_review
  if (Array.isArray(pr)) {
    for (const x of pr) {
      if (typeof x === 'string') out.push(x)
      else if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>
        const line = [o.id, o.item ?? o.desc ?? o.note ?? o.text].filter(Boolean).join('：')
        if (line) out.push(line)
      }
    }
  }
  // 已校对的包：review_resolution 里 ⏳ 保留项对学生仍有提示价值（如 zbdm 待复核、外部文档待获取）
  if (Array.isArray(pack.review_resolution)) {
    for (const x of pack.review_resolution) {
      if (typeof x === 'string' && x.trim().startsWith('⏳')) out.push(x.trim())
    }
  }
  return out
}
