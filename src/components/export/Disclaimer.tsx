import { Link } from 'react-router'
import type { ZongceSession } from './session'

/** 免责说明块（页尾，固定存在）。文案按 export.md §6：规则包 v0.2（2026-09-04 更新）。 */
export default function Disclaimer({ session }: { session: ZongceSession }) {
  return (
    <section className="rounded-[16px] border border-line bg-paper-100 p-5 sm:p-6">
      <h2 className="text-title-sm text-ink-900">郑重说明</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-caption leading-relaxed text-ink-500">
        <li>
          本清单由「大学印记 · 综测助手」依据【{session.packSourceDoc}】规则包{' '}
          {session.packVersion || 'v0.2'}（2026-09-04 更新）生成。
        </li>
        <li>
          标注「待评议确认」的项目及所有区间分值，<strong className="text-ink-700">最终由评议小组认定</strong>。
        </li>
        <li>佐证材料请按学院要求备查原件；本工具存储的图片仅存于你的浏览器本地。</li>
        <li>本工具为第三方辅助工具，与学校官方系统无关；请以学校系统最终提交结果为准。</li>
      </ul>
      <p className="mt-4 border-t border-line pt-3 text-caption text-ink-500">
        有疑问？阅读{' '}
        <Link to="/help" className="text-primary underline-offset-2 hover:underline">
          帮助与隐私说明 →
        </Link>
      </p>
    </section>
  )
}
