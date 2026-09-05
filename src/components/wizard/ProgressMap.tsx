import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { moduleColor } from './ModuleCover'

export interface MapEntry {
  id: string
  name: string
  status: 'done' | 'partial' | 'todo'
  active: boolean
  clickable: boolean
  /** 模块内完成度，如 3/8；收尾项不传 */
  done?: number
  total?: number
}

/** 桌面端左栏 240px 进度地图：模块级导航 + 模块内完成度；所有模块随时可跳，未答不拦截 */
export function ProgressMap({
  entries,
  closing,
  onJump,
}: {
  entries: MapEntry[]
  closing: MapEntry[]
  onJump: (id: string) => void
}) {
  const renderRow = (e: MapEntry, i: number, isClosing: boolean) => (
    <li key={e.id}>
      <button
        type="button"
        disabled={!e.clickable}
        onClick={() => onJump(e.id)}
        className={cn(
          'relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors',
          e.active ? 'font-bold' : 'text-ink-700',
          e.clickable ? 'hover:bg-paper-100' : 'cursor-default text-ink-500',
        )}
        style={e.active ? { color: moduleColor(e.id) } : undefined}
      >
        {e.active && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full" style={{ background: moduleColor(e.id) }} />}
        <span className="font-mono text-[12px] tabular-nums text-ink-300">{isClosing ? '·' : String(i + 1).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1 truncate">{e.name}</span>
        {typeof e.done === 'number' && typeof e.total === 'number' && (
          <span className={cn('font-mono text-[11px] tabular-nums', e.done > 0 ? 'text-ink-500' : 'text-ink-300')}>
            {e.done}/{e.total}
          </span>
        )}
        {e.status === 'done' ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-[10px] text-white">
            <Check className="h-3 w-3" />
          </span>
        ) : e.status === 'partial' ? (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: moduleColor(e.id) }} />
        ) : (
          /* 未作答：空心灰点，与已答实心/盖章态区分 */
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink-300" />
        )}
      </button>
    </li>
  )

  return (
    <nav className="sticky top-20 w-[240px] shrink-0">
      <p className="label-mono mb-3 px-3 text-ink-300">PROGRESS MAP</p>
      <ul className="space-y-0.5">{entries.map((e, i) => renderRow(e, i, false))}</ul>
      <div className="my-3 border-t border-line" />
      <p className="label-mono mb-2 px-3 text-ink-300">收尾</p>
      <ul className="space-y-0.5">{closing.map((e, i) => renderRow(e, i, true))}</ul>
      <p className="mt-3 px-3 text-[12px] leading-relaxed text-ink-300">随时点击切换模块，没填的题不会拦你。</p>
    </nav>
  )
}

/** 移动端压缩进度条：模块色条可点击跳转 + 当前模块名 */
export function ProgressBarMobile({
  entries,
  currentName,
  currentIndex,
  onJump,
}: {
  entries: MapEntry[]
  currentName: string
  currentIndex: number
  onJump?: (id: string) => void
}) {
  return (
    <div className="border-b border-line bg-paper-50 px-4 py-2.5 lg:hidden">
      <div className="flex items-center gap-1.5">
        {entries.map((e) => (
          <button
            key={e.id}
            type="button"
            aria-label={e.name}
            onClick={() => onJump?.(e.id)}
            className={cn('h-1.5 flex-1 rounded-full', e.status === 'todo' && 'opacity-30')}
            style={{ background: e.status === 'todo' ? '#A9B2BC' : moduleColor(e.id) }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-caption text-ink-500">
        {currentName}
        {currentIndex >= 0 && (
          <span className="ml-1 font-mono tabular-nums">
            {currentIndex + 1}/{entries.length}
          </span>
        )}
      </p>
    </div>
  )
}
