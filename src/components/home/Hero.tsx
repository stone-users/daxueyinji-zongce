import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowRight, BadgeCheck, HardDrive, UserX } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const POP = [0.34, 1.4, 0.64, 1] as [number, number, number, number]

/** 主标题两段，朱砂强调片段 */
const TITLE_LINES: { text: string; accent?: boolean }[][] = [
  [{ text: '几十页', accent: true }, { text: '的综测细则，' }],
  [{ text: '变成' }, { text: '几分钟', accent: true }, { text: '的问答。' }],
]

const charContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}
const charItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

function SplitLines() {
  return (
    <motion.h1
      className="text-[34px] font-black leading-[1.15] tracking-title-lg text-ink-900 sm:text-display-xl"
      variants={charContainer}
      initial="hidden"
      animate="show"
    >
      {TITLE_LINES.map((line, li) => (
        <span key={li} className="block">
          {line.map((seg, si) => (
            <span key={si} className={seg.accent ? 'text-seal' : undefined}>
              {Array.from(seg.text).map((ch, ci) => (
                <motion.span key={ci} className="inline-block" variants={charItem}>
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </motion.h1>
  )
}

/** 载入 1.2s 后盖章砸下，随后每 6s 极轻微浮动；随鼠标视差移动 */
function FloatingStamp() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 60, damping: 15 })
  const y = useSpring(useTransform(my, [-1, 1], [-6, 6]), { stiffness: 60, damping: 15 })
  const [stamped, setStamped] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setStamped(true), 1200)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  return (
    <motion.div style={{ x, y }} className="absolute -bottom-4 -right-2 w-24 sm:w-28">
      <motion.div
        initial={{ opacity: 0, scale: 1.6, rotate: -20 }}
        animate={
          stamped
            ? { opacity: 1, scale: 1, rotate: -8 }
            : { opacity: 0, scale: 1.6, rotate: -20 }
        }
        transition={{ duration: 0.28, ease: POP }}
      >
        <motion.img
          src="/stamp-confirmed.svg"
          alt=""
          animate={stamped ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  const { scrollY } = useScroll()
  // 插画以约 0.6 倍速视差上移（相对正文）
  const illoY = useTransform(scrollY, [0, 800], [0, -120])

  return (
    <section className="hero-glow relative flex min-h-[640px] items-center overflow-hidden md:min-h-[100dvh]">
      <div className="mx-auto grid w-full max-w-marketing grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[55%_45%]">
        {/* 左：文案 */}
        <div>
          <motion.span
            className="label-mono text-ink-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            CUFE · 综合素质评价 · 填报辅助
          </motion.span>

          <div className="mt-5">
            <SplitLines />
          </div>

          <motion.p
            className="mt-6 max-w-[34em] text-body-lg text-ink-700"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          >
            「大学印记 · 综测助手」把学院细则拆成一步步问答。你只回答“我做了什么”，
            分数由规则引擎自动计算，最后一键生成可导出的填报清单。
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
          >
            <Link
              to="/wizard"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-3 text-[16px] font-medium text-primary-foreground shadow-card transition-colors duration-200 hover:bg-primary-deep"
            >
              开始填报
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="/#colleges"
              className="rounded-[10px] px-4 py-3 text-[15px] font-medium text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900"
            >
              看看支持哪些学院
            </a>
          </motion.div>

          <motion.ul
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-ink-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <li className="flex items-center gap-1.5">
              <UserX className="h-3.5 w-3.5 text-success" /> 无需注册
            </li>
            <li className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-success" /> 数据只在本地
            </li>
            <li className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-success" /> 规则版本公开
            </li>
          </motion.ul>
        </div>

        {/* 右：插画 + 悬浮印章 */}
        <motion.div
          className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
          style={{ y: illoY }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        >
          <img
            src="/hero-illustration.svg"
            alt="展开的问卷卷轴与七个模块标签"
            className="w-full"
          />
          <FloatingStamp />
        </motion.div>
      </div>
    </section>
  )
}
