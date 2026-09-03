import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type StampVariant = 'confirmed' | 'pending' | 'material'

const STYLES: Record<StampVariant, { text: string; cls: string; round: boolean }> = {
  confirmed: { text: '已确认 ✓', cls: 'border-seal text-seal', round: true },
  pending: { text: '待评议确认', cls: 'border-warning text-warning', round: false },
  material: { text: '待补材料', cls: 'border-ink-500 text-ink-500', round: false },
}

/** 印章组件：盖章动效（砸下 + 微旋转），尊重 prefers-reduced-motion */
export default function StampBadge({
  variant,
  animate = false,
  className,
}: {
  variant: StampVariant
  animate?: boolean
  className?: string
}) {
  const s = STYLES[variant]
  return (
    <motion.span
      initial={animate ? { scale: 1.6, rotate: -20, opacity: 0 } : false}
      animate={{ scale: 1, rotate: s.round ? -8 : -6, opacity: 1 }}
      transition={{ duration: 0.28, ease: [0.34, 1.4, 0.64, 1] }}
      className={cn(
        'pointer-events-none inline-flex select-none items-center justify-center border-2 font-serif font-bold',
        s.round ? 'h-20 w-20 rounded-full text-[15px]' : 'rounded-[6px] px-2 py-1 text-[12px]',
        s.cls,
        className,
      )}
      style={{ boxShadow: 'inset 0 0 0 1px currentColor' }}
    >
      {s.text}
    </motion.span>
  )
}
