import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Score } from '@/engine/types'
import { scoreMid } from '@/engine/rulepack'

/** 右侧实时分值 chip：等宽数字 + 变化时翻滚高亮 300ms；区间分显示 "+9（8–10）" */
export default function ScoreChip({ score, className }: { score: Score | undefined; className?: string }) {
  const [flash, setFlash] = useState(false)
  const prev = useRef<string>('')
  const key = score == null ? '' : Array.isArray(score) ? score.join('-') : String(score)

  useEffect(() => {
    if (key && key !== prev.current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 300)
      prev.current = key
      return () => clearTimeout(t)
    }
    prev.current = key
  }, [key])

  const mid = scoreMid(score ?? null)
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 rounded-[6px] border px-2 py-0.5 font-mono text-[15px] font-semibold tabular-nums transition-colors duration-300',
        mid == null
          ? 'border-line text-ink-300'
          : flash
            ? 'border-seal bg-seal-soft text-seal'
            : 'border-line bg-paper-50 text-ink-900',
        className,
      )}
    >
      {mid == null ? (
        '+?'
      ) : Array.isArray(score) ? (
        <>
          +{mid}
          <span className="text-[11px] font-normal text-ink-500">（区间 {score[0]}–{score[1]}）</span>
        </>
      ) : (
        `+${mid}`
      )}
    </span>
  )
}
