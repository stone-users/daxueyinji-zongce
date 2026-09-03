import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/** 等宽数字滚动（digit-roll）：值变化或首次挂载时 600ms 滚到位 */
export default function DigitRoll({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 0.6,
  delay = 0,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(() => format(0))
  const prev = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(format(value))
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
    })
    prev.current = value
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce])

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </span>
  )
}
