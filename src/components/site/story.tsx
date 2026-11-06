import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { asset } from "@/lib/config"

const VALUES = [
  {
    no: "01",
    en: "Daily-proof",
    title: "매일 신어도 버티는 것만",
    text: "출시 전 팀원과 크루가 직접 300km 이상 신고 달려봐요. 매일의 러닝을 버티지 못하면 내놓지 않아요.",
  },
  {
    no: "02",
    en: "Every pace",
    title: "모든 페이스를 위한 핏",
    text: "230부터 300까지 5mm 단위 사이즈와 체형별 핏 가이드를 준비했어요. 4분 페이스도 7분 페이스도 같은 러너니까요.",
  },
  {
    no: "03",
    en: "Run local",
    title: "동네와 함께 달려요",
    text: "동네 러닝샵·크루와 함께 제품을 테스트하고, 소규모 매장도 부담 없는 도매 조건을 열어두고 있어요.",
  },
] as const

export function Story() {
  return (
    <section id="story" data-km="21.1" data-nav="story" aria-labelledby="story-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="story-title" no="02" label="Our story" split="Half · 21.1 km" title="Made to run beside you" titleKo="브랜드 이야기" />

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
              기록보다 오래 남는 건, 누군가와 함께 달린 아침이었어요.
            </p>
          </Reveal>
          <Reveal delay={1} className="grid gap-4 text-muted-foreground lg:col-span-5">
            <p>
              러너스위드는 동네 새벽 러닝 크루에서 시작했어요. 매주 같은 자리에 모여 달리면서 알게 됐죠. 사람을 다시 뛰게 만드는 건 최고 기록이
              아니라 발이 편한 신발, 쓸리지 않는 옷, 그리고 옆에서 같이 뛰는 누군가라는 걸요.
            </p>
            <p>그래서 우리는 ‘가장 빠른 기어’보다 ‘매일 손이 가는 기어’를 만들어요. 혼자 뛰는 날에도, 크루와 뛰는 날에도 당신 곁에서 같이 달릴 수 있도록요.</p>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <figure>
            <img
              src={asset("images/story.webp")}
              alt="해 뜨는 한강 산책로를 나란히 달리는 러닝 크루 여섯 명의 뒷모습, 멀리 도시 스카이라인과 다리가 보이는 와이드 컷"
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-lg border object-cover sm:aspect-[21/9]"
            />
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-mono">Sunday, 6:00 AM</span>
              <span>일요일 새벽, 우리가 처음 모였던 강변 산책로</span>
            </figcaption>
          </figure>
        </Reveal>

        <ul role="list" className="mt-12 grid gap-6 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <li key={v.no}>
              <Reveal delay={i} className="h-full">
                <Card className="h-full">
                  <CardHeader className="gap-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {v.no} · <span lang="en">{v.en}</span>
                    </p>
                    <CardTitle className="text-lg font-semibold tracking-tight">{v.title}</CardTitle>
                    <CardDescription className="text-pretty">{v.text}</CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* 로고 이야기 */}
        <Reveal className="mt-16 grid items-center gap-8 border-t pt-12 lg:grid-cols-12">
          <div className="grid aspect-[16/9] place-items-center rounded-lg bg-foreground text-background lg:col-span-5">
            <svg viewBox="0 0 48 32" aria-hidden="true" className="w-2/5">
              <g fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round">
                <path d="M45 3H17a13 13 0 0 0 0 26h28" />
                <path d="M45 9.6H17a6.4 6.4 0 0 0 0 12.8h28" />
              </g>
              <circle cx={17} cy={16} r={3} className="fill-brand" />
            </svg>
          </div>
          <div className="lg:col-span-7">
            <p lang="en" className="font-mono text-xs text-muted-foreground">
              Our mark — Lane Bend
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">두 개의 레인이 가운데의 당신을 감싸요</h3>
            <p className="mt-3 max-w-prose text-pretty text-muted-foreground">
              육상 트랙의 곡선 구간에서 두 레인이 가운데 점을 감싸 안는 모양이에요. 점은 오늘 달리는 당신, 레인은 곁에서 같은 방향으로 함께
              달리는 우리예요. 워드마크의 ‘with’만 이탤릭으로 기울인 것도 같은 이유예요.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
