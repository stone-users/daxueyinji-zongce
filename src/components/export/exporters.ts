import type { ZongceSession } from './session'
import { formatScore, moduleSubtotal } from './session'
import { orderedModules, moduleDisplayName } from './modules'

/** 导出 JSON 文件名：综测填报清单-〈学院〉-〈学年〉.json */
export function exportFilename(session: ZongceSession): string {
  const safe = (s: string) => s.replace(/[\\/:*?"<>|\s]+/g, '')
  return `综测填报清单-${safe(session.college)}-${safe(session.evalYear)}.json`
}

/** 触发 Blob 下载 */
export function downloadSessionJson(session: ZongceSession) {
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = exportFilename(session)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const STATUS_LABEL: Record<string, string> = {
  ok: '已确认',
  pending_review: '待评议确认',
  needs_evidence: '待补材料',
  external: '端口待填',
}

/** 生成纯文本清单（供复制到剪贴板） */
export function buildPlainText(session: ZongceSession): string {
  const lines: string[] = []
  lines.push(`综测填报清单 · ${session.college} · ${session.grade} · ${session.evalYear}`)
  lines.push(`依据：${session.packSourceDoc} 规则包 ${session.packVersion}（2026-09-04 更新）`)
  lines.push('')

  const modules = orderedModules(Array.from(new Set(session.items.map((i) => i.module))))
  modules.forEach((m, idx) => {
    const items = session.items.filter((i) => i.module === m)
    const sub = moduleSubtotal(session, m)
    lines.push(`■ ${String(idx + 1).padStart(2, '0')} ${moduleDisplayName(m)}（小计 ${sub}）`)
    for (const it of items) {
      const { main, isRange } = formatScore(it.score)
      const node = it.routeTo ? `系统其他项（${it.routeTo}栏）` : it.systemNode ?? '系统栏位待开放'
      const ev = it.evidence.uploaded
        ? '已存本地'
        : it.evidence.suggested
          ? `待补：${it.evidence.suggested}`
          : '无需佐证'
      lines.push(
        `  · ${it.name} ｜ 预填值 ${main}${isRange ? '（区间分，评议小组定夺）' : ''} ｜ ${node} ｜ 佐证：${ev} ｜ ${STATUS_LABEL[it.status] ?? it.status}`,
      )
      if (it.note) lines.push(`    备注：${it.note}`)
    }
    lines.push('')
  })

  lines.push('—— 郑重说明 ——')
  lines.push('标注「待评议确认」的项目及所有区间分值，最终由评议小组认定。')
  lines.push('本工具为第三方辅助工具，与学校官方系统无关；请以学校系统最终提交结果为准。')
  return lines.join('\n')
}
