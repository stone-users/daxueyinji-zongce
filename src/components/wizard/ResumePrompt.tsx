import { useState } from 'react'
import { motion } from 'framer-motion'

/** 恢复流程：检测到暂存时的全屏欢迎卡 */
export default function ResumePrompt({
  where,
  onResume,
  onRestart,
}: {
  where: string
  onResume: () => void
  onRestart: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[520px] rounded-[16px] border border-line bg-card p-8 text-center shadow-card"
      >
        <span className="label-mono text-primary">WELCOME BACK</span>
        <h1 className="mt-3 text-title-md text-ink-900">欢迎回来</h1>
        <p className="mt-3 text-body-lg text-ink-700">
          你上次进行到【{where}】。
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onResume}
            className="rounded-[10px] bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            继续作答
          </button>
          {confirming ? (
            <button
              type="button"
              onClick={onRestart}
              className="rounded-[10px] border border-danger px-6 py-2.5 text-[15px] text-danger transition-colors hover:bg-danger-soft"
            >
              确定清空并重新开始？
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-[10px] border border-line px-6 py-2.5 text-[15px] text-ink-700 transition-colors hover:bg-paper-100"
            >
              重新开始
            </button>
          )}
        </div>
        <p className="mt-4 text-caption text-ink-300">数据只存在你的浏览器里。</p>
      </motion.div>
    </div>
  )
}
