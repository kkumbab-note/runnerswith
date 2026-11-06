import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { Reveal } from "@/components/site/reveal"

interface SectionHeadingProps {
  id: string
  no: string
  label: string
  /** 페이스 레인 스플릿 표시 (예: "10.0 km") */
  split: string
  title: string
  titleKo: string
  lead?: ReactNode
}

export function SectionHeading({ id, no, label, split, title, titleKo, lead }: SectionHeadingProps) {
  return (
    <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground lg:col-span-12">
        <span className="text-foreground">{no}</span>
        <span>{label}</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {split}
        </span>
      </div>
      <Separator className="lg:col-span-12" />
      <h2 id={id} className="lg:col-span-7">
        <span lang="en" className="block text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </span>
        <span className="mt-3 block text-base font-medium text-muted-foreground">{titleKo}</span>
      </h2>
      {lead ? <p className="text-pretty text-muted-foreground lg:col-span-5">{lead}</p> : null}
    </Reveal>
  )
}
