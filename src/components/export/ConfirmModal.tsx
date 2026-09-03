import { AnimatePresence, motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** 二次确认弹窗（用于清空本地数据） */
export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/40 p-4 print:hidden"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm rounded-[16px] border border-line bg-card p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft">
                <TriangleAlert className="h-5 w-5 text-danger" />
              </span>
              <div>
                <h3 className="text-title-sm text-ink-900">{title}</h3>
                <p className="mt-1.5 text-body text-ink-500">{body}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-[10px] border border-line bg-card px-4 py-2 text-[14px] font-medium text-ink-700 transition-colors hover:bg-paper-100"
              >
                再想想
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-[10px] bg-danger px-4 py-2 text-[14px] font-medium text-danger-foreground transition-colors hover:opacity-90"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
