import { ArrowDownRight, ArrowUpRight, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { useSite } from "@/components/site/site-context"
import { track } from "@/lib/analytics"
import { CONFIG, storeLink } from "@/lib/config"

export function HowToBuy() {
  const { prefillOrder } = useSite()

  const routes = [
    {
      no: "01",
      for: "For you",
      title: "개인 구매",
      desc: "스마트스토어에서 바로 결제하거나, 사이즈가 고민되면 카카오톡으로 먼저 물어봐 주세요.",
      points: ["1개부터 바로 구매", "3만원 이상 무료배송", "러닝화 사이즈 교환 1회 무료"],
      primary: (
        <Button asChild size="sm">
          <a
            href={storeLink("how-to-buy")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_store", { placement: "how-to-buy" })}
          >
            스마트스토어 <ArrowUpRight data-icon="inline-end" />
            <span className="sr-only">(새 창)</span>
          </a>
        </Button>
      ),
      secondary: (
        <Button asChild variant="ghost" size="sm">
          <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer">
            카카오톡 사이즈 상담 <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      ),
    },
    {
      no: "02",
      for: "For crews",
      title: "단체 구매",
      desc: "러닝 크루, 회사 동호회, 대회 기념품까지. 수량과 일정만 알려주시면 견적을 보내드려요.",
      points: ["같은 제품 10개부터 단체 할인", "크루명·로고 인쇄 (30개부터)", "시안 확정 후 제작 2~3주"],
      primary: (
        <Button size="sm" onClick={() => prefillOrder({ type: "group" })}>
          단체 견적 문의 <ArrowDownRight data-icon="inline-end" />
        </Button>
      ),
      secondary: (
        <Button asChild variant="ghost" size="sm">
          <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer">
            카카오톡 문의 <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      ),
    },
    {
      no: "03",
      for: "For shops",
      title: "협업·도매",
      desc: "러닝샵·편집숍 입점과 브랜드 협업을 기다려요. 소규모 매장도 부담 없이 시작할 수 있어요.",
      points: ["사업자 대상 도매가 제공", "최소 30개부터 사입 가능", "매장용 샘플 키트 대여"],
      primary: (
        <Button size="sm" onClick={() => prefillOrder({ type: "wholesale" })}>
          도매 문의 <ArrowDownRight data-icon="inline-end" />
        </Button>
      ),
      secondary: (
        <Button asChild variant="ghost" size="sm">
          <a href={`mailto:${CONFIG.email}`}>
            이메일 보내기 <ArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      ),
    },
  ]

  return (
    <section id="buy" data-km="30" data-nav="buy" aria-labelledby="buy-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="buy-title"
          no="03"
          label="How to buy"
          split="Split · 30.0 km"
          title="Three ways to join the run"
          titleKo="구매 방법"
          lead="혼자 달리는 러너도, 50명 크루도, 동네 러닝샵도. 각자에게 맞는 길로 안내해 드려요."
        />
        <ul role="list" className="mt-12 grid gap-6 lg:grid-cols-3">
          {routes.map((r, i) => (
            <li key={r.no}>
              <Reveal delay={i} className="h-full">
                <Card className="h-full">
                  <CardHeader className="gap-3">
                    <Badge variant="outline" className="font-mono">
                      Route {r.no} · <span lang="en">{r.for}</span>
                    </Badge>
                    <CardTitle className="text-2xl font-semibold tracking-tight">{r.title}</CardTitle>
                    <CardDescription className="text-pretty">{r.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul role="list" className="grid gap-2">
                      {r.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-muted-foreground" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex-wrap gap-2">
                    {r.primary}
                    {r.secondary}
                  </CardFooter>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
