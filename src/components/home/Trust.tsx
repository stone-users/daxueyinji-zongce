import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Users, FileText, Stamp } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const ITEMS = [
  {
    icon: Users,
    title: '规则版本公开',
    desc: '每份规则包标注版本号、适用学年与更新日期；学院细则一修订，规则包即跟进更新。',
  },
  {
    icon: FileText,
    title: '依据可溯',
    desc: '问卷里每道题都能展开对应的细则原文，导出的清单逐项标注规则来源。',
  },
  {
    icon: Stamp,
    title: '不替制度打包票',
    desc: '手动定级或修改建议级别的项目，清单中明确标记「待评议确认」——定级最终以评议小组认定为准。',
  },
]

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

/** S6 · 信任机制（三栏） */
export default function Trust() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <motion.div
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {ITEMS.map((it) => (
            <motion.div
              key={it.title}
              variants={item}
              className="group rounded-[16px] border border-line bg-card p-7 shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-paper-100 transition-transform duration-200 group-hover:rotate-6">
                <it.icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-5 text-title-sm">{it.title}</h3>
              <p className="mt-3 text-body text-ink-500">{it.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
