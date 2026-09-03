import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { cn } from '@/lib/utils'

const FAQS: { q: string; a: string }[] = [
  {
    q: '为什么区间分不是确定的数字？',
    a: '有些加分项细则只给了区间（如“无偿献血每次加 2–4 分”），最终分值由评议小组在区间内定夺。工具会给出建议分与区间参考，并在导出清单中标注，绝不替你“四舍五入”。',
  },
  {
    q: '手动定级的比赛会怎么样？',
    a: '目录未收录的比赛由你手动选择级别，系统按所选级别计分，同时打上「待评议确认」标记。评议小组复核后可能调整，这与线下纸质填报的流程一致。',
  },
  {
    q: '填写中途关掉了浏览器怎么办？',
    a: '进度会自动暂存在浏览器本地（localStorage），再次打开向导时可从上次的位置继续。清空浏览器站点数据会删除暂存，建议及时导出清单 JSON 备份。',
  },
  {
    q: '佐证图片会不会被上传？',
    a: '不会。图片保存在浏览器 IndexedDB 中，仅用于导出清单时的核对提醒；打印的纸质清单不包含图片，佐证原件请按学院要求备查。',
  },
  {
    q: '规则包多久更新一次？',
    a: '学院发布新版细则后我们会尽快拆解并更新对应规则包，版本号与适用学年标注在规则包内。若你评价的学年与规则包适用学年不符，工具会在问卷开始前弹出强提示。',
  },
  {
    q: '我的学院还不支持，怎么办？',
    a: '在向导第一步选择「其他学院（排队中）」并登记邮箱，拆解到你的学院时会第一时间通知你；也欢迎以志愿者身份参与本学院规则包的整理（见「关于我们」）。',
  },
]

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[14px] border border-line bg-card shadow-card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-serif text-[17px] font-bold leading-snug text-ink-900">{q}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-body leading-relaxed text-ink-700">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** S6 · 常见问题（FAQ）手风琴 */
export default function FaqAccordion() {
  return (
    <motion.section
      id="faq"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading overline="FAQ" title="常见问题" />
      <div className="mt-8 space-y-3">
        {FAQS.map((f, i) => (
          <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
        ))}
      </div>
    </motion.section>
  )
}
