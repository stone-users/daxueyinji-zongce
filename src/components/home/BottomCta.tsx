import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

/** S7 · 底部 CTA：印章渐变背景 + 双按钮 */
export default function BottomCta() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* 背景：纸色 + 中央暖光晕 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(192,90,62,0.10) 0%, transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-[760px] px-4 text-center sm:px-6">
        <motion.span
          className="label-mono text-seal"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          GET STARTED
        </motion.span>
        <motion.h2
          className="mt-4 text-display-lg text-ink-900"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          今年的综测，从容一点。
        </motion.h2>
        <motion.p
          className="mx-auto mt-4 max-w-md text-body-lg text-ink-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          平均 8 分钟完成问卷，导出逐项核对清单。
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/wizard"
            className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-7 py-3.5 text-[16px] font-medium text-primary-foreground shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-card-hover"
          >
            开始填报
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            to="/help"
            className="rounded-[12px] border border-line bg-card px-7 py-3.5 text-[16px] font-medium text-ink-700 transition-colors hover:bg-paper-100"
          >
            了解隐私与安全
          </Link>
        </motion.div>
        <motion.p
          className="mt-6 text-caption text-ink-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          无需注册 · 数据不出浏览器
        </motion.p>
      </div>
    </section>
  )
}
