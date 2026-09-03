import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HeaderSection from '@/components/export/HeaderSection'
import AnchorNav from '@/components/export/AnchorNav'
import ModuleGroup from '@/components/export/ModuleGroup'
import PendingSummary from '@/components/export/PendingSummary'
import Disclaimer from '@/components/export/Disclaimer'
import EmptyState from '@/components/export/EmptyState'
import ConfirmModal from '@/components/export/ConfirmModal'
import ToastStack, { type ToastData } from '@/components/export/Toast'
import { buildDemoSession } from '@/components/export/demoSession'
import { loadEvidenceKeys } from '@/components/export/evidence'
import { buildPlainText, downloadSessionJson } from '@/components/export/exporters'
import { orderedModules } from '@/components/export/modules'
import {
  clearSession,
  loadSession,
  saveSession,
  totalReferenceScore,
  type ZongceSession,
} from '@/components/export/session'

/** 打印样式：隐藏导航/按钮，表格全宽，页脚加免责首行 */
const PRINT_CSS = `
@media print {
  header, footer, .print\:hidden { display: none !important; }
  body { background: #fff !important; background-image: none !important; }
  main { padding: 0 !important; }
  .export-root { max-width: 100% !important; padding: 0 !important; }
  table { width: 100% !important; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  section { page-break-inside: avoid; }
  a { color: inherit !important; text-decoration: none !important; }
  .export-print-footer {
    display: block !important;
    margin-top: 24px; padding-top: 8px;
    border-top: 1px solid #999;
    font-size: 11px; color: #333;
  }
}
`

export default function Export() {
  const [session, setSession] = useState<ZongceSession | null>(() => loadSession())
  const [evidenceKeys, setEvidenceKeys] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [exported, setExported] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const toastSeq = useRef(0)

  useEffect(() => {
    let alive = true
    loadEvidenceKeys().then((keys) => {
      if (alive) setEvidenceKeys(keys)
    })
    return () => {
      alive = false
    }
  }, [])

  const pushToast = useCallback((message: string) => {
    const id = ++toastSeq.current
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  const modules = useMemo(
    () => (session ? orderedModules(Array.from(new Set(session.items.map((i) => i.module)))) : []),
    [session],
  )

  const counts = useMemo(() => {
    if (!session) return { total: 0, confirmed: 0, pendingReview: 0, needsEvidence: 0 }
    return {
      total: session.items.length,
      confirmed: session.items.filter((i) => i.status === 'ok').length,
      pendingReview: session.items.filter((i) => i.status === 'pending_review').length,
      needsEvidence: session.items.filter((i) => i.status === 'needs_evidence').length,
    }
  }, [session])

  const totalScore = useMemo(() => (session ? totalReferenceScore(session) : 0), [session])

  const handleExportJson = useCallback(() => {
    if (!session) return
    downloadSessionJson(session)
    setExported(true)
    window.setTimeout(() => setExported(false), 1800)
    pushToast('清单已导出。它同时是浏览器插件预填的数据源。')
  }, [session, pushToast])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleCopy = useCallback(async () => {
    if (!session) return
    const text = buildPlainText(session)
    try {
      await navigator.clipboard.writeText(text)
      pushToast('已复制')
    } catch {
      // 剪贴板 API 不可用时的兜底
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      pushToast('已复制')
    }
  }, [session, pushToast])

  const handleClear = useCallback(() => {
    clearSession()
    setSession(null)
    setConfirmClear(false)
    pushToast('本地数据已清空')
  }, [pushToast])

  const handleRestore = useCallback(
    (restored: ZongceSession) => {
      saveSession(restored)
      setSession(restored)
      pushToast('暂存文件已导入')
    },
    [pushToast],
  )

  const handleLoadDemo = useCallback(() => {
    const demo = buildDemoSession()
    saveSession(demo)
    setSession(demo)
    pushToast('已载入演示数据（保险学院 · 12 项）')
  }, [pushToast])

  return (
    <div className="export-root mx-auto max-w-export px-4 pb-20 sm:px-6">
      <style>{PRINT_CSS}</style>

      {!session ? (
        <EmptyState
          onRestore={handleRestore}
          onLoadDemo={handleLoadDemo}
          onError={pushToast}
        />
      ) : (
        <>
          <HeaderSection
            session={session}
            modules={modules}
            counts={counts}
            totalScore={totalScore}
            exported={exported}
            onExportJson={handleExportJson}
            onPrint={handlePrint}
            onCopy={handleCopy}
            onClear={() => setConfirmClear(true)}
          />

          <AnchorNav
            modules={modules}
            pendingReview={counts.pendingReview}
            needsEvidence={counts.needsEvidence}
          />

          <div className="mt-6 space-y-8">
            {modules.map((m, idx) => (
              <ModuleGroup
                key={m}
                session={session}
                moduleName={m}
                moduleIndex={idx}
                items={session.items.filter((i) => i.module === m)}
                evidenceKeys={evidenceKeys}
              />
            ))}
          </div>

          <div className="mt-10 space-y-6">
            <PendingSummary
              pendingReview={session.items.filter((i) => i.status === 'pending_review')}
              needsEvidence={session.items.filter((i) => i.status === 'needs_evidence')}
            />
            <Disclaimer session={session} />
          </div>

          {/* 打印页脚：页码 + 免责首行 */}
          <div className="export-print-footer hidden">
            {session.college} · {session.grade} · {session.evalYear} ｜
            标注「待评议确认」的项目及所有区间分值，最终由评议小组认定。本工具与学校官方系统无关。
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmClear}
        title="清空本地数据？"
        body="将删除浏览器中保存的问卷暂存与清单数据（佐证图片除外，可在浏览器设置中清除）。此操作不可撤销，建议先导出 JSON。"
        confirmLabel="确认清空"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
      <ToastStack toasts={toasts} />
    </div>
  )
}
