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

/** 模块长页顶部模块头：序号 + 中文模块名 + 分值/题量概览 + 说明（不再是单独一步） */
export default function ModuleHeader({
  moduleId,
  name,
  index,
  total,
  questionCount,
  answeredCount,
  maxScore,
  note,
}: {
  moduleId: string
  name: string
  index: number
  total: number
  questionCount: number
  answeredCount: number
  maxScore?: number
  note?: string
}) {
  const color = moduleColor(moduleId)

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[16px] px-6 py-8 sm:px-8"
      style={{ background: `linear-gradient(160deg, ${color}14 0%, transparent 60%)` }}
    >
      <span className="label-mono text-ink-500">
        MODULE {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 className="text-display-lg tracking-title-lg" style={{ color }}>
          {name}
        </h1>
        <span className="font-mono text-caption tabular-nums text-ink-500">
          已答 {answeredCount}/{questionCount}
          {typeof maxScore === 'number' ? ` · 模块满分 ${maxScore} 分` : ''}
        </span>
      </div>
      <p className="mt-3 max-w-md text-body text-ink-500">
        本模块共 {questionCount} 道题，向下滚动连续作答，没填的可以随时回来补{note ? `。${note}` : '。'}
      </p>
    </motion.header>
  )
}
