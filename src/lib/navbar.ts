export type NavbarVariant = 'marketing' | 'compact'

/** 按路由推断导航形态：首页/帮助页用营销版，向导/导出页用精简版 */
export function navbarVariantFor(pathname: string): NavbarVariant {
  return pathname === '/' || pathname === '/help' ? 'marketing' : 'compact'
}
