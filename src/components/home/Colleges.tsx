import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const POP = [0.34, 1.4, 0.64, 1] as [number, number, number, number]

const COLLEGES = [
  { name: '保险学院', note: '规则包 v0.2 · 2024年3月细则 · 2026-09 更新' },
  { name: '金融学院', note: '规则包 v0.2 · 含竞赛白名单口径' },
  { name: '财政税务学院', note: '规则包 v0.2 · 适用 2024–2025 学年' },
  { name: '国际经济与贸易学院', note: '规则包 v0.2 · 含全员统一分项' },
]

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const card: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
const stamp: Variants = {
  hidden: { opacity: 0, scale: 1.6, rotate: -20 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: -8,
    transition: { duration: 0.28, delay: 0.3, ease: POP },
  },
}

function NotifyBar() {
  const [email, setEmail] = useState('')
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      window.localStorage.setItem('cufe-zc:notify-email', email.trim())
      setRegistered(true)
      setError(false)
    } catch {
      setError(true)
    }
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-4 rounded-[16px] bg-paper-100 p-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body text-ink-700">
        你的学院还在排队中——留下邮箱，规则包上线第一时间通知你。
      </p>
      {registered ? (
        <span className="inline-flex items-center gap-2 rounded-[10px] bg-success px-4 py-2.5 text-[15px] font-medium text-success-foreground transition-colors duration-250">
          <Check className="h-4 w-4" /> 已登记
        </span>
      ) : (
        <form onSubmit={submit} className="flex w-full gap-2 sm:w-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cufe.edu.cn"
            className="w-full rounded-[10px] border border-line bg-card px-3.5 py-2.5 text-body text-ink-900 placeholder:text-ink-300 sm:w-56"
          />
          <button
            type="submit"
            className="shrink-0 rounded-[10px] bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            提醒我
          </button>
        </form>
      )}
      {error && (
        <p className="text-caption text-danger">本地存储不可用，请检查浏览器设置。</p>
      )}
    </div>
  )
}

/** S4 · 支持学院状态 */
export default function Colleges() {
  const navigate = useNavigate()

  return (
    <section id="colleges" className="py-24">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="text-center">
          <span className="label-mono text-ink-500">COLLEGES</span>
          <h2 className="mt-3 text-title-md">规则包已就位，按学院精确到条款。</h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-ink-500">
            每个学院的规则包均标注<strong className="text-ink-700">版本号与适用学年</strong>，每道题保留细则原文依据。
          </p>
        </div>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {COLLEGES.map((c) => (
            <motion.div
              key={c.name}
              variants={card}
              className="group relative flex flex-col rounded-[16px] border border-line bg-card p-6 shadow-card transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <motion.span
                variants={stamp}
                className="absolute right-5 top-5 rounded-md bg-success px-2.5 py-1 text-caption font-medium text-success-foreground"
              >
                已支持
              </motion.span>
              <h3 className="text-title-sm pr-20">{c.name}</h3>
              <p className="mt-2 flex-1 text-caption text-ink-500">{c.note}</p>
              <button
                onClick={() => navigate(`/wizard?college=${encodeURIComponent(c.name)}`)}
                className="mt-5 inline-flex items-center gap-1.5 self-start rounded-[10px] px-3 py-2 text-[15px] font-medium text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
              >
                以该学院开始 <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        <NotifyBar />
      </div>
    </section>
  )
}
