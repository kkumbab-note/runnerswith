const MESSAGES = [
  { text: "Run with you", lang: "en" },
  { text: "오늘의 5km를 함께", lang: "ko" },
  { text: "Everyday miles", lang: "en" },
  { text: "느려도 괜찮아요, 같이 가요", lang: "ko" },
  { text: "Crews & local shops welcome", lang: "en" },
  { text: "당신과 함께 달리는 일상을 위한 기어", lang: "ko" },
] as const

export function Marquee() {
  return (
    <section aria-label="브랜드 메시지" className="overflow-hidden border-y py-4">
      <p className="sr-only">{MESSAGES.map((m) => m.text).join(". ")}</p>
      <div aria-hidden="true" data-motion className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {MESSAGES.map((m) => (
              <li
                key={m.text}
                lang={m.lang}
                className="flex items-center gap-6 pr-6 text-2xl font-semibold tracking-tight whitespace-nowrap text-muted-foreground sm:text-3xl"
              >
                {m.text}
                <span className="size-1.5 rounded-full bg-border" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
