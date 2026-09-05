import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileText, Lock, Paperclip, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteEvidence, getEvidence, putEvidence } from '@/engine/session'

interface StoredFile {
  url: string
  name: string
  isImage: boolean
}

function toStored(blob: Blob, url: string): StoredFile {
  // IndexedDB 结构化克隆会保留 File 的 name/type；非 File 的 Blob 退化为通用文件名
  const name = 'name' in blob && typeof (blob as File).name === 'string' ? (blob as File).name : '佐证文件'
  return { url, name, isImage: blob.type.startsWith('image/') }
}

/** 佐证上传条：可选、仅存本地（IndexedDB）、不传不阻塞；支持图片 / PDF / Word 等常见格式 */
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
  const [file, setFile] = useState<StoredFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let revoke: string | null = null
    getEvidence(itemRef).then((blob) => {
      if (blob) {
        revoke = URL.createObjectURL(blob)
        setFile(toStored(blob, revoke))
      }
    })
    return () => {
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [itemRef])

  const upload = async (f: File) => {
    // 存原始 File（Blob 子类），IndexedDB 对图片/文档一视同仁
    await putEvidence(itemRef, f)
    if (file) URL.revokeObjectURL(file.url)
    setFile(toStored(f, URL.createObjectURL(f)))
    onChange?.(true)
    setOpen(true)
  }

  const remove = async () => {
    await deleteEvidence(itemRef)
    if (file) URL.revokeObjectURL(file.url)
    setFile(null)
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
        {file && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[11px] text-success">已存 1 份</span>}
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
              {file ? (
                <div className="flex items-start gap-3">
                  {file.isImage ? (
                    <img src={file.url} alt="佐证材料" className="h-20 w-20 rounded-[8px] border border-line object-cover" />
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex max-w-[240px] items-center gap-2 rounded-[8px] border border-line bg-paper-50 px-3 py-2.5 text-caption text-ink-700 transition-colors hover:border-primary hover:text-primary"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </a>
                  )}
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
                  点击选择文件（不会上传到任何服务器）
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void upload(f)
                  e.target.value = ''
                }}
              />
              <p className="mt-2 text-[12px] leading-relaxed text-ink-300">
                支持图片、PDF、Word 等格式。佐证只保存在你的浏览器里，不上传；不传也不影响继续填报，导出清单里会提醒你带上。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
