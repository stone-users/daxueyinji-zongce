import { motion } from 'framer-motion'
import { ShieldCheck, FileSearch, ScrollText } from 'lucide-react'

const POINTS = [
  {
    icon: ScrollText,
    title: '逐条标注细则原文',
    desc: '每个填报项都能展开对应的细则原文，来源可追溯。',
  },
  {
    icon: FileSearch,
    title: '两轮人工校对',
    desc: '规则包拆解后经过两轮校对才上线，版本与适用学年公开可查。',
  },
  {
    icon: ShieldCheck,
    title: '不替学校做决定',
    desc: '区间分与定级一律标注“以评议小组认定为准”，绝不越权。',
  },
]

/** S6 · 信任与合规 */
export default function Trust() {
  return (
    <section className="bg-paper-100 py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">TRUST</span>
          <h2 className="mt-3 text-title-md">分数的事，我们不糊弄。</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[16px] border border-line bg-card p-7 shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                <p.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-serif text-[19px] font-bold text-ink-900">{p.title}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-10 max-w-2xl text-center text-caption leading-relaxed text-ink-500"
        >
          本工具为中央财经大学学生自发组织的第三方辅助填报工具，与学校官方系统无关；
          综测成绩、定级与认定结果，以各学院评议小组及学校相关部门的最终确认为准。
        </motion.p>
      </div>
    </section>
  )
}
