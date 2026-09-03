import { Link } from 'react-router'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const chars: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const char: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

/** S7 · 底部 CTA */
export default function BottomCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 text-center sm:px-6">
        <motion.h2
          variants={chars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-[28px] font-bold leading-[1.2] tracking-title text-ink-900 sm:text-display-lg"
        >
          {Array.from('今年的综测，十分钟填完。').map((ch, i) => (
            <motion.span key={i} variants={char} className="inline-block">
              {ch}
            </motion.span>
          ))}
        </motion.h2>
        <p className="mt-4 text-body-lg text-ink-500">从选择你的学院开始。</p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
          className="mt-8"
        >
          <motion.div whileInView="show" viewport={{ once: true }} className="inline-block">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Link
                to="/wizard"
                className="group inline-flex items-center gap-2 rounded-[10px] bg-primary px-10 py-4 text-[17px] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-deep"
              >
                开始填报
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <p className="mt-6 text-caption text-ink-500">
          <Link to="/help" className="underline decoration-line underline-offset-4 transition-colors hover:text-primary">
            帮助与隐私说明 →
          </Link>
        </p>
      </div>
    </section>
  )
}
