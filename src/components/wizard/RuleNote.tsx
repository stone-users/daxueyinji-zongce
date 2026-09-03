import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 细则依据折叠条：每题底部展示规则包 source_quote 原文 */
export default function RuleNote({ quote, extra }: { quote?: string; extra?: string[] }) {
  const [open, setOpen] = useState(false)
  if (!quote && !extra?.length) return null
  return (
    <div className="mt-4 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-caption text-ink-500 transition-colors hover:text-ink-700"
      >
        <ScrollText className="h-3.5 w-3.5" />
        细则原文依据
        <ChevronDown className={cn('ml-auto h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
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
            <div className="mt-2 rounded-[10px] bg-paper-100 px-4 py-3">
              {quote && <blockquote className="font-serif text-[14px] leading-relaxed text-ink-700">「{quote}」</blockquote>}
              {extra?.map((line, i) => (
                <p key={i} className="mt-1.5 text-caption text-ink-500">
                  · {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
