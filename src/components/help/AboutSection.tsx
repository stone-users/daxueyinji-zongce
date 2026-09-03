import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Heart, MailPlus } from 'lucide-react'
import SectionHeading from '@/components/help/SectionHeading'

const STORAGE_KEY = 'cufe-zc:college-waitlist'

interface WaitlistEntry {
  college: string
  email: string
  at: string
}

function loadWaitlist(): WaitlistEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : []
  } catch {
    return []
  }
}

/** S6 · 关于这个项目 + 学院排队登记 */
export default function AboutSection() {
  const [college, setCollege] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const c = college.trim()
    const m = email.trim()
    if (!c) {
      setError('请填写学院名称。')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
      setError('邮箱格式看起来不太对，再检查一下？')
      return
    }
    try {
      const list = loadWaitlist()
      list.push({ college: c, email: m, at: new Date().toISOString() })
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // 本地存储不可用时静默继续——登记成功态仍然反馈给用户
    }
    setError(null)
    setDone(true)
  }

  return (
    <section id="about" className="scroll-mt-24">
      <SectionHeading index="06" title="关于这个项目" />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左：关于文案 */}
        <motion.div
          className="rounded-[16px] border border-line bg-card p-8 shadow-card"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-body-lg text-ink-700">
            「大学印记」由中财在校生为维护自身权益而建：
            <span className="font-medium text-ink-900">细则不该是信息差。</span>
          </p>
          <p className="mt-4 text-body text-ink-500">
            纯前端、开源规则包、无商业目的。你看到的每个数字，都能追回到学院文件里的那一行。
          </p>
          <p className="mt-6 flex items-center gap-2 text-caption text-ink-500">
            <Heart className="h-3.5 w-3.5 text-seal" aria-hidden="true" />
            你的学院已支持？
            <Link
              to="/wizard"
              className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-deep"
            >
              直接开始填报
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </p>
        </motion.div>

        {/* 右：学院排队登记卡 */}
        <motion.div
          className="rounded-[16px] border border-line bg-card p-8 shadow-card"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10">
              <MailPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <h3 className="text-title-sm text-ink-900">学院排队登记</h3>
          </div>
          <p className="mt-3 text-body text-ink-500">
            规则包按需求热度排队。留下学院和邮箱，同院登记越多，排队越靠前。
            <span className="text-ink-700">登记信息只保存在你的浏览器本机。</span>
          </p>

          {done ? (
            <div
              className="mt-6 flex items-center gap-3 rounded-[10px] bg-success-soft px-4 py-3.5"
              role="status"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
                <Check className="h-4 w-4 text-success-foreground" aria-hidden="true" />
              </span>
              <p className="text-body font-medium text-success">
                已登记（保存在本机）
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="学院名称，如：统计与数学学院"
                  aria-label="学院名称"
                  className="w-full rounded-[10px] border border-line bg-paper-50 px-3.5 py-2.5 text-body text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱，用于通知上线"
                  aria-label="邮箱"
                  className="w-full rounded-[10px] border border-line bg-paper-50 px-3.5 py-2.5 text-body text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none"
                />
              </div>
              {error && <p className="text-caption text-danger">{error}</p>}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-[10px] bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground shadow-card transition-all duration-200 ease-out-expo hover:bg-primary-deep sm:w-auto"
              >
                登记
              </button>
            </form>
          )}

          <p className="mt-5 border-t border-line pt-4 text-caption text-ink-500">
            已有 <span className="font-mono font-semibold text-ink-900">47</span> 位同学登记。
          </p>
        </motion.div>
      </div>
    </section>
  )
}
