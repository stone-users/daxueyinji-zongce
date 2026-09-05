/**
 * 规则引擎类型定义
 * 原则：机制进代码、参数进配置。规则包 YAML 字段为松散结构（各院有差异），
 * 引擎侧用 Record<string, unknown> 承载原始条目，仅在生成题目时做结构化解释。
 */

export type Score = number | [number, number] | null

/** 规则包原始结构（顶层五键） */
export interface RulePack {
  meta: {
    university: string
    college: string
    version: string
    review_status: string
    source_doc: string
    extracted?: string
    reviewers?: string[]
    linked_configs?: string[]
    applicability_warning?: string
    eval_period?: unknown
  }
  global_rules?: Record<string, unknown>
  modules: PackModule[]
  total_formula?: Record<string, unknown>
  pending_review?: unknown[]
  review_resolution?: string[]
  engine_notes?: string[]
  [k: string]: unknown
}

export interface PackModule {
  id: string
  name: string
  max_score?: number
  formula?: string
  note?: string
  sections?: PackSection[]
  [k: string]: unknown
}

export interface PackSection {
  id?: string
  name?: string
  type?: string
  items?: PackItem[]
  sections?: PackSection[]
  matrix?: Record<string, unknown>
  tiers?: Record<string, unknown>
  uniform_all?: number
  cap?: number
  system_node?: string
  zbdm?: string
  [k: string]: unknown
}

export interface PackItem {
  name: string
  type?: string
  score?: unknown
  [k: string]: unknown
}

/** 活动等级目录（linked_config 子配置） */
export interface Catalog {
  meta?: Record<string, unknown>
  principles?: Record<string, unknown>
  catalog?: Record<string, CatalogEntry[]>
  [k: string]: unknown
}

export interface CatalogEntry {
  name: string
  type?: string
  organizer?: string
  note?: string
  award_map?: Record<string, string>
}

// ---------------------------------------------------------------------------
// 题目模型（规则包 → 引擎生成的问卷实例）
// ---------------------------------------------------------------------------

export type QuestionKind =
  | 'confirm' // confirm-card：全员基本分 / uniform_all 一键确认
  | 'bool' // 是/否（无次数的 base/bonus）
  | 'count' // yes-no-count：是否参加 + 次数 × unit
  | 'anchor' // anchor-radio：档位单选（tiered / anchor_tiers / 职务 tiers / score_by_level）
  | 'comp' // comp-search 三段式：级别 matrix（竞赛类）
  | 'project' // 科研项目：阶段 matrix（参加/立项/结项）
  | 'pub' // 发表文章/作品：刊物类别 × 作者位次 matrix
  | 'ext' // ext-port：外部成绩输入
  | 'volunteer' // 志愿时长：小时数 + 校内/院内折算

export interface AnchorOption {
  label: string
  score: Score // 固定分或区间
  desc?: string // 行为锚点描述
}

/** 多次数题的单个计数行（multi_count 编译结果）：如 校级及以上 每次 +5 */
export interface CounterSpec {
  key: string // 稳定键（取 label）
  label: string
  unitScore: Score // 每次分值
}

export interface Question {
  id: string // itemRef：模块/章节/条目 路径，全链路可追溯
  module: string
  moduleName: string
  sectionName: string
  shortName: string // 规则包条目原名（导出清单用）
  kind: QuestionKind
  title: string
  desc?: string
  scoreText?: string // 控件区单位标注，如「每次 +1 分」
  // 分值参数
  baseScore?: Score
  counters?: CounterSpec[] // multi_count：一题多计数行（kind='count'），得分 = Σ counts[key] × unitScore
  options?: AnchorOption[]
  unit?: string
  cap?: number
  mutexWith?: string[] // 互斥条目的 question id
  mutexNames?: string[] // 互斥条目原名（提示文案用）
  // matrix 参数
  matrix?: Record<string, unknown>
  matrixLevels?: string[]
  phaseNames?: string[] // project：参加/立项/结项
  pubRows?: string[] // pub：刊物类别
  roleMultiplier?: Record<string, number>
  teamRuleText?: string
  participationRule?: string
  awardRule?: string
  awardRankMap?: Record<string, string>
  whitelistRequired?: boolean
  catalogAvailable?: boolean
  specialItems?: PackItem[]
  extraItems?: PackItem[]
  levelDetermination?: string
  hardConstraints?: string[]
  // 修饰参数
  multiParty?: { weights: Record<string, number>; note?: string }
  embeddedNote?: string
  uniformAll?: boolean
  extReadonly?: boolean // 评议方填写项（输入禁用）
  extMax?: number
  ratePerHour?: number
  hourConversion?: Record<string, number>
  routeTo?: string | null
  systemNode?: string | null
  evidence?: string[]
  sourceQuote?: string
  rule?: string
  skippable: boolean
}

export interface ModulePlan {
  id: string
  name: string
  maxScore?: number
  formula?: string
  note?: string
  questions: Question[]
  penalties: PackItem[] // 收尾减分自查用
  penaltyNote?: string
  penaltySystemNode?: string | null
}

// ---------------------------------------------------------------------------
// 作答模型
// ---------------------------------------------------------------------------

export interface CompEntry {
  name: string
  level: string
  levelSource: 'catalog' | 'manual' | 'modified'
  organizer?: string
  award: string // 参加未获奖 | 一等奖 | 二等奖 | 三等奖 | 优秀奖 | 名次 | ...
  rank?: number // 名次输入
  role: '负责人' | '成员'
  phase?: string // project 用
  pubType?: string // pub 用
  authorship?: string // pub 用：独立/一作/二作/三作及以后
  count?: number
  score: Score
  scoreNote?: string
}

export type AnswerValue =
  | { kind: 'confirm'; confirmed: boolean }
  | { kind: 'bool'; value: boolean }
  | { kind: 'count'; participated: boolean; count: number; counts?: Record<string, number> } // counts 仅 multi_count 题使用；单次数题不变
  | { kind: 'choice'; label: string | null }
  | { kind: 'ext'; value: number | null }
  | { kind: 'volunteer'; hours: number; hoursOut: number; venue: '校内' | '院内' }
  | { kind: 'comp'; entries: CompEntry[] }

export type AnswerMap = Record<string, AnswerValue>

// ---------------------------------------------------------------------------
// 会话契约（zongce.session.v1，与导出页共享）
// ---------------------------------------------------------------------------

export interface SessionItem {
  itemRef: string
  name: string
  module: string
  score: Score
  systemNode: string | null
  routeTo: string | null
  note: string | null
  evidence: { suggested: string | null; uploaded: boolean }
  status: 'ok' | 'pending_review' | 'needs_evidence' | 'external'
  sourceQuote: string
}

export interface Session {
  version: 1
  college: string
  packVersion: string
  packSourceDoc: string
  grade: string
  evalYear: string
  savedAt: string
  moduleStatus: Record<string, 'done' | 'partial' | 'todo'>
  items: SessionItem[]
  totals: { perModule: Record<string, number | string>; note: string }
}

/** 向导内部进度（不进 session 契约，单独键存储） */
export interface WizardProgress {
  college: string
  grade: string
  evalYear: string
  stepIndex: number
  answers: AnswerMap
  penaltyRead: boolean
  savedAt: string
}

export const GRADES = ['大一', '大二', '大三', '大四'] as const
export const MODULE_ORDER = ['deyu', 'zhiyu', 'tiyu', 'xueshu', 'zuzhi', 'laodong', 'meiyu'] as const
