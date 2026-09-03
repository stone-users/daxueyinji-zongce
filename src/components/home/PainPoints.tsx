import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const BEFORE = [
  '翻 40 页 PDF 找自己符合哪条',
  '算不清"取高不累加"和模块上限',
  '比赛到底算国家级还是省部级？',
  '填完心里没底，怕错报漏报',
]
const AFTER = [
  '只回答"我做了什么"，一问一答',
  '上限、互斥、折算，引擎实时算好',
  '输比赛名，系统建议级别、你来确认',
  '导出逐项清单，值、节点、佐证一一对应',
]

const cardLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
}
const cardRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15, ease: EASE } },
}
const checkList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.45 } },
}
const checkItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
}
const checkPath: Variants = {
  hidden: { pathLength: 0 },
  show: { pathLength: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

/** S2 · 痛点对比「以前 vs 现在」 */
export default function PainPoints() {
  return (
    <section id="why" className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">WHY</span>
          <h2 className="mt-3 text-title-md">每年综测填报，不该这么难。</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 以前 */}
          <motion.div
            variants={cardLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="relative rounded-[16px] bg-paper-100 p-8"
          >
            <span className="absolute left-6 top-0 -translate-y-1/2 rounded-md bg-danger px-2.5 py-1 text-caption font-medium text-danger-foreground">
              以前
            </span>
            <h3 className="text-title-sm">以前的你</h3>
            <ul className="mt-5 space-y-4">
              {BEFORE.map((t) => (
                <li key={t} className="flex items-start gap-3 text-body text-ink-500">
                  <X className="mt-1 h-4 w-4 shrink-0 text-danger" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 现在 */}
          <motion.div
            variants={cardRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="relative rounded-[16px] border border-line bg-card p-8 shadow-card"
          >
            <span className="absolute left-6 top-0 -translate-y-1/2 rounded-md bg-success px-2.5 py-1 text-caption font-medium text-success-foreground">
              现在
            </span>
            <h3 className="text-title-sm">现在的你</h3>
            <motion.ul variants={checkList} className="mt-5 space-y-4">
              {AFTER.map((t) => (
                <motion.li
                  key={t}
                  variants={checkItem}
                  className="flex items-start gap-3 text-body text-ink-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft">
                    <svg viewBox="0 0 12 12" className="h-3 w-3">
                      <motion.path
                        d="M 2 6.5 L 5 9 L 10 3"
                        fill="none"
                        stroke="#5E8C61"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={checkPath}
                      />
                    </svg>
                  </span>
                  {t}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
