/** 帮助页锚点目录条目（S1–S6），桌面端粘性侧栏 / 移动端顶部横滚共用 */
export interface HelpSection {
  id: string
  label: string
  /** label-mono 编号 */
  index: string
}

export const HELP_SECTIONS: HelpSection[] = [
  { id: 'getting-started', label: '上手指南', index: '01' },
  { id: 'privacy', label: '隐私说明', index: '02' },
  { id: 'rule-versions', label: '规则包版本', index: '03' },
  { id: 'disclaimer', label: '定级与免责', index: '04' },
  { id: 'faq', label: '常见问题', index: '05' },
  { id: 'about', label: '关于与登记', index: '06' },
]
