import { motion } from 'framer-motion'
import { HardDrive, Trash2, ShieldCheck } from 'lucide-react'
import SectionHeading from './SectionHeading'

const POINTS = [
  {
    icon: HardDrive,
    title: '数据只存在你的浏览器里',
    desc: '问卷答案与佐证图片保存在本机 localStorage / IndexedDB 中，不经过任何服务器；没有账号体系，没有追踪埋点。',
  },
  {
    icon: Trash2,
    title: '随时可以一键清空',
    desc: '导出页提供「清空本地数据」按钮，删除问卷暂存与清单数据；佐证图片可在浏览器站点数据中一并清除。',
  },
  {
    icon: ShieldCheck,
    title: '导出物由你掌控',
    desc: '清单 JSON 与打印 PDF 都是本地生成的文件，保存、转发、删除完全由你决定。',
  },
]

/** S3 · 隐私与数据（PRIVACY） */
export default function PrivacySection() {
  return (
    <motion.section
      id="privacy"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <SectionHeading overline="PRIVACY" title="隐私与数据" />
      <div className="mt-8 space-y-4">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 rounded-[14px] border border-line bg-card p-5 shadow-card sm:p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-success-soft text-success">
              <p.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-serif text-[18px] font-bold text-ink-900">{p.title}</h3>
              <p className="mt-1.5 text-body leading-relaxed text-ink-700">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
