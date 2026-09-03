import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { CloudOff, FolderOutput, Trash2 } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const POINTS = [
  {
    icon: CloudOff,
    title: '无账号，无上传',
    desc: '没有注册登录，你的作答记录和图片佐证全部保存在浏览器本地存储（localStorage / IndexedDB）。',
  },
  {
    icon: Trash2,
    title: '随时可以带走或清空',
    desc: '导出 JSON 是你的；一键清空后，设备之外没有任何副本。',
  },
  {
    icon: FolderOutput,
    title: '清单文件本地生成',
    desc: '导出在浏览器内完成，不经过任何服务器。',
  },
]

const titleWords: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const word: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}
const pointList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}
const point: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
}

/** S5 · 隐私承诺（深色反色区块） */
export default function Privacy() {
  return (
    <motion.section
      initial={{ opacity: 0.6, filter: 'brightness(0.85)' }}
      whileInView={{ opacity: 1, filter: 'brightness(1)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full bg-ink-900 py-28"
    >
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="label-mono text-seal">PRIVACY FIRST</span>
          <motion.h2
            variants={titleWords}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-4 text-[28px] font-bold leading-[1.2] text-paper-50 sm:text-display-lg"
          >
            {Array.from('数据只存在你的浏览器里。').map((ch, i) => (
              <motion.span key={i} variants={word} className="inline-block">
                {ch}
              </motion.span>
            ))}
          </motion.h2>

          <motion.ul
            variants={pointList}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-10 space-y-7"
          >
            {POINTS.map((p) => (
              <motion.li key={p.title} variants={point} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                  <p.icon className="h-5 w-5 text-success" />
                </span>
                <div>
                  <h3 className="text-title-sm text-paper-50">{p.title}</h3>
                  <p className="mt-1 text-body text-paper-50/70">{p.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <p className="mt-10 text-caption text-paper-50/60">
            换电脑或清浏览器数据前，记得先导出暂存文件。
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto w-full max-w-[480px]"
        >
          <img src="/privacy-shield.svg" alt="数据仅存本地：笔记本、锁与被划掉的云" className="w-full" />
        </motion.div>
      </div>
    </motion.section>
  )
}
