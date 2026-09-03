import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Lock, Paperclip, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteEvidence, getEvidence, putEvidence } from '@/engine/session'

/** 佐证上传条：可选、仅存本地（IndexedDB）、不传不阻塞 */
export default function EvidenceUploader({
  itemRef,
  suggested,
  onChange,
}: {
  itemRef: string
  suggested?: string[]
  onChange?: (uploaded: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let revoke: string | null = null
    getEvidence(itemRef).then((blob) => {
      if (blob) {
        revoke = URL.createObjectURL(blob)
        setUrl(revoke)
      }
    })
    return () => {
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [itemRef])

  const upload = async (file: File) => {
    await putEvidence(itemRef, file)
    if (url) URL.revokeObjectURL(url)
    setUrl(URL.createObjectURL(file))
    onChange?.(true)
    setOpen(true)
  }

  const remove = async () => {
    await deleteEvidence(itemRef)
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    onChange?.(false)
  }

  return (
    <div className="mt-4 rounded-[10px] border border-dashed border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-caption text-ink-500 transition-colors hover:text-ink-700"
      >
        <Paperclip className="h-3.5 w-3.5" />
        上传佐证（可选）
        <span className="inline-flex items-center gap-1 text-success">
          <Lock className="h-3 w-3" />
          仅存本地
        </span>
        {url && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[11px] text-success">已存 1 张</span>}
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
            <div className="px-3.5 pb-3.5">
              {suggested?.length ? (
                <p className="mb-2 text-caption text-ink-500">建议材料：{suggested.join('、')}</p>
              ) : null}
              {url ? (
                <div className="flex items-start gap-3">
                  <img src={url} alt="佐证材料" className="h-20 w-20 rounded-[8px] border border-line object-cover" />
                  <button
                    type="button"
                    onClick={remove}
                    className="inline-flex items-center gap-1 rounded-[8px] border border-line px-2.5 py-1.5 text-caption text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 删除
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1.5 rounded-[10px] border border-dashed border-line bg-paper-50 px-4 py-5 text-caption text-ink-500 transition-colors hover:border-primary hover:text-primary"
                >
                  <Paperclip className="h-4 w-4" />
                  点击选择图片（不会上传到任何服务器）
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void upload(f)
                  e.target.value = ''
                }}
              />
              <p className="mt-2 text-[12px] leading-relaxed text-ink-300">
                佐证只保存在你的浏览器里，不上传；不传也不影响继续填报，导出清单里会提醒你带上。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
