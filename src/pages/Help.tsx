import { motion } from 'framer-motion'
import HelpToc from '@/components/help/HelpToc'
import GettingStarted from '@/components/help/GettingStarted'
import PrivacySection from '@/components/help/PrivacySection'
import RuleVersions from '@/components/help/RuleVersions'
import DisclaimerSection from '@/components/help/DisclaimerSection'
import FaqAccordion from '@/components/help/FaqAccordion'
import AboutSection from '@/components/help/AboutSection'

const TITLE = '帮助、隐私，和我们怎么保证不出错。'

/** 页头：标题逐字上浮淡入，导语延迟淡入 */
function PageHeader() {
  return (
    <header>
      <span className="label-mono text-primary">HELP &amp; ABOUT</span>
      <h1 className="mt-4 text-display-lg text-ink-900" aria-label={TITLE}>
        {TITLE.split('').map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden="true"
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="mt-5 max-w-[34em] text-body-lg text-ink-700"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        分数关乎奖学金，所以我们把每一条规则的来源、每一个数字的边界都写在这里。
      </motion.p>
    </header>
  )
}

/**
 * 帮助 / 关于页（/help）。
 * 桌面端：左侧粘性锚点目录 + 右侧内容列（max-w 720px）；移动端目录收成顶部横滚。
 */
export default function Help() {
  return (
    <div className="mx-auto max-w-marketing px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
      <PageHeader />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-[220px_minmax(0,720px)] lg:gap-16">
        <HelpToc />

        <div className="min-w-0 space-y-20 sm:space-y-24">
          <GettingStarted />
          <PrivacySection />
          <RuleVersions />
          <DisclaimerSection />
          <FaqAccordion />
          <AboutSection />
        </div>
      </div>
    </div>
  )
}
