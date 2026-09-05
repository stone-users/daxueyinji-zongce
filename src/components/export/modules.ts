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

/** 旧版会话里模块字段存的是模块 id（deyu 等），展示层一律兜底映射为中文名 */
export const MODULE_ID_NAME: Record<string, string> = {
  deyu: '德育',
  zhiyu: '智育',
  tiyu: '体育',
  xueshu: '学术科研',
  zuzhi: '组织管理',
  laodong: '劳动实践',
  meiyu: '美育',
}

export function moduleDisplayName(name: string): string {
  return MODULE_ID_NAME[name] ?? name
}

export function moduleColor(name: string): string {
  const cn = moduleDisplayName(name)
  const hit = MODULE_META.find((m) => cn.includes(m.key) || m.key.includes(cn))
  return hit ? hit.color : FALLBACK_COLOR
}

/** 按设计顺序排列会话中出现的模块，未知模块排末尾 */
export function orderedModules(names: string[]): string[] {
  const key = (n: string) => moduleDisplayName(n)
  const known = MODULE_META.map((m) => m.key).filter((k) =>
    names.some((n) => key(n) === k || key(n).includes(k)),
  )
  const unknown = names.filter(
    (n) => !known.some((k) => key(n) === k || key(n).includes(k)),
  )
  // known 里实际匹配到的原始名
  const matched = known
    .map((k) => names.find((n) => key(n) === k || key(n).includes(k))!)
    .filter(Boolean)
  return [...matched, ...unknown]
}

export function moduleIndex(name: string, all: string[]): string {
  const idx = all.indexOf(name)
  return `MODULE ${String(idx + 1).padStart(2, '0')}`
}
