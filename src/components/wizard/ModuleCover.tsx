import { useEffect } from 'react'
import { motion } from 'framer-motion'

const MODULE_COLORS: Record<string, string> = {
  deyu: '#7A5C8E',
  zhiyu: '#2E5A87',
  tiyu: '#5E8C61',
  xueshu: '#8A6D3B',
  zuzhi: '#C08051',
  laodong: '#4F8A8B',
  meiyu: '#B06B7D',
}

export function moduleColor(id: string): string {
  return MODULE_COLORS[id] ?? '#22303E'
}

/** 模块封面：序号 + 模块名（blur→清晰）+ 预告；1.2s 无操作自动进入 */
export default function ModuleCover({
  moduleId,
  name,
  index,
  total,
  questionCount,
  note,
  onEnter,
}: {
  moduleId: string
  name: string
  index: number
  total: number
  questionCount: number
  note?: string
  onEnter: () => void
}) {
  const color = moduleColor(moduleId)
  useEffect(() => {
    const t = setTimeout(onEnter, 1200)
    return () => clearTimeout(t)
  }, [onEnter])

  return (
    <button
      type="button"
      onClick={onEnter}
      className="flex min-h-[50dvh] w-full flex-col items-center justify-center rounded-[16px] px-6 text-center"
      style={{ background: `linear-gradient(160deg, ${color}14 0%, transparent 60%)` }}
    >
      <motion.span
        className="label-mono text-ink-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        MODULE {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </motion.span>
      <motion.h1
        className="mt-4 text-display-lg tracking-title-lg"
        style={{ color }}
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {name}
      </motion.h1>
      <motion.p
        className="mt-4 max-w-md text-body-lg text-ink-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        本模块大约 {questionCount} 道题{note ? `。${note}` : '。'}
      </motion.p>
      <motion.span className="mt-8 text-caption text-ink-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        点击任意处继续
      </motion.span>
    </button>
  )
}
