import { motion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'
import SectionHeading from '@/components/help/SectionHeading'

const RULE_PACKS = [
  {
    college: '保险学院',
    version: 'v0.2',
    note: '2024年3月细则',
    year: '适用 2024–2025 学年',
    updated: '2026-09-04 更新',
  },
  {
    college: '金融学院',
    version: 'v0.2',
    note: '含竞赛白名单口径',
    year: '适用 2024–2025 学年',
    updated: '2026-09-04 更新',
  },
  {
    college: '财政税务学院',
    version: 'v0.2',
    note: '适用 2024–2025 学年',
    year: '适用 2024–2025 学年',
    updated: '2026-09-04 更新',
  },
  {
    college: '国际经济与贸易学院',
    version: 'v0.2',
    note: '含全员统一分项',
    year: '适用 2024–2025 学年',
    updated: '2026-09-04 更新',
  },
]

/** S3 · 规则包版本与更新：左文 + 右四行版本卡 */
export default function RuleVersions() {
  return (
    <section id="rule-versions" className="scroll-mt-24">
      <SectionHeading
        index="03"
        title="规则包版本与更新"
        lead="每份规则包都标注版本号、适用学年与更新日期，全部公开可查。学院细则一修订，我们就跟进更新；问卷里每道题都可以展开细则原文依据，欢迎抽查。"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        {/* 左侧补充说明 */}
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-[14px] border border-line bg-paper-100 p-6">
            <h3 className="text-title-sm text-ink-900">版本公开，可溯源</h3>
            <p className="mt-3 text-body text-ink-700">
              四所学院的规则包维护在同一个公开版本中，修订记录随版本号一起发布。
              细则一变，版本号、适用学年与更新日期会同步变更——你看到的永远是“现在正在生效”的那一份。
            </p>
            <p className="mt-4 text-caption text-ink-500">
              发现规则与你学院最新细则不一致？到页面底部登记，我们优先更新。
            </p>
          </div>
        </motion.div>

        {/* 右侧四行版本卡 */}
        <ul className="order-1 space-y-3 lg:order-2">
          {RULE_PACKS.map((pack, i) => (
            <motion.li
              key={pack.college}
              className="flex items-start gap-4 rounded-[14px] border border-line bg-card p-5 shadow-card"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                ease: [0.34, 1.4, 0.64, 1],
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] font-medium text-ink-900">
                    {pack.college}
                  </span>
                  <span className="rounded-[6px] bg-paper-200 px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-mono text-ink-700">
                    {pack.version}
                  </span>
                </div>
                <p className="mt-1.5 text-caption text-ink-500">
                  {pack.note}
                  <span className="mx-1.5 text-ink-300">·</span>
                  {pack.updated}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-caption font-medium text-success">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                现行有效
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.p
        className="mt-6 flex items-start gap-2 text-caption text-ink-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
        问卷中的每道题都可以展开“细则原文依据”，核对规则包是否忠实于学院文件。
      </motion.p>
    </section>
  )
}
