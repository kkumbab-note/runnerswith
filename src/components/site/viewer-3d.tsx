import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/site/logo"
import { useMotion } from "@/hooks/use-motion"
import type { ProductId } from "@/lib/products"
import type { Viewer } from "@/lib/viewer3d"

type Status = "loading" | "ready" | "webgl" | "error"

const STATUS_TEXT: Record<Exclude<Status, "ready">, string> = {
  loading: "3D 모델을 준비하고 있어요…",
  webgl: "이 기기에서는 3D 보기를 지원하지 않아요. 사진으로 확인해 주세요.",
  error: "3D 뷰어를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.",
}

export function Viewer3D({ productId, name }: { productId: ProductId; name: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const { paused } = useMotion()
  const [spin, setSpin] = useState(!paused)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    let cancelled = false
    let viewer: Viewer | null = null
    setStatus("loading")
    import("@/lib/viewer3d")
      .then(({ createViewer }) => {
        if (cancelled || !hostRef.current) return
        try {
          viewer = createViewer(hostRef.current, productId, { spin: !paused })
          viewerRef.current = viewer
          setStatus("ready")
        } catch (err) {
          setStatus(err instanceof Error && err.message === "webgl" ? "webgl" : "error")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
      viewer?.dispose()
      viewerRef.current = null
    }
    // 모델은 제품이 바뀔 때만 다시 만들어요. 회전 여부는 아래 효과가 맞춰요
  }, [productId])

  useEffect(() => {
    viewerRef.current?.setSpin(spin)
  }, [spin])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const v = viewerRef.current
    if (!v) return
    const actions: Record<string, () => void> = {
      ArrowLeft: () => v.rotate(-0.26),
      ArrowRight: () => v.rotate(0.26),
      "+": () => v.zoom(0.88),
      "=": () => v.zoom(0.88),
      "-": () => v.zoom(1.14),
      Home: () => v.reset(),
    }
    const action = actions[e.key]
    if (!action) return
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  return (
    <div className="relative aspect-[4/5] max-h-[min(70vh,640px)] w-full bg-muted">
      <div
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-roledescription="3D 뷰어"
        aria-label={`${name} 3D 모델. 화살표 왼쪽·오른쪽 키로 회전하고, 플러스·마이너스 키로 확대하거나 축소해요.`}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-grab touch-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset active:cursor-grabbing"
      />
      {status !== "ready" ? (
        <div role="status" className="pointer-events-none absolute inset-0 grid place-content-center gap-3 p-6 text-center text-sm text-muted-foreground">
          <LogoMark className="mx-auto h-6 animate-pulse" />
          {STATUS_TEXT[status]}
        </div>
      ) : null}
      <p aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 hidden text-xs text-muted-foreground sm:block">
        드래그해서 360° 돌리고, 휠이나 두 손가락으로 확대해요
      </p>
      <div className="absolute right-3 bottom-3 flex gap-2">
        <Button variant="outline" size="sm" aria-pressed={spin} onClick={() => setSpin((s) => !s)} className="bg-background">
          {spin ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
          자동 회전
        </Button>
        <Button variant="outline" size="sm" onClick={() => viewerRef.current?.reset()} className="bg-background">
          <RotateCcw data-icon="inline-start" />
          시점 초기화
        </Button>
      </div>
    </div>
  )
}
