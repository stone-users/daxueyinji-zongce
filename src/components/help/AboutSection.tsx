import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Sparkles, Send, Users } from 'lucide-react'
import SectionHeading from './SectionHeading'

const QA_EMAIL = 'hi@daxueyinji.app'

/** S7 · 关于我们（SUPPORT） */
export default function AboutSection() {
  return (
    <motion.section
      id="about"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading title="关于这个工具" />

      <div className="space-y-4">
        {/* 为什么做这个 */}
        <motion.div
          className="rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-7"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-title-sm text-ink-900">为什么做这个</h3>
          </div>
          <p className="mt-3 text-body leading-relaxed text-ink-700">
            综测填报本该是几分钟的事，现实却是翻几十页细则、对几十行表格。
            我们把各学院的细则逐条拆解、校对、结构化，变成一步一步的问答——
            你只回答「我做了什么」，规则引擎负责把它翻译成系统能认的分数。
          </p>
          <p className="mt-2 text-body leading-relaxed text-ink-700">
            每个学院的规则包都经过两轮校对，原文出处可随时回溯。
            它不替学校做决定，只是帮你把该拿的分一分不丢地报上去。
          </p>
        </motion.div>

        {/* 提建议 */}
        <motion.div
          className="rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-7"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-seal-soft text-seal">
              <Send className="h-4 w-4" />
            </span>
            <h3 className="text-title-sm text-ink-900">提建议</h3>
          </div>
          <p className="mt-3 text-body leading-relaxed text-ink-700">
            规则理解有出入、你的学院还没支持、或者单纯觉得哪里不好用——都欢迎写信告诉我们。
          </p>
          <a
            href={`mailto:${QA_EMAIL}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-paper-50 px-3.5 py-2 font-mono text-[14px] text-primary transition-colors hover:bg-paper-100"
          >
            {QA_EMAIL}
          </a>
        </motion.div>

        {/* 加入我们 */}
        <motion.div
          className="rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-7"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-success-soft text-success">
              <Users className="h-4 w-4" />
            </span>
            <h3 className="text-title-sm text-ink-900">加入我们</h3>
          </div>
          <p className="mt-3 text-body leading-relaxed text-ink-700">
            如果你愿意把本学院的综测细则整理成规则包，让下一届同学少走弯路，欢迎成为志愿者：
            我们提供模板与校对流程，大约占用你一个下午。
          </p>
          <p className="mt-2 text-caption text-ink-500">
            邮件标题注明「规则包志愿者 + 学院名」即可。
          </p>
        </motion.div>
      </div>

      <motion.p
        className="mt-10 text-center text-body text-ink-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        还有其它问题？{' '}
        <Link to="/wizard" className="text-primary hover:underline">
          先去填报
        </Link>
        {' '}或{' '}
        <a href={`mailto:${QA_EMAIL}`} className="text-primary hover:underline">
          联系我们
        </a>
        。
      </motion.p>
    </motion.section>
  )
}
