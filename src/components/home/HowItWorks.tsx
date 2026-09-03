import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ClipboardCheck, Layers, FileDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STEPS = [
  {
    no: '01',
    title: '三步入口',
    desc: '「选学院 → 选年级 → 确认学年」，系统自动加载你学院的规则包。',
    icon: ClipboardCheck,
  },
  {
    no: '02',
    title: '逐模块作答',
    desc: '德育、智育、体育、学术科研、组织管理、劳动实践、美育，七个模块一问一答，进度实时可见，随时暂存。',
    icon: Layers,
  },
  {
    no: '03',
    title: '导出填报清单',
    desc: '每一项：预填值 ↔ 系统填报节点 ↔ 佐证材料提醒，待评议项明确标记，导出 JSON，配合插件一键预填。',
    icon: FileDown,
  },
]

/** S3 · 它如何工作 — GSAP ScrollTrigger 滚动叙事（桌面 pin 150vh，移动端纵向堆叠） */
export default function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const numbers = gsap.utils.toArray<HTMLElement>('.hiw-number')
        const cards = gsap.utils.toArray<HTMLElement>('.hiw-card')
        gsap.set(numbers, { opacity: 0, yPercent: 40 })
        gsap.set(numbers[0], { opacity: 1, yPercent: 0 })
        gsap.set(cards, { opacity: 0, y: 40 })
        gsap.set(cards[0], { opacity: 1, y: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 0.5,
          },
        })

        for (let i = 1; i < STEPS.length; i++) {
          const at = (i - 1) + 0.55
          tl.to(numbers[i - 1], { opacity: 0, yPercent: -40, duration: 0.35 }, at)
            .to(cards[i - 1], { opacity: 0, y: -40, duration: 0.35 }, at)
            .fromTo(numbers[i], { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.35 }, at + 0.15)
            .fromTo(cards[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, at + 0.15)
        }

        gsap.fromTo(
          '.hiw-progress',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: '+=150%',
              scrub: true,
            },
          },
        )
      })
    },
    { scope: rootRef },
  )

  return (
    <section ref={rootRef} className="relative overflow-hidden py-24 md:py-0">
      <div className="mx-auto flex min-h-0 max-w-[1080px] flex-col px-4 sm:px-6 md:min-h-[100dvh] md:justify-center">
        <div className="mb-12 text-center md:text-left">
          <span className="label-mono text-ink-500">HOW IT WORKS</span>
          <h2 className="mt-3 text-title-md">它如何工作</h2>
        </div>

        {/* 桌面端：左大数字 + 右步骤卡（pinned 切换） */}
        <div className="hidden md:grid md:grid-cols-[240px_1fr] md:gap-16">
          <div className="relative h-[160px]">
            {STEPS.map((s) => (
              <div key={s.no} className="hiw-number absolute inset-0 flex items-start">
                <span className="font-mono text-[120px] font-semibold leading-none text-ink-900/10">
                  {s.no}
                </span>
              </div>
            ))}
          </div>
          <div className="relative min-h-[260px]">
            {STEPS.map((s) => (
              <div
                key={s.no}
                className="hiw-card absolute inset-0 rounded-[16px] border border-line bg-card p-10 shadow-card"
              >
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-title-md">{s.title}</h3>
                <p className="mt-4 max-w-xl text-body-lg text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 移动端：纵向三张卡 */}
        <div className="space-y-5 md:hidden">
          {STEPS.map((s) => (
            <div key={s.no} className="rounded-[16px] border border-line bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="font-mono text-score text-ink-900/20">{s.no}</span>
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-title-sm">{s.title}</h3>
              <p className="mt-2 text-body text-ink-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 底部滚动进度细线 */}
        <div className="mt-14 hidden h-[3px] w-full overflow-hidden rounded-full bg-paper-200 md:block">
          <div className="hiw-progress h-full w-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  )
}
