import { useEffect, useRef, useState, type ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** 화면에 들어올 때 8px 떠오르며 나타나요. 동작 줄이기 설정이면 바로 보여요 */
export function Reveal({ className, delay = 0, style, ...props }: ComponentProps<"div"> & { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-visible={visible}
      className={cn("reveal", className)}
      style={{ transitionDelay: `${delay * 80}ms`, ...style }}
      {...props}
    />
  )
}
