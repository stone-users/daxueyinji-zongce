import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { MessagesSquare, Calculator, ClipboardCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const STEPS = [
  {
    icon: MessagesSquare,
    step: 'STEP 1',
    title: '一问一答',
    desc: '学院、年级选完，题目按你的情况动态生成：是否参加、几次、什么级别，像聊天一样答完。',
  },
  {
    icon: Calculator,
    step: 'STEP 2',
    title: '引擎算分',
    desc: '模块上限、互斥取高、成员折算、志愿时长换算……规则引擎按学院细则实时计算并给出依据。',
  },
  {
    icon: ClipboardCheck,
    step: 'STEP 3',
    title: '清单核对',
    desc: '导出逐项清单：预填值、系统节点、佐证材料、状态印章一目了然，支持随时回改再导出。',
  },
]

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/** S3 · 三步流程 */
export default function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">HOW IT WORKS</span>
          <h2 className="mt-3 text-title-md">三步，从细则到清单。</h2>
        </div>
        <motion.div
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              variants={item}
              className="relative rounded-[16px] border border-line bg-card p-7 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <s.icon className="h-5.5 w-5.5" />
                </span>
                <span className="font-mono text-[12px] font-medium tracking-mono text-ink-300">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-[19px] font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink-500">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-line md:block" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
