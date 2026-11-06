import { ArrowUp, ArrowUpRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/site/logo"
import { CONFIG, type LinkKey } from "@/lib/config"

const MENU = [
  ["#collection", "제품"],
  ["#story", "브랜드 이야기"],
  ["#buy", "구매 방법"],
  ["#faq", "자주 묻는 질문"],
  ["#order", "주문·문의"],
] as const

const SOCIAL: [LinkKey, string][] = [
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["strava", "Strava Club"],
  ["kakao", "카카오톡 채널"],
  ["blog", "네이버 블로그"],
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            당신과 함께 달리는 일상을 위한 기어.
            <br />
            러닝화 · 러닝 의류 · 러닝 장비
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
            <span className="font-mono">Finish · 42.195 km</span> 끝까지 함께 달려줘서 고마워요
          </p>
        </div>

        <nav aria-label="푸터 메뉴" className="lg:col-span-2">
          <p className="font-mono text-xs text-muted-foreground">Menu</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {MENU.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:underline hover:underline-offset-4">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <p className="font-mono text-xs text-muted-foreground">Follow</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {SOCIAL.map(([key, label]) => (
              <li key={key}>
                <a href={CONFIG.links[key]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4">
                  {label}
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="font-mono text-xs text-muted-foreground">Business info</p>
          <dl className="mt-4 grid gap-1 text-xs">
            {CONFIG.business.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8.5rem_1fr] gap-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>
                  {value}
                  {label === "사업자등록번호" ? (
                    <a href={CONFIG.links.bizCheck} target="_blank" rel="noopener noreferrer" className="ml-2 underline underline-offset-4">
                      사업자정보 확인
                    </a>
                  ) : null}
                </dd>
              </div>
            ))}
            <div className="grid grid-cols-[8.5rem_1fr] gap-2">
              <dt className="text-muted-foreground">이메일</dt>
              <dd>{CONFIG.email}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} 러너스위드 Runners With. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-4">
            <li>
              <a href={CONFIG.links.terms || "#top"} className="hover:text-foreground">
                이용약관
              </a>
            </li>
            <li>
              <a href={CONFIG.links.privacy || "#top"} className="font-medium text-foreground">
                개인정보처리방침
              </a>
            </li>
            <li>
              <a href="#top" className="inline-flex items-center gap-1 hover:text-foreground">
                맨 위로 <ArrowUp className="size-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
