import { motion } from 'framer-motion'
import { CheckCircle2, Hourglass } from 'lucide-react'

const COLLEGES = [
  {
    name: '保险学院',
    ready: true,
    note: '规则包 v0.1 · 含活动等级目录',
    source: '保险学院本科生综合素质评价实施细则（2024 年修订）',
  },
  {
    name: '金融学院',
    ready: true,
    note: '规则包 v0.1',
    source: '金融学院本科生综合素质评价实施办法',
  },
  {
    name: '财政税务学院',
    ready: true,
    note: '规则包 v0.1',
    source: '财政税务学院本科生综合素质评价实施细则',
  },
  {
    name: '国际经济与贸易学院',
    ready: true,
    note: '规则包 v0.1',
    source: '国际经济与贸易学院本科生综合素质测评细则',
  },
]

const QUEUE = ['会计学院', '统计与数学学院', '管理科学与工程学院', '你的学院']

/** S4 · 支持学院：已支持卡片 + 排队中色条 */
export default function Colleges() {
  return (
    <section id="colleges" className="bg-paper-100 py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">COLLEGES</span>
          <h2 className="mt-3 text-title-md">已支持 4 个学院，更多在路上。</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-ink-500">
            每个学院的细则都被逐条拆解成结构化规则包，经过两轮校对后才会上线。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {COLLEGES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[16px] border border-line bg-card p-6 shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-[20px] font-bold text-ink-900">{c.name}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  已支持
                </span>
              </div>
              <p className="mt-2 font-mono text-[12px] text-primary">{c.note}</p>
              <p className="mt-2 text-caption leading-relaxed text-ink-500">依据：{c.source}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          <span className="inline-flex items-center gap-1.5 text-caption text-ink-500">
            <Hourglass className="h-3.5 w-3.5" />
            排队中：
          </span>
          {QUEUE.map((q) => (
            <span
              key={q}
              className="rounded-full border border-dashed border-line bg-paper-50 px-3.5 py-1.5 text-[13px] text-ink-500"
            >
              {q}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
