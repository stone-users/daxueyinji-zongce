import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionHeadingProps {
  index: string
  title: string
  lead?: ReactNode
}

/** 帮助页各区块统一的标题组：label-mono 编号 + title-md 标题 + 可选导语 */
export default function SectionHeading({ index, title, lead }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="label-mono text-seal">SECTION {index}</span>
      <h2 className="mt-3 text-title-md text-ink-900">{title}</h2>
      {lead && <p className="mt-4 text-body-lg text-ink-700">{lead}</p>}
    </motion.div>
  )
}
