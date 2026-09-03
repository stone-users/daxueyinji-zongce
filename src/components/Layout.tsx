import { Outlet, useLocation } from 'react-router'
import Navbar from '@/components/Navbar'
import { navbarVariantFor } from '@/lib/navbar'
import Footer from '@/components/Footer'

/**
 * 全站布局（嵌套路由模式：渲染 <Outlet/>，App.tsx 中使用子路由）。
 * Navbar 为 sticky 正常文档流，页面无需额外顶部偏移。
 * Footer 仅在营销版页面（首页 / 帮助页）显示。
 */
export default function Layout() {
  const { pathname } = useLocation()
  const isMarketing = navbarVariantFor(pathname) === 'marketing'

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {isMarketing && <Footer />}
    </div>
  )
}
