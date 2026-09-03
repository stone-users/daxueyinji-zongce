import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import SectionHeading from '@/components/help/SectionHeading'

const FAQS = [
  {
    q: '我的数据会被上传吗？',
    a: '不会。作答记录存在浏览器的 localStorage 里，佐证图片存在 IndexedDB 里，全部在你的设备本地。这个网站没有账号系统、没有后端数据库，也没有任何追踪脚本——我们想看也看不到。',
  },
  {
    q: '换电脑 / 清浏览器后会丢吗？',
    a: '会。浏览器本地存储一旦清除就没了。所以在换设备或大扫除之前，请先在导出清单页“导出暂存备份”，得到一个 JSON 备份文件；到新设备后导入即可接力。重要阶段建议随手导出一份。',
  },
  {
    q: '系统建议的比赛级别和我想的不一样？',
    a: '可以修改。系统建议只是按细则口径给出的参考，你可以在作答时直接调整；调整后该项会在清单中标记为「待评议确认」。最终级别以评议小组认定为准——这是固定规则，工具不做承诺。',
  },
  {
    q: '不上传佐证图片会有影响吗？',
    a: '不阻塞导出。佐证图片只是给你自己对照用的，不会离开本机；没传佐证的条目会在清单里标记「待补佐证」，提醒你按学院要求备好原件备查。',
  },
  {
    q: '我们学院什么时候支持？',
    a: '规则包按需求热度排队：整理一份学院细则需要逐条拆解成问卷，工作量不小。在下方登记你的学院和邮箱，同院同学登记越多，排队越靠前。登记信息只存在你的浏览器本地。',
  },
  {
    q: '分数算错了怎么办？',
    a: '先别慌：每道题下方都可以展开「细则原文依据」，对照原文核对一遍。如果确认是规则包的错误，请通过页面底部的登记邮箱联系我们并注明学院与条目，核实后我们会更新规则包版本并在帮助页公示。',
  },
]

/** S5 · 常见问题：手风琴，展开高度过渡 + 图标旋转 */
export default function FaqAccordion() {
  return (
    <section id="faq" className="scroll-mt-24">
      <SectionHeading
        index="05"
        title="常见问题"
        lead="问得最多的六件事，先在这里说清楚。"
      />

      <motion.div
        className="mt-8 rounded-[16px] border border-line bg-card px-6 shadow-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Accordion type="single" collapsible>
          {FAQS.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <AccordionItem value={`faq-${i}`} className="border-line">
                <AccordionTrigger className="group py-5 text-left text-[16px] font-medium text-ink-900 hover:no-underline [&>svg]:hidden">
                  <span className="flex flex-1 items-baseline gap-3">
                    <span className="font-mono text-[11px] tracking-mono text-ink-300">
                      Q{i + 1}
                    </span>
                    {faq.q}
                  </span>
                  <span className="self-center">
                    <Plus
                      className="h-4 w-4 text-ink-500 transition-transform duration-300 group-data-[state=open]:rotate-45"
                      aria-hidden="true"
                    />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-body text-ink-700 [&>div]:pb-5 [&>div]:pl-8">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
