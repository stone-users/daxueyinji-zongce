import type { AnswerMap, AnswerValue, CatalogEntry, ModulePlan, Question, Score } from '@/engine/types'
import { scoreAnswer } from '@/engine/scoring'
import { mutexConflictNames } from '@/engine/session'
import ScoreChip from './ScoreChip'
import HintBar from './HintBar'
import RuleNote from './RuleNote'
import EvidenceUploader from './EvidenceUploader'
import CompSearch from './CompSearch'
import { AnchorRadio, BoolCards, ConfirmCard, ExtPort, VolunteerHours, YesNoCount } from './widgets'

/** 题卡通用容器：题号 + 实时分值 + 题干 + 控件 + 实时反馈 + 佐证 + 细则依据 */
export default function QuestionCard({
  q,
  seqLabel,
  answer,
  onAnswer,
  plans,
  answers,
  catalog,
  onEvidence,
}: {
  q: Question
  seqLabel: string
  answer: AnswerValue | undefined
  onAnswer: (a: AnswerValue) => void
  plans: ModulePlan[]
  answers: AnswerMap
  catalog: Array<CatalogEntry & { level: string }>
  onEvidence: (itemRef: string, has: boolean) => void
}) {
  const result: { score: Score | undefined; note?: string; capped?: boolean; capValue?: number } = answer
    ? scoreAnswer(q, answer)
    : { score: undefined }
  const conflicts = mutexConflictNames(plans, answers, q)

  return (
    <div className="rounded-[14px] border border-line bg-card p-5 shadow-card sm:p-7">
      {/* 1. 题号 + 实时分值 */}
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono text-ink-500">{seqLabel}</span>
        <ScoreChip score={result.score} />
      </div>

      {/* 2. 题干 */}
      <h2 className="mt-3 max-w-[34em] text-body-lg text-ink-900">{q.title}</h2>
      {q.desc && <p className="mt-2 text-caption text-ink-500">{q.desc}</p>}
      {q.routeTo && (
        <p className="mt-2 inline-block rounded-[6px] bg-paper-100 px-2 py-0.5 text-caption text-ink-500">
          ⤴ 此项将填入系统「{q.routeTo}」栏
        </p>
      )}
      {q.embeddedNote && <p className="mt-2 rounded-[8px] bg-paper-100 px-3 py-2 text-caption text-ink-500">{q.embeddedNote}</p>}

      {/* 3. 控件区 */}
      <div className="mt-5">
        {q.kind === 'confirm' && (
          <ConfirmCard
            q={q}
            confirmed={answer?.kind === 'confirm' ? answer.confirmed : false}
            onChange={(v) => onAnswer({ kind: 'confirm', confirmed: v })}
          />
        )}
        {q.kind === 'bool' && (
          <BoolCards
            value={answer?.kind === 'bool' ? answer.value : null}
            yes="是 / 有"
            no="否 / 没有"
            onChange={(v) => onAnswer({ kind: 'bool', value: v })}
          />
        )}
        {q.kind === 'count' && (
          <YesNoCount
            q={q}
            participated={answer?.kind === 'count' ? answer.participated : null}
            count={answer?.kind === 'count' ? answer.count : 0}
            counts={answer?.kind === 'count' ? answer.counts : undefined}
            capReached={result.capped === true}
            onChange={(v) => onAnswer({ kind: 'count', ...v })}
          />
        )}
        {q.kind === 'anchor' && (
          <AnchorRadio q={q} value={answer?.kind === 'choice' ? answer.label : null} onChange={(label) => onAnswer({ kind: 'choice', label })} />
        )}
        {q.kind === 'ext' && (
          <ExtPort q={q} value={answer?.kind === 'ext' ? answer.value : null} onChange={(v) => onAnswer({ kind: 'ext', value: v })} />
        )}
        {q.kind === 'volunteer' && (
          <VolunteerHours
            q={q}
            hours={answer?.kind === 'volunteer' ? answer.hours : 0}
            hoursOut={answer?.kind === 'volunteer' ? answer.hoursOut : 0}
            venue={answer?.kind === 'volunteer' ? answer.venue : '校内'}
            capped={result.capped === true}
            onChange={(v) => onAnswer({ kind: 'volunteer', ...v })}
          />
        )}
        {(q.kind === 'comp' || q.kind === 'project' || q.kind === 'pub') && (
          <CompSearch
            q={q}
            catalog={catalog}
            entries={answer?.kind === 'comp' ? answer.entries : []}
            onChange={(entries) => onAnswer({ kind: 'comp', entries })}
          />
        )}
      </div>

      {/* 4. 实时反馈区 */}
      <HintBar show={conflicts.length > 0}>
        {conflicts.map((n) => (
          <p key={n}>已选择【{n}】，此项与之不重复计分（取高不累加）。</p>
        ))}
      </HintBar>
      <HintBar show={result.capped === true}>
        本项加分上限 {result.capValue} 分，已按上限计入。
      </HintBar>
      {result.note && !result.capped && (
        <p className="mt-3 text-caption text-ink-500">{result.note}</p>
      )}

      {/* 5. 佐证上传 */}
      <EvidenceUploader itemRef={q.id} suggested={q.evidence} onChange={(has) => onEvidence(q.id, has)} />

      {/* 6. 细则依据 */}
      <RuleNote quote={q.sourceQuote} extra={[q.rule ? `口径：${q.rule}` : '', q.participationRule ? `参加口径：${q.participationRule}` : '', q.awardRule ? `获奖口径：${q.awardRule}` : ''].filter(Boolean)} />
    </div>
  )
}
