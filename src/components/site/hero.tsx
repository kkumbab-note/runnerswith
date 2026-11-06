import { useEffect, useRef } from "react"
import { ArrowDownRight, ArrowUpRight, Pause, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/reveal"
import { useSite } from "@/components/site/site-context"
import { useMotion } from "@/hooks/use-motion"
import { asset } from "@/lib/config"

/** 히어로 브랜드 영상: 모션이 켜져 있고 화면에 보일 때만 재생해요. 데이터 절약 모드면 직접 재생을 눌러야 움직여요 */
function useHeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const visible = useRef(true)
  const { paused, userStarted } = useMotion()

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    const sync = () => {
      if (!paused && visible.current && (!saveData || userStarted)) {
        video.play().catch(() => {
          // 자동재생이 막히면 포스터를 그대로 보여줘요
        })
      } else {
        video.pause()
      }
    }
    sync()
    const io = new IntersectionObserver(([entry]) => {
      visible.current = Boolean(entry?.isIntersecting)
      sync()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [paused, userStarted])

  return ref
}

export function Hero() {
  const { openProduct, prefillOrder } = useSite()
  const { paused, toggle } = useMotion()
  const videoRef = useHeroVideo()

  return (
    <section id="top" data-nav="" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pt-24">
        <Reveal className="lg:col-span-6">
          <Badge variant="outline" className="h-6 gap-2 px-2.5 font-mono">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            2026 F/W · Shoes, Apparel, Gear
          </Badge>
          <h1
            id="hero-title"
            lang="en"
            className="mt-6 text-6xl leading-[0.95] font-semibold tracking-tighter text-balance sm:text-7xl lg:text-8xl"
          >
            Run the everyday, <em className="font-serif font-normal tracking-tight">with</em> you.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
            출근 전 5km부터 주말의 하프 마라톤까지,
            <br />
            매일 곁에서 함께 달리는 기어를 만들어요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-10 px-4">
              <a href="#collection">
                컬렉션 보기 <ArrowDownRight data-icon="inline-end" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-10 px-4" onClick={() => prefillOrder({ type: "group" })}>
              단체·도매 문의 <ArrowUpRight data-icon="inline-end" />
            </Button>
          </div>
        </Reveal>

        {/* 대표 이미지 2장: 겹치지 않게 엇갈려 배치해요 */}
        <Reveal delay={1} className="grid grid-cols-5 gap-3 lg:col-span-6">
          <figure className="col-span-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
              <video
                ref={videoRef}
                className="size-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                poster={asset("images/hero-a.webp")}
                width={864}
                height={1080}
                aria-label="브랜드 루프 영상: 오트밀 러닝화, 트랙 위 질주, 해 뜨는 한강의 러닝 크루, 야간 러닝 장면이 트랙 레인처럼 다섯 줄로 달려 들어오며 바뀌어요"
              >
                <source src={asset("video/hero-loop.webm")} type="video/webm" />
                <source src={asset("video/hero-loop.mp4")} type="video/mp4" />
              </video>
            </div>
            <figcaption className="mt-2 flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
              <span className="truncate">Brand film · 10s</span>
              <Button variant="ghost" size="xs" onClick={toggle} className="shrink-0 font-sans text-muted-foreground">
                {paused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
                <span className="max-sm:sr-only">{paused ? "모션 재생" : "모션 일시정지"}</span>
              </Button>
            </figcaption>
          </figure>

          <figure className="col-span-2 mt-16">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
              <img
                src={asset("images/hero-b.webp")}
                alt="해 뜨는 서울 골목길을 달리는 러너의 하반신, 차콜 러닝 쇼츠와 오트밀 러닝화가 역광에 비치는 로우 앵글 컷"
                width={960}
                height={1440}
                className="size-full object-cover"
              />
            </div>
            <figcaption className="mt-2">
              <Button variant="link" size="xs" className="h-auto px-0 font-mono text-muted-foreground" onClick={() => openProduct("lane-04")}>
                04 — Lane Shorts <ArrowUpRight data-icon="inline-end" />
              </Button>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        <p className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          <span className="font-mono">Start</span> 스크롤 한 번이 한 걸음, 페이지 끝이 42.195km예요
        </p>
        <p className="hidden font-mono sm:block">Seoul · Everyday running gear</p>
      </div>
    </section>
  )
}
