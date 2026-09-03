import type { ReactNode } from 'react'

/** 章节标题：label-mono 英文小标 + 衬线大标题 + 印章红 40px 下划线 */
export default function SectionHeading({
  overline,
  title,
}: {
  overline?: string
  title: ReactNode
}) {
  return (
    <div>
      {overline && <span className="label-mono text-ink-500">{overline}</span>}
      <h2 className="mt-2 text-title-md text-ink-900">{title}</h2>
      <span className="mt-3 block h-[3px] w-10 rounded-full bg-seal" />
    </div>
  )
}
