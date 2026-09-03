import { motion } from 'framer-motion'
import { Stamp } from 'lucide-react'

const ITEMS = [
  {
    strong: '本工具是辅助填报工具',
    text: '，把学院细则转成问卷并自动计算参考分值；它不是学校官方系统，也不替代任何评议环节。',
  },
  {
    strong: '定级最终以评议小组认定为准。',
    text: '凡手动定级、修改系统建议级别、或细则给出区间分的项目，清单中一律标记「待评议确认」或注明区间，不做任何承诺。',
  },
  {
    strong: '细则原文可能年度修订；',
    text: '问卷入口会校验规则包适用学年并强提示（如财税包仅适用 2024–2025 学年）。',
  },
  {
    strong: '减分项本工具只提示、不采集、不预填；',
    text: '如有相关情况请主动向评议小组申报。',
  },
  {
    strong: '成绩类数据以教务系统为准，',
    text: '本工具不做核验。',
  },
]

/** S4 · 定级与免责说明：warning-soft 底 + 左侧 seal 色竖条的郑重区块 */
export default function DisclaimerSection() {
  return (
    <section id="disclaimer" className="scroll-mt-24">
      <motion.div
        className="overflow-hidden rounded-[16px] border border-warning/25 bg-warning-soft"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex">
          {/* seal 色竖条：入视口时高度 0→100% 生长 */}
          <motion.div
            className="w-1.5 shrink-0 origin-top bg-seal"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <Stamp className="h-6 w-6 shrink-0 text-seal" aria-hidden="true" />
              <div>
                <span className="label-mono text-seal">SECTION 04 · DISCLAIMER</span>
                <h2 className="mt-1 text-title-md text-ink-900">我们算什么，不算什么。</h2>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {ITEMS.map((item, i) => (
                <motion.li
                  key={item.strong}
                  className="flex items-start gap-3 text-body-lg text-ink-700"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-seal" aria-hidden="true" />
                  <p>
                    <strong className="font-medium text-ink-900">{item.strong}</strong>
                    {item.text}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
