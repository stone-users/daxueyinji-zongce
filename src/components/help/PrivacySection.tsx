import { motion } from 'framer-motion'
import { CloudOff, Download, HardDrive, Repeat2, Trash2 } from 'lucide-react'

const POINTS = [
  {
    icon: HardDrive,
    title: '数据只存在你的浏览器里。',
    desc: '作答记录存 localStorage，佐证图片存 IndexedDB，均在本机。',
  },
  {
    icon: CloudOff,
    title: '没有账号，没有服务器，没有追踪脚本。',
    desc: '',
  },
  {
    icon: Download,
    title: '导出 = 带走。',
    desc: 'JSON 清单与暂存备份文件都在浏览器内本地生成。',
  },
  {
    icon: Trash2,
    title: '清空 = 消失。',
    desc: '导出清单页与浏览器设置中均可一键清空，设备之外没有任何副本。',
  },
  {
    icon: Repeat2,
    title: '换设备怎么办：',
    desc: '用“导出暂存备份 → 在新设备导入”接力（入口在导出清单页）。',
  },
]

/** S2 · 隐私说明：全宽 ink-900 深色反色重点区块 */
export default function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-24">
      {/* 拉宽到内容列之外、依然限制在栅格内的全宽深色卡 */}
      <motion.div
        className="overflow-hidden rounded-[16px] bg-ink-900 shadow-card"
        initial={{ opacity: 0.4 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
          <div>
            <span className="label-mono text-paper-200/70">SECTION 02 · PRIVACY</span>
            <h2 className="mt-3 text-title-md text-paper-50">隐私说明</h2>
            <p className="mt-4 text-body-lg text-paper-200/85">
              这个工具没有你想象的那种“后台”——它更像一本放在你电脑里的手账。
            </p>
            <img
              src="/privacy-shield.svg"
              alt="一台笔记本电脑，屏幕内有一把闭合的锁和一朵被斜线划掉的云，表示数据不上传云端"
              className="mt-8 w-full max-w-[420px] rounded-[14px] border border-white/10"
              loading="lazy"
            />
          </div>

          <ul className="space-y-5">
            {POINTS.map((p, i) => (
              <motion.li
                key={p.title}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
                  <p.icon className="h-5 w-5 text-success-soft" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[16px] font-medium leading-[1.6] text-paper-50">
                    {p.title}
                  </p>
                  {p.desc && (
                    <p className="mt-1 text-body text-paper-200/75">{p.desc}</p>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
