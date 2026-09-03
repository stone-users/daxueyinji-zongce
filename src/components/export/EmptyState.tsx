import { useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Upload, Wand2 } from 'lucide-react'
import { parseSessionJson, type ZongceSession } from './session'

interface EmptyStateProps {
  onRestore: (session: ZongceSession) => void
  onLoadDemo: () => void
  onError: (message: string) => void
}

/** 空状态：无暂存直接进入 /export */
export default function EmptyState({ onRestore, onLoadDemo, onError }: EmptyStateProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    const session = parseSessionJson(text)
    if (session) onRestore(session)
    else onError('文件无法识别：请选择本工具导出的暂存 JSON 文件。')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-16 text-center sm:py-24"
    >
      <span className="label-mono text-primary">EXPORT</span>
      <img src="/empty-folder.svg" alt="" className="mt-8 w-52 sm:w-64" />
      <h1 className="mt-6 text-[28px] font-bold leading-[1.2] text-ink-900 sm:text-display-lg">
        还没有可导出的清单
      </h1>
      <p className="mt-3 max-w-md text-body-lg text-ink-500">
        先完成问卷，或导入之前的暂存文件。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/wizard"
          className="rounded-[10px] bg-primary px-5 py-2.5 text-body font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-deep"
        >
          开始填报 →
        </Link>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-card px-5 py-2.5 text-body text-ink-700 shadow-card transition-colors hover:bg-paper-100"
        >
          <Upload className="h-4 w-4" />
          导入暂存文件
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {/* 开发调试入口（演示数据） */}
      <button
        type="button"
        onClick={onLoadDemo}
        className="mt-10 inline-flex items-center gap-1.5 text-caption text-ink-300 underline decoration-dotted underline-offset-4 transition-colors hover:text-ink-500 print:hidden"
      >
        <Wand2 className="h-3.5 w-3.5" />
        载入演示数据（开发调试）
      </button>
    </motion.div>
  )
}
