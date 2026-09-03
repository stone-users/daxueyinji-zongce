import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

/** S5 · 免责与边界（BOUNDARY）：双色警示纸块 */
export default function DisclaimerSection() {
  return (
    <motion.section
      id="disclaimer"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading overline="BOUNDARY" title="免责与边界" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] bg-seal-soft p-6">
          <h3 className="text-title-sm text-seal">我们的责任边界</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-ink-700">
            <li>本工具是第三方辅助工具，与学校官方系统无关。</li>
            <li>区间分与定级最终以评议小组认定为准；细则以学院官方发布的最新版本为准。</li>
            <li>规则包经过两轮校对，但不能保证 100% 覆盖细则所有情形；与学院解释不一致时，以学院为准。</li>
          </ul>
        </div>
        <div className="rounded-[14px] bg-warning-soft p-6">
          <h3 className="text-title-sm text-warning">你需要自己保证的</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-ink-700">
            <li>填报内容与佐证材料真实有效。</li>
            <li>提交前逐项核对系统预填结果。</li>
            <li>如实申报减分项，不隐瞒、不虚报。</li>
          </ul>
        </div>
      </div>
    </motion.section>
  )
}
