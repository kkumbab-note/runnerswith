import { ArrowUpRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { CONFIG } from "@/lib/config"

const FAQS = [
  {
    q: "배송은 얼마나 걸리나요?",
    a: "평일 오후 2시 전에 결제하면 당일 출고하고, 보통 1~2일 안에 도착해요. 3만원 이상 무료배송이며 제주·도서산간 지역은 추가 배송비가 붙을 수 있어요. 단체·제작 주문은 별도 일정으로 안내해 드려요.",
  },
  {
    q: "교환·환불은 어떻게 하나요?",
    a: "상품을 받은 날로부터 7일 이내, 착용·세탁 흔적이 없다면 교환·환불할 수 있어요. 러닝화 사이즈 교환은 1회 무료예요. 실내에서 가볍게 신어본 정도는 괜찮지만, 야외 착용 후에는 어려워요. 로고 인쇄 같은 제작 상품은 교환·환불이 제한돼요.",
  },
  {
    q: "사이즈는 어떻게 고르나요?",
    a: "러닝화는 평소 신는 러닝화와 같은 정사이즈를 추천해요. 발볼이 넓거나 장거리 위주라면 5mm 크게 골라주세요. 의류는 제품 상세의 실측표를 확인해 주시고, 발 길이와 평소 사이즈를 카카오톡으로 보내주시면 직접 추천해 드려요.",
  },
  {
    q: "단체 주문은 몇 개부터 가능한가요?",
    a: "같은 제품 기준 10개부터 단체 할인이 적용돼요. 크루명·로고 인쇄는 의류·캡 30개부터 가능하고, 시안 확정 후 제작까지 2~3주 걸려요. 대회나 행사 날짜가 정해져 있다면 문의 폼의 ‘희망 일정’에 꼭 적어주세요.",
  },
  {
    q: "매장 입점(도매)도 가능한가요?",
    a: "네, 사업자등록이 된 러닝샵·편집숍·체육시설이라면 가능해요. 아래 문의 폼에서 ‘협업·도매’를 선택하고 매장 정보를 남겨주시면 도매가표와 샘플 키트 안내를 보내드려요.",
  },
] as const

export function Faq() {
  return (
    <section id="faq" data-km="36" data-nav="buy" aria-labelledby="faq-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="faq-title" no="Q&A" label="FAQ" split="Split · 36.0 km" title="Before you lace up" titleKo="자주 묻는 질문" />
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="text-pretty text-muted-foreground">찾는 답이 없다면 카카오톡 채널로 편하게 물어봐 주세요. 평일 10시부터 17시까지, 보통 1시간 안에 답해요.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer">
                카카오톡 채널 열기 <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </Reveal>
          <Reveal delay={1} className="lg:col-span-8">
            <Accordion type="multiple" className="border-t">
              {FAQS.map((item, i) => (
                <AccordionItem key={item.q} value={`q${i + 1}`}>
                  <AccordionTrigger className="gap-4 py-5 text-base">
                    <span className="flex gap-4">
                      <span className="font-mono text-xs leading-6 text-muted-foreground">Q{i + 1}</span>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-10 text-pretty text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
