import { motion } from 'framer-motion'
import SectionHeading from '@/components/help/SectionHeading'

const STEPS = [
  {
    n: '01',
    title: '选学院与学年',
    desc: '入口三问，自动加载你学院的规则包。',
  },
  {
    n: '02',
    title: '逐模块作答',
    desc: '七个模块一问一答；随时暂存，关闭浏览器也不丢。',
  },
  {
    n: '03',
    title: '核对收尾两页',
    desc: '减分项自查（只读）+ 待确认项汇总。',
  },
  {
    n: '04',
    title: '导出清单',
    desc: 'JSON 导出 / 打印 / 复制文本，逐项含预填值、系统节点与佐证提醒。',
  },
]

/** 步骤之间的虚线连接（stroke-dashoffset 描绘动画，表“流程感”） */
function Connector() {
  return (
    <svg
      className="absolute left-full top-8 hidden h-2 w-full md:block"
      viewBox="0 0 100 8"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <motion.line
        x1="4"
        y1="4"
        x2="96"
        y2="4"
        stroke="#E3DCCB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 6"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  )
}

/** S1 · 三分钟上手指南：四步横向步骤条（移动端纵向） */
export default function GettingStarted() {
  return (
    <section id="getting-started" className="scroll-mt-24">
      <SectionHeading
        index="01"
        title="三分钟上手指南"
        lead="从选学院到导出清单，四步走完。不用注册，打开就能答。"
      />

      <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-0">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.n}
            className="relative md:px-5 md:first:pl-0 md:last:pr-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.55,
              delay: i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {i < STEPS.length - 1 && <Connector />}
            <div className="flex items-start gap-4 md:block">
              <span className="relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-line bg-card font-mono text-[20px] font-semibold text-primary shadow-card">
                {step.n}
              </span>
              <div>
                <h3 className="text-title-sm text-ink-900 md:mt-4">{step.title}</h3>
                <p className="mt-2 text-body text-ink-500">{step.desc}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
