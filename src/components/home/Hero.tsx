import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, FileText, Stamp, FolderCheck } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const FLOAT_CARDS = [
  {
    icon: FileText,
    title: '40 页细则 PDF',
    sub: '逐条拆解为结构化规则包',
    className: 'left-[2%] top-[16%] hidden xl:flex',
    delay: 0.5,
  },
  {
    icon: Stamp,
    title: '已确认 ✓',
    sub: '全员基本分 · 一键盖章',
    className: 'right-[3%] top-[22%] hidden xl:flex',
    delay: 0.65,
    seal: true,
  },
  {
    icon: FolderCheck,
    title: '导出清单',
    sub: '值 · 节点 · 佐证一一对应',
    className: 'bottom-[14%] left-[6%] hidden xl:flex',
    delay: 0.8,
  },
]

/** S1 · Hero：大标题 + 副标 + CTA + 漂浮卡 + 双光晕纸面 */
export default function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="mx-auto max-w-marketing px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-[760px] text-center">
          <motion.span
            className="label-mono text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            中央财经大学 · 综测填报助手
          </motion.span>

          <motion.h1
            className="mt-5 text-[36px] font-black leading-[1.15] tracking-title text-ink-900 sm:text-display-xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          >
            综测填报，
            <br className="sm:hidden" />
            像盖章一样简单。
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-[36em] text-body-lg text-ink-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
          >
            把几十页学院细则变成一步步问答：你只回答「我做了什么」，
            规则引擎自动算分、判级别、查互斥，最后导出一份逐项核对清单。
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
          >
            <Link
              to="/wizard"
              className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-7 py-3.5 text-[16px] font-medium text-primary-foreground shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-card-hover"
            >
              开始填报
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href="/#why"
              className="rounded-[12px] border border-line bg-card px-7 py-3.5 text-[16px] font-medium text-ink-700 transition-colors hover:bg-paper-100"
            >
              了解原理
            </a>
          </motion.div>

          <motion.p
            className="mt-6 text-caption text-ink-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            无需注册 · 数据只存在你的浏览器里 · 已支持 4 个学院
          </motion.p>
        </div>

        {/* 漂浮卡片 */}
        {FLOAT_CARDS.map((c) => (
          <motion.div
            key={c.title}
            className={`absolute flex-col gap-1 rounded-[14px] border border-line bg-card/90 px-4 py-3 shadow-card backdrop-blur-sm ${c.className}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: c.delay, ease: EASE }}
          >
            <span className={`flex items-center gap-2 text-[14px] font-bold ${c.seal ? 'font-serif text-seal' : 'text-ink-900'}`}>
              <c.icon className={`h-4 w-4 ${c.seal ? 'text-seal' : 'text-primary'}`} />
              {c.title}
            </span>
            <span className="text-[12px] text-ink-500">{c.sub}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
