import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { moduleColor } from './ModuleCover'

export interface MapEntry {
  id: string
  name: string
  status: 'done' | 'partial' | 'todo'
  active: boolean
  clickable: boolean
}

/** 桌面端左栏 240px 进度地图：七模块 + 收尾两项 */
export function ProgressMap({
  entries,
  closing,
  onJump,
}: {
  entries: MapEntry[]
  closing: MapEntry[]
  onJump: (id: string) => void
}) {
  const [ask, setAsk] = useState<string | null>(null)
  const all = [...entries, ...closing]
  const renderRow = (e: MapEntry, i: number, isClosing: boolean) => (
    <li key={e.id}>
      <button
        type="button"
        disabled={!e.clickable}
        onClick={() => setAsk(e.id)}
        className={cn(
          'relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors',
          e.active ? 'font-bold' : 'text-ink-700',
          e.clickable ? 'hover:bg-paper-100' : 'cursor-not-allowed text-ink-300',
        )}
        style={e.active ? { color: moduleColor(e.id) } : undefined}
      >
        {e.active && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full" style={{ background: moduleColor(e.id) }} />}
        <span className="font-mono text-[12px] tabular-nums text-ink-300">{isClosing ? '·' : String(i + 1).padStart(2, '0')}</span>
        <span className="flex-1">{e.name}</span>
        {e.status === 'done' ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-white">
            <Check className="h-3 w-3" />
          </span>
        ) : e.status === 'partial' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute h-full w-full animate-ping rounded-full opacity-50" style={{ background: moduleColor(e.id) }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: moduleColor(e.id) }} />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full border border-ink-300" />
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

      {ask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 px-4" onClick={() => setAsk(null)}>
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-card p-6 shadow-card-hover" onClick={(e) => e.stopPropagation()}>
            <p className="text-body text-ink-900">返回「{all.find((x) => x.id === ask)?.name}」？当前进度已保存。</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setAsk(null)} className="rounded-[10px] px-4 py-2 text-[14px] text-ink-500 hover:bg-paper-100">
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onJump(ask)
                  setAsk(null)
                }}
                className="rounded-[10px] bg-primary px-4 py-2 text-[14px] text-primary-foreground hover:bg-primary-deep"
              >
                返回该模块
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

/** 移动端压缩进度条：7 段小色条 + 当前模块名 */
export function ProgressBarMobile({ entries, currentName, currentIndex }: { entries: MapEntry[]; currentName: string; currentIndex: number }) {
  return (
    <div className="border-b border-line bg-paper-50 px-4 py-2.5 lg:hidden">
      <div className="flex items-center gap-1.5">
        {entries.map((e) => (
          <span
            key={e.id}
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
