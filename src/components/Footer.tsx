import { Link } from 'react-router'
import { HardDrive } from 'lucide-react'

const SUPPORTED_COLLEGES = [
  '保险学院',
  '金融学院',
  '财政税务学院',
  '国际经济与贸易学院',
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-paper-100">
      <div className="mx-auto grid max-w-marketing grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 品牌宣言 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo-seal.svg" alt="" className="h-8 w-8 rounded-md" />
            <span className="font-serif text-[18px] font-bold text-ink-900">大学印记</span>
          </div>
          <p className="text-body text-ink-700">
            把几十页细则，变成几分钟问答。
          </p>
          <p className="label-mono text-ink-300">CUFE · SCORE ENGINE</p>
        </div>

        {/* 页面导航 */}
        <div>
          <h3 className="mb-4 text-title-sm text-ink-900">页面导航</h3>
          <ul className="space-y-2.5 text-body text-ink-700">
            <li><Link className="transition-colors hover:text-primary" to="/">首页</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/wizard">问卷向导</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/export">导出清单</Link></li>
            <li><Link className="transition-colors hover:text-primary" to="/help">帮助与隐私</Link></li>
          </ul>
        </div>

        {/* 支持学院状态 */}
        <div>
          <h3 className="mb-4 text-title-sm text-ink-900">支持学院</h3>
          <ul className="space-y-2.5 text-body text-ink-700">
            {SUPPORTED_COLLEGES.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {c}
                <span className="label-mono text-success">已支持</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 隐私承诺 */}
        <div>
          <h3 className="mb-4 text-title-sm text-ink-900">隐私承诺</h3>
          <div className="flex items-start gap-2.5 text-body text-ink-700">
            <HardDrive className="mt-1 h-4 w-4 shrink-0 text-success" />
            <p>
              数据只存在你的浏览器里。没有账号、没有上传，导出与清空都由你决定。
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-marketing px-4 py-5 text-caption text-ink-500 sm:px-6">
          本工具为第三方辅助填报工具，定级与得分最终以各学院评议小组认定为准。
        </p>
      </div>
    </footer>
  )
}
