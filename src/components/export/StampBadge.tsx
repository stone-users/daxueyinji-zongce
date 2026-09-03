import type { ItemStatus } from './session'
import { cn } from '@/lib/utils'

const CONFIG: Record<
  ItemStatus,
  { label: string; printLabel: string; className: string; round: boolean }
> = {
  ok: {
    label: '已确认',
    printLabel: '[已确认]',
    round: true,
    className: 'border-seal text-seal',
  },
  pending_review: {
    label: '待评议确认',
    printLabel: '[待评议确认]',
    round: false,
    className: 'border-warning text-warning',
  },
  needs_evidence: {
    label: '待补材料',
    printLabel: '[待补材料]',
    round: false,
    className: 'border-warning text-warning',
  },
  external: {
    label: '端口待填',
    printLabel: '[端口待填]',
    round: false,
    className: 'border-ink-500 text-ink-500',
  },
}

/**
 * 状态印章：印章式描边标签（打印时退化为纯文字标签）。
 * ok 用圆形朱砂章，其余用方形微旋转章。
 */
export default function StampBadge({
  status,
  className,
}: {
  status: ItemStatus
  className?: string
}) {
  const cfg = CONFIG[status]
  return (
    <span className={cn('inline-flex items-center', className)}>
      <span
        className={cn(
          'print:hidden inline-flex items-center justify-center border-[1.5px] px-2 py-0.5',
          'font-serif text-[12px] font-bold leading-none tracking-[0.08em]',
          'opacity-90 select-none whitespace-nowrap',
          cfg.round ? 'rounded-full h-14 w-14 flex-col gap-0.5 leading-tight' : 'rounded-[6px] rotate-[-6deg]',
          cfg.className,
        )}
        style={
          cfg.round
            ? { transform: 'rotate(-8deg)' }
            : undefined
        }
      >
        {cfg.round ? (
          <>
            <span>{cfg.label.slice(0, 2)}</span>
            <span>{cfg.label.slice(2)}</span>
          </>
        ) : (
          cfg.label
        )}
      </span>
      <span className="hidden print:inline font-mono text-[12px] text-ink-700">
        {cfg.printLabel}
      </span>
    </span>
  )
}
