import { useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, CornerDownRight, FileText, Image, PencilLine } from 'lucide-react'
import StampBadge from './StampBadge'
import type { SessionItem, ZongceSession } from './session'
import { formatNumber, formatScore, moduleSubtotal } from './session'
import { moduleColor, moduleDisplayName } from './modules'
import { cn } from '@/lib/utils'

interface ModuleGroupProps {
  session: ZongceSession
  moduleName: string
  moduleIndex: number
  items: SessionItem[]
  evidenceKeys: Set<string>
  defaultOpen?: boolean
}

/** 填报项列：名称 + 模块·题号 + 可展开的细则原文 */
function ItemCell({ item }: { item: SessionItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <p className="text-body font-medium text-ink-900">{item.name}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-ink-500 transition-colors hover:text-primary"
      >
        <FileText className="h-3 w-3" />
        {moduleDisplayName(item.module)} · 条目依据
        <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
        细则原文
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <blockquote className="mt-2 border-l-2 border-line bg-paper-100 px-3 py-2 text-caption text-ink-500">
              {item.sourceQuote}
            </blockquote>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 预填值列：Mono 大字；区间分带 † 并注明评议小组定夺 */
function ScoreCell({ item }: { item: SessionItem }) {
  const { main, isRange } = formatScore(item.score)
  return (
    <div>
      <span className="font-mono text-[20px] font-semibold leading-none text-ink-900">
        {main}
        {isRange && <sup className="ml-0.5 text-[11px] text-warning">†</sup>}
      </span>
      {isRange && <p className="mt-1 text-[11px] text-ink-500">区间分，评议小组定夺</p>}
      {/* 计分明细（如 校级及以上 ×2、院级 ×1 / 志愿时长折算），routeTo 项的说明在系统节点列展示 */}
      {item.note && !item.routeTo && (
        <p className="mt-1 max-w-[220px] text-[11px] leading-snug text-ink-500">{item.note}</p>
      )}
    </div>
  )
}

/** 系统节点列：route_to 项显示“系统其他项” */
function NodeCell({ item }: { item: SessionItem }) {
  if (item.routeTo) {
    return (
      <p className="flex items-start gap-1 text-caption text-ink-500">
        <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
        <span>
          系统其他项 · 将填入“{item.routeTo}”栏
        </span>
      </p>
    )
  }
  if (!item.systemNode) {
    return <p className="text-caption text-ink-300">系统栏位待开放</p>
  }
  return <p className="font-mono text-[12px] leading-relaxed text-ink-500">{item.systemNode}</p>
}

/** 佐证列 */
function EvidenceCell({ item, uploaded }: { item: SessionItem; uploaded: boolean }) {
  if (uploaded) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line bg-success-soft">
          <Image className="h-4 w-4 text-success" />
        </span>
        <span className="text-caption text-success">已存本地 ✓</span>
      </div>
    )
  }
  if (item.evidence.suggested) {
    return (
      <p className="text-caption text-warning">
        建议准备：{item.evidence.suggested}
      </p>
    )
  }
  return <span className="text-caption text-ink-300">无需佐证</span>
}

function backToWizard(item: SessionItem) {
  return `/wizard?item=${encodeURIComponent(item.itemRef)}`
}

