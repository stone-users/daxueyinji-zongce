import { motion } from 'framer-motion'
import { ListChecks, MousePointerClick, FileDown } from 'lucide-react'
import SectionHeading from './SectionHeading'

const STEPS = [
  {
    icon: MousePointerClick,
    title: '回答问卷',
    desc: '从首页进入问卷向导，选择学院与年级后，逐题回答「我做了什么」。规则引擎实时算分，进度自动暂存。',
  },
  {
    icon: ListChecks,
    title: '核对清单',
    desc: '完成问卷后生成导出清单：每个填报项对应系统节点、预填值、佐证要求与状态印章，支持随时「回改」。',
  },
  {
    icon: FileDown,
    title: '导出与提交',
    desc: '导出 JSON（可供浏览器插件预填）、复制文本或直接打印存档；最后登录学校系统逐项核对并提交。',
  },
]

/** S2 · 上手三步（GETTING STARTED） */
export default function GettingStarted() {
  return (
    <motion.section
      id="getting-started"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading overline="GETTING STARTED" title="上手三步" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[14px] border border-line bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <s.icon className="h-4.5 w-4.5" />
              </span>
              <span className="font-mono text-[12px] font-medium text-ink-300">
                STEP {i + 1}
              </span>
            </div>
            <h3 className="mt-4 font-serif text-[18px] font-bold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
