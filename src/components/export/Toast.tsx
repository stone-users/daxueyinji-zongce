import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export interface ToastData {
  id: number
  message: string
  tone?: 'ok' | 'warn'
}

/** 页面内轻量 Toast（不依赖全局挂载点） */
export default function ToastStack({ toasts }: { toasts: ToastData[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2 print:hidden">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-2 rounded-[10px] border border-line bg-ink-900 px-4 py-2.5 text-body text-paper-50 shadow-card-hover"
          >
            <CheckCircle2 className="h-4 w-4 text-success-soft" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
