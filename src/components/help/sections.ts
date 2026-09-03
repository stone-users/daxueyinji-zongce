/** 帮助页章节清单：供目录（HelpToc）与章节标题共用 id */

export interface HelpSection {
  id: string
  label: string
}

export const HELP_SECTIONS: HelpSection[] = [
  { id: 'getting-started', label: '上手三步' },
  { id: 'privacy', label: '隐私与数据' },
  { id: 'rule-versions', label: '规则包版本' },
  { id: 'disclaimer', label: '免责与边界' },
  { id: 'faq', label: '常见问题' },
  { id: 'about', label: '关于我们' },
]
