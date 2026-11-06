import { cn } from "@/lib/utils"

/** 브랜드 심볼 "Lane Bend": 트랙 곡선의 두 레인이 가운데 점(당신)을 감싸요 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" aria-hidden="true" focusable="false" className={cn("h-5 w-auto shrink-0", className)}>
      <g fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round">
        <path d="M45 3H17a13 13 0 0 0 0 26h28" />
        <path d="M45 9.6H17a6.4 6.4 0 0 0 0 12.8h28" />
      </g>
      <circle cx={17} cy={16} r={3} className="fill-brand" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] leading-none font-semibold tracking-tight uppercase">
        Runners<span className="ml-0.5 font-serif text-[1.15em] font-normal tracking-normal normal-case italic">with</span>
      </span>
    </span>
  )
}
