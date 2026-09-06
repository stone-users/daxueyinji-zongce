import { useState } from 'react'
import { Archive, Download, File, FileText, Image } from 'lucide-react'
import type { EvidenceFile } from './evidence'
import { moduleColor, moduleDisplayName } from './modules'

/** 题目元信息：itemRef 稳定段（模块/章节/条目名，不含引擎序号）→ 模块中文名 + 题目名 */
export interface QuestionMeta {
  moduleName: string
  title: string
}

const stripSeq = (id: string) => id.replace(/#\d+$/, '').replace(/\[\d+\]$/, '')

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <Image className="h-4 w-4 shrink-0 text-ink-500" />
  if (type === 'application/pdf' || type.includes('word') || type.includes('text')) return <FileText className="h-4 w-4 shrink-0 text-ink-500" />
  return <File className="h-4 w-4 shrink-0 text-ink-500" />
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** zip 内路径净化：去掉文件系统非法字符 */
const safePath = (s: string) => s.replace(/[\\/:*?"<>|#]+/g, '_').trim() || '未命名'

/**
 * 佐证材料清单：按 模块中文名 → 题目 分组列出 IndexedDB 中已上传的佐证，
 * 单个可下载，顶部可整体打包 zip（目录结构：模块名/题目名/文件名）。
 * 未传任何佐证时整块不渲染。
 */
export default function EvidenceList({
  files,
  qMeta,
  college,
}: {
  files: EvidenceFile[]
  qMeta: Map<string, QuestionMeta>
  college: string
}) {
  const [zipping, setZipping] = useState(false)
  if (files.length === 0) return null

  // 分组：模块 → 题目 → 文件（保持首次出现顺序；无元信息的归入「其他」）
  const groups: { module: string; questions: { title: string; files: EvidenceFile[] }[] }[] = []
  for (const f of files) {
    const meta = qMeta.get(stripSeq(f.key))
    const moduleName = meta ? moduleDisplayName(meta.moduleName) : '其他'
    const title = meta?.title ?? f.key
    let g = groups.find((x) => x.module === moduleName)
    if (!g) {
      g = { module: moduleName, questions: [] }
      groups.push(g)
    }
    let qq = g.questions.find((x) => x.title === title)
    if (!qq) {
      qq = { title, files: [] }
      g.questions.push(qq)
    }
    qq.files.push(f)
  }

  const downloadZip = async () => {
    setZipping(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const g of groups) {
        for (const qq of g.questions) {
          for (const f of qq.files) {
            zip.file(`${safePath(g.module)}/${safePath(qq.title)}/${safePath(f.name)}`, f.blob)
          }
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `佐证材料-${college}.zip`)
    } catch {
      // jszip 不可用/打包失败时退化为逐个下载
      for (const f of files) downloadBlob(f.blob, f.name)
    } finally {
      setZipping(false)
    }
  }

  return (
    <section className="mt-10 rounded-[16px] border border-line bg-card p-5 shadow-card sm:p-6 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-title-sm text-ink-900">佐证材料清单</h2>
        <span className="text-caption text-ink-500">共 {files.length} 份，仅存本机浏览器</span>
        <button
          type="button"
          disabled={zipping}
          onClick={() => void downloadZip()}
          className="ml-auto inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-40"
        >
          <Archive className="h-4 w-4" />
          {zipping ? '打包中…' : '全部打包下载（.zip）'}
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {groups.map((g) => (
          <div key={g.module}>
            <p className="flex items-center gap-1.5 label-mono text-ink-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moduleColor(g.module) }} />
              {g.module}
            </p>
            <div className="mt-2 space-y-3">
              {g.questions.map((qq) => (
                <div key={qq.title} className="rounded-[12px] bg-paper-100 px-4 py-3">
                  <p className="text-body font-medium text-ink-900">{qq.title}</p>
                  <ul className="mt-2 space-y-1.5">
                    {qq.files.map((f) => (
                      <li key={f.key}>
                        <button
                          type="button"
                          onClick={() => downloadBlob(f.blob, f.name)}
                          className="group flex w-full items-center gap-2 rounded-[8px] border border-line bg-card px-3 py-2 text-left transition-colors hover:border-primary"
                        >
                          <FileIcon type={f.type} />
                          <span className="min-w-0 flex-1 truncate text-caption text-ink-700">{f.name}</span>
                          <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-300">{formatSize(f.size)}</span>
                          <Download className="h-3.5 w-3.5 shrink-0 text-ink-300 transition-colors group-hover:text-primary" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
