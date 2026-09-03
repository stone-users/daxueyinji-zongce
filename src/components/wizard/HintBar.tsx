import { AnimatePresence, motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 互斥/上限实时提示条：warning 底，滑入滑出 */
export default function HintBar({
  show,
  children,
  tone = 'warning',
}: {
  show: boolean
  children: React.ReactNode
  tone?: 'warning' | 'danger'
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'mt-3 flex items-start gap-2 rounded-[10px] px-3.5 py-2.5 text-body',
              tone === 'warning' ? 'bg-warning-soft text-warning-foreground' : 'bg-danger-soft text-danger',
            )}
          >
            <TriangleAlert className={cn('mt-1 h-4 w-4 shrink-0', tone === 'warning' ? 'text-warning' : 'text-danger')} />
            <div>{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
