import { motion } from 'framer-motion'
import { CheckCircle2, Hourglass } from 'lucide-react'
import SectionHeading from './SectionHeading'

interface RuleVersion {
  college: string
  pack: string
  sourceDoc: string
  applicable: string
  status: 'ready' | 'reviewing'
  extra?: string
}

const VERSIONS: RuleVersion[] = [
  {
    college: '保险学院',
    pack: '规则包 v0.1',
    sourceDoc: '保险学院本科生综合素质评价实施细则（2024 年修订）',
    applicable: '适用 2024–2025 学年',
    status: 'ready',
    extra: '含活动等级目录 v0.1',
  },
  {
    college: '金融学院',
    pack: '规则包 v0.1',
    sourceDoc: '金融学院本科生综合素质评价实施办法',
    applicable: '适用 2024–2025 学年',
    status: 'ready',
  },
  {
    college: '财政税务学院',
    pack: '规则包 v0.1',
    sourceDoc: '财政税务学院本科生综合素质评价实施细则',
    applicable: '适用 2024–2025 学年',
    status: 'ready',
  },
  {
    college: '国际经济与贸易学院',
    pack: '规则包 v0.1',
    sourceDoc: '国际经济与贸易学院本科生综合素质测评细则',
    applicable: '适用 2024–2025 学年',
    status: 'ready',
  },
  {
    college: '其他学院',
    pack: '排队中',
    sourceDoc: '待学院细则拆解与两轮校对后上线',
    applicable: '—',
    status: 'reviewing',
  },
]

/** S4 · 规则包版本与校对状态（RULE PACKS） */
export default function RuleVersions() {
  return (
    <motion.section
      id="rule-versions"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading overline="RULE PACKS" title="规则包版本与校对状态" />
      <p className="mt-4 max-w-[34em] text-body leading-relaxed text-ink-700">
        每个学院的细则被拆解成一份结构化「规则包」，经过两轮人工校对后才会上线。
        问卷依据规则包出题，导出清单逐条标注细则原文出处。
      </p>

      <div className="mt-8 overflow-x-auto rounded-[14px] border border-line bg-card shadow-card">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-paper-100">
              <th className="label-mono px-4 py-3 font-medium text-ink-500">学院</th>
              <th className="label-mono px-4 py-3 font-medium text-ink-500">规则包</th>
              <th className="label-mono px-4 py-3 font-medium text-ink-500">细则来源</th>
              <th className="label-mono px-4 py-3 font-medium text-ink-500">校对状态</th>
            </tr>
          </thead>
          <tbody>
            {VERSIONS.map((v) => (
              <tr key={v.college} className="border-b border-line last:border-0">
                <td className="px-4 py-3.5 text-body font-medium text-ink-900">{v.college}</td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-[13px] text-ink-700">{v.pack}</span>
                  <span className="block text-caption text-ink-500">{v.applicable}</span>
                </td>
                <td className="px-4 py-3.5 text-caption leading-relaxed text-ink-700">
                  {v.sourceDoc}
                  {v.extra && <span className="block text-ink-500">{v.extra}</span>}
                </td>
                <td className="px-4 py-3.5">
                  {v.status === 'ready' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      两轮校对完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-2.5 py-1 text-[12px] font-medium text-ink-500">
                      <Hourglass className="h-3.5 w-3.5" />
                      排队中
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-caption text-ink-500">
        规则包为文本格式并随工具一同发布，欢迎对照学院原文核验；发现出入请通过「关于我们」中的邮箱反馈。
      </p>
    </motion.section>
  )
}
