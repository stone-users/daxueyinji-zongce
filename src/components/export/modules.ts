/** 七大模块元信息（顺序 + 主题色），与设计系统 §2.3 对齐 */

export interface ModuleMeta {
  key: string
  color: string
}

export const MODULE_META: ModuleMeta[] = [
  { key: '德育', color: '#7A5C8E' },
  { key: '智育', color: '#2E5A87' },
  { key: '体育', color: '#5E8C61' },
  { key: '学术科研', color: '#8A6D3B' },
  { key: '组织管理', color: '#C08051' },
  { key: '劳动实践', color: '#4F8A8B' },
  { key: '美育', color: '#B06B7D' },
]

const FALLBACK_COLOR = '#22303E'

export function moduleColor(name: string): string {
  const hit = MODULE_META.find((m) => name.includes(m.key) || m.key.includes(name))
  return hit ? hit.color : FALLBACK_COLOR
}

/** 按设计顺序排列会话中出现的模块，未知模块排末尾 */
export function orderedModules(names: string[]): string[] {
  const known = MODULE_META.map((m) => m.key).filter((k) =>
    names.some((n) => n === k || n.includes(k)),
  )
  const unknown = names.filter(
    (n) => !known.some((k) => n === k || n.includes(k)),
  )
  // known 里实际匹配到的原始名
  const matched = known
    .map((k) => names.find((n) => n === k || n.includes(k))!)
    .filter(Boolean)
  return [...matched, ...unknown]
}

export function moduleIndex(name: string, all: string[]): string {
  const idx = all.indexOf(name)
  return `MODULE ${String(idx + 1).padStart(2, '0')}`
}