export default function ModuleGroup({
  session,
  moduleName,
  moduleIndex,
  items,
  evidenceKeys,
  defaultOpen = true,
}: ModuleGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  const color = moduleColor(moduleName)
  const subtotal = moduleSubtotal(session, moduleName)
  const isUploaded = (it: SessionItem) => it.evidence.uploaded || evidenceKeys.has(it.itemRef)

  return (
    <motion.section
      id={`module-${moduleName}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-32"
    >
      {/* 分组标题行 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center gap-3 rounded-[10px] px-1 py-3 text-left"
      >
        <span className="h-8 w-[3px] rounded-full" style={{ backgroundColor: color }} />
        <span className="label-mono" style={{ color }}>
          MODULE {String(moduleIndex + 1).padStart(2, '0')}
        </span>
        <h2 className="text-title-sm text-ink-900">{moduleDisplayName(moduleName)}</h2>
        <span className="ml-auto font-mono text-[15px] font-semibold text-ink-700">
          小计 {typeof subtotal === 'number' ? formatNumber(subtotal) : subtotal}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-ink-500 transition-transform duration-300 print:hidden',
            !open && '-rotate-90',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* 桌面端：五列表格 */}
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-y border-line text-left">
                    <th className="w-[30%] py-2.5 pr-4 label-mono text-ink-500 font-medium">填报项</th>
                    <th className="w-[18%] border-l border-line px-4 py-2.5 label-mono text-ink-500 font-medium">预填值</th>
                    <th className="w-[22%] border-l border-line px-4 py-2.5 label-mono text-ink-500 font-medium">系统节点</th>
                    <th className="w-[18%] border-l border-line px-4 py-2.5 label-mono text-ink-500 font-medium">佐证材料</th>
                    <th className="w-[12%] border-l border-line pl-4 py-2.5 label-mono text-ink-500 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={item.itemRef}
                      className={cn(
                        'group/row border-b border-line transition-colors hover:bg-paper-100',
                        i % 2 === 1 && 'bg-[#F7F2E9]',
                      )}
                    >
                      <td className="min-h-14 py-3 pr-4 align-top">
                        <ItemCell item={item} />
                        <Link
                          to={backToWizard(item)}
                          className="mt-1 hidden items-center gap-1 text-[12px] text-primary group-hover/row:inline-flex print:hidden"
                        >
                          <PencilLine className="h-3 w-3" />
                          回改
                        </Link>
                      </td>
                      <td className="border-l border-line px-4 py-3 align-top">
                        <ScoreCell item={item} />
                      </td>
                      <td className="border-l border-line px-4 py-3 align-top">
                        <NodeCell item={item} />
                        {item.routeTo && (
                          <p className="mt-1.5 text-[11px] italic leading-snug text-ink-500">
                            得分说明：本项按细则原文计入，系统无对应栏位，已生成说明供粘贴。
                            {item.note ? ` ${item.note}` : ''}
                          </p>
                        )}
                      </td>
                      <td className="border-l border-line px-4 py-3 align-top">
                        <EvidenceCell item={item} uploaded={isUploaded(item)} />
                      </td>
                      <td className="border-l border-line py-3 pl-4 align-top">
                        <StampBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 移动端：逐条卡片 */}
            <div className="space-y-3 md:hidden">
              {items.map((item) => (
                <MobileItemCard key={item.itemRef} item={item} uploaded={isUploaded(item)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 打印时始终展开（不受折叠状态影响） */}
      {!open && (
        <div className="hidden print:block">
          <table className="w-full border-collapse">
            <tbody>
              {items.map((item) => (
                <tr key={item.itemRef} className="border-b border-line">
                  <td className="py-2 pr-4 text-[13px]">{item.name}</td>
                  <td className="py-2 pr-4 font-mono text-[13px]">{formatScore(item.score).main}</td>
                  <td className="py-2 text-[12px] text-ink-500">
                    {item.routeTo ? `系统其他项（${item.routeTo}栏）` : item.systemNode ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  )
}

/** 移动端卡片：预填值在上，节点/佐证/状态在下，点击展开详情 */
function MobileItemCard({ item, uploaded }: { item: SessionItem; uploaded: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-[14px] border border-line bg-card p-4 shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-body font-medium text-ink-900">{item.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-500">
            {moduleDisplayName(item.module)}
          </p>
        </div>
        <ScoreCell item={item} />
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
        <NodeCell item={item} />
        <EvidenceCell item={item} uploaded={uploaded} />
        <StampBadge status={item.status} className="ml-auto" />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <blockquote className="mt-3 border-l-2 border-line bg-paper-100 px-3 py-2 text-caption text-ink-500">
              {item.sourceQuote}
            </blockquote>
            {item.routeTo && (
              <p className="mt-2 text-[11px] italic leading-snug text-ink-500">
                得分说明：本项按细则原文计入，系统无对应栏位，已生成说明供粘贴。
                {item.note ? ` ${item.note}` : ''}
              </p>
            )}
            <Link
              to={backToWizard(item)}
              className="mt-2 inline-flex items-center gap-1 text-[13px] text-primary"
            >
              <PencilLine className="h-3.5 w-3.5" />
              回改本题
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
