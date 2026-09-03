import { motion } from 'framer-motion'
import { HardDrive, Eye, Printer } from 'lucide-react'

const POINTS = [
  {
    icon: HardDrive,
    title: '数据不出浏览器',
    desc: '答案与佐证图片只存在本机 localStorage / IndexedDB，没有账号、没有上传、没有追踪。',
  },
  {
    icon: Eye,
    title: '随时核对原文',
    desc: '每道题都能展开对应的细则原文；导出清单逐条标注出处，不怕评议小组问。',
  },
  {
    icon: Printer,
    title: '清单可打印存档',
    desc: '导出 JSON 备份、复制文本或打印成 PDF，提交后留一份底稿，来年复用更方便。',
  },
]

/** S5 · 隐私与安心 */
export default function Privacy() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">PRIVACY</span>
          <h2 className="mt-3 text-title-md">你的分数，只有你知道。</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-ink-500">
            综测数据敏感，我们从架构上保证它不出你的设备。
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[16px] bg-paper-100 p-7 transition-all duration-200 ease-out-expo hover:-translate-y-1 hover:shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-success-soft text-success">
                <p.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-serif text-[19px] font-bold text-ink-900">{p.title}</h3>
              <p className="mt-2 text-body leading-relaxed text-ink-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
