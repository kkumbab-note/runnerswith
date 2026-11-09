import { useEffect, useRef, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Logo } from "@/components/site/logo"
import { CONFIG } from "@/lib/config"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "#collection", key: "collection", no: "01", label: "제품" },
  { href: "#story", key: "story", no: "02", label: "브랜드 이야기" },
  { href: "#buy", key: "buy", no: "03", label: "구매·문의" },
] as const

const FINISH = 42.195
/** 섹션마다 찍히는 스플릿(km) — 각 섹션의 data-km 값과 같아요 */
const SPLITS = [10, 21.1, 30, 36, 40]

/**
 * 시그니처 "42.195 페이스 레인": 스크롤 위치를 마라톤 거리로 바꿔 보여줘요.
 * 섹션에 도착하면 숫자가 그 섹션의 스플릿과 맞아떨어지도록 체크포인트 사이를 보간해요.
 */
function usePaceLane() {
  const laneRef = useRef<HTMLDivElement>(null)
  const kmRef = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let points: { y: number; km: number }[] = [{ y: 0, km: 0 }]
    let raf = 0

    const kmAt = (y: number) => {
      const last = points[points.length - 1]!
      if (y >= last.y - 2) return FINISH
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]!
        const b = points[i]!
        if (y <= b.y) return b.y === a.y ? b.km : a.km + (b.km - a.km) * ((y - a.y) / (b.y - a.y))
      }
      return FINISH
    }

    const update = () => {
      raf = 0
      const km = kmAt(window.scrollY)
      const done = km >= FINISH
      laneRef.current?.style.setProperty("--p", (km / FINISH).toFixed(4))
      if (kmRef.current) kmRef.current.textContent = done ? "42.195" : km.toFixed(2)
      if (badgeRef.current) badgeRef.current.dataset.finish = String(done)
    }

    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const offset = window.innerHeight * 0.45
      const next = [{ y: 0, km: 0 }]
      document.querySelectorAll<HTMLElement>("[data-km]").forEach((el) => {
        const y = el.getBoundingClientRect().top + window.scrollY - offset
        next.push({ y: Math.min(max, Math.max(0, y)), km: Number(el.dataset.km) })
      })
      next.push({ y: max, km: FINISH })
      for (let i = 1; i < next.length; i++) next[i]!.y = Math.max(next[i]!.y, next[i - 1]!.y)
      points = next
      update()
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", measure)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [])

  return { laneRef, kmRef, badgeRef }
}

function useActiveSection() {
  const [active, setActive] = useState("")
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.nav ?? "")
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    )
    document.querySelectorAll("section[data-nav]").forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
  return active
}

function LanguageToggle({ className }: { className?: string }) {
  const onChange = (value: string) => {
    if (value !== "en") return
    if (CONFIG.links.en) window.location.href = CONFIG.links.en
    else notify("English version is coming soon — 영문 페이지는 준비 중이에요.")
  }
  return (
    <ToggleGroup type="single" value="ko" onValueChange={onChange} variant="outline" size="sm" aria-label="언어 선택" className={className}>
      <ToggleGroupItem value="ko" className="px-2.5 font-mono text-xs">
        KR
      </ToggleGroupItem>
      <ToggleGroupItem value="en" lang="en" className="px-2.5 font-mono text-xs">
        EN
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export function SiteHeader() {
  const { laneRef, kmRef, badgeRef } = usePaceLane()
  const active = useActiveSection()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <a href="#top" className="mr-4 rounded-md">
          <Logo />
          <span className="sr-only"> 러너스위드 홈</span>
        </a>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Button
              key={item.key}
              asChild
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground", active === item.key && "text-foreground")}
            >
              <a href={item.href} aria-current={active === item.key ? "location" : undefined}>
                <span className="font-mono text-[10px] text-muted-foreground">{item.no}</span>
                {item.label}
              </a>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            ref={badgeRef}
            variant="outline"
            aria-hidden="true"
            className="hidden h-7 gap-1.5 px-2.5 font-mono tabular-nums min-[380px]:inline-flex data-[finish=true]:bg-foreground data-[finish=true]:text-background"
          >
            <span className="size-1.5 rounded-full bg-brand" />
            <span ref={kmRef} className="min-w-[3.4em] text-right">
              0.00
            </span>
            <span className="text-[10px] opacity-60">km</span>
          </Badge>
          <LanguageToggle className="hidden md:flex" />
          <Button asChild size="sm">
            <a href="#order">
              <span>
                주문<span className="hidden sm:inline">하기</span>
              </span>
              <ArrowDownRight data-icon="inline-end" />
            </a>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" className="md:hidden" aria-label="메뉴 열기">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="모바일 메뉴" className="flex flex-col p-4">
                {[...NAV, { href: "#order", key: "order", no: "04", label: "주문서 작성" }].map((item) => (
                  <SheetClose asChild key={item.key}>
                    <a
                      href={item.href}
                      className="flex items-center gap-4 border-b py-4 text-2xl font-semibold tracking-tight last:border-b-0"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{item.no}</span>
                      {item.label}
                      <ArrowDownRight className="ml-auto size-5 text-muted-foreground" />
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex items-center justify-between gap-4 border-t p-4">
                <LanguageToggle />
                <Button asChild variant="link" size="sm" className="px-0">
                  <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer">
                    카카오톡 채널 상담 <ArrowUpRight data-icon="inline-end" />
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 페이스 레인: 헤더 아래 선이 달린 거리만큼 채워지고, 러너 점이 앞서 달려요 */}
      <div ref={laneRef} aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px overflow-x-clip [--p:0]">
        {SPLITS.map((km) => (
          <span key={km} className="absolute -top-1 h-2 w-px bg-border" style={{ left: `${(km / FINISH) * 100}%` }} />
        ))}
        <div className="h-px origin-left scale-x-(--p) bg-foreground" />
        <div className="absolute inset-0 translate-x-[calc(var(--p)*100%)]">
          <span className="absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand ring-2 ring-background" />
        </div>
      </div>
    </header>
  )
}
