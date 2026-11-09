import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { ArrowRight, ArrowUpRight, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { INQUIRY_LABEL, type InquiryType } from "@/components/site/site-context"
import { track } from "@/lib/analytics"
import { CONFIG, productLink, storeLink } from "@/lib/config"
import { notify } from "@/lib/notify"
import { useOrderPrefill } from "@/lib/order-prefill"
import { findProduct, PRODUCTS } from "@/lib/products"
import { cn } from "@/lib/utils"

interface FormState {
  name: string
  contact: string
  type: InquiryType
  /** 제품 id, "none"(상담 후 결정), "multi"(여러 제품) */
  product: string
  qty: string
  date: string
  message: string
  agree: boolean
}

type ErrorKey = "name" | "contact" | "qty" | "date" | "agree"
type Errors = Partial<Record<ErrorKey, string>>

const INITIAL: FormState = { name: "", contact: "", type: "personal", product: "none", qty: "1", date: "", message: "", agree: false }
const MESSAGE_MAX = 1000
const PHONE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const QTY_HINT: Record<InquiryType, string> = {
  personal: "수량은 1개부터 입력할 수 있어요.",
  group: "단체 할인은 같은 제품 10개부터 적용돼요.",
  wholesale: "도매 사입은 30개부터 가능해요.",
  etc: "수량은 1개부터 입력할 수 있어요.",
}
type Channel = "email" | "kakao" | "store"
const RECOMMEND: Record<InquiryType, Channel> = { personal: "store", group: "kakao", wholesale: "email", etc: "kakao" }

const pad = (n: number) => String(n).padStart(2, "0")
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const formatDate = (iso: string) => {
  if (!iso) return "협의 가능"
  const [y, m, d] = iso.split("-")
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}
const productLabel = (value: string) => {
  if (value === "multi") return "여러 제품 (내용에 적어주세요)"
  const p = findProduct(value)
  return p ? `${p.name} — ${p.nameKo}` : "선택 안 함"
}

function validate(f: FormState): Errors {
  const errors: Errors = {}
  if (f.name.trim().length < 2) errors.name = "이름을 2자 이상 입력해 주세요."
  const contact = f.contact.trim()
  if (!PHONE.test(contact.replace(/\s/g, "")) && !EMAIL.test(contact)) errors.contact = "휴대폰 번호(010-0000-0000) 또는 이메일 주소를 입력해 주세요."
  const qty = Number(f.qty)
  if (f.qty !== "" && !(Number.isInteger(qty) && qty >= 1 && qty <= 9999)) errors.qty = "수량은 1부터 9999 사이 숫자로 입력해 주세요."
  if (f.date && f.date < todayISO()) errors.date = "희망 일정은 오늘 이후 날짜로 골라주세요."
  if (!f.agree) errors.agree = "개인정보 수집·이용에 동의해 주세요."
  return errors
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.className = "sr-only"
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand("copy")
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="text-xs text-destructive">
        {error}
      </p>
    )
  }
  return hint ? (
    <p id={`${id}-hint`} className="text-xs text-muted-foreground">
      {hint}
    </p>
  ) : null
}

export function OrderForm() {
  const prefill = useOrderPrefill()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  // 오늘 날짜는 방문 시점 기준이라, 미리 만든 HTML이 아니라 브라우저에서 정해요
  const [minDate, setMinDate] = useState<string>()
  const submitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMinDate(todayISO()), [])

  useEffect(() => {
    if (!prefill) return
    setForm((f) => ({ ...f, type: prefill.type ?? f.type, product: prefill.productId ?? f.product }))
  }, [prefill])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const describedBy = (id: string, key: ErrorKey, hasHint = false) => (errors[key] ? `${id}-error` : hasHint ? `${id}-hint` : undefined)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = validate(form)
    setErrors(next)
    const firstInvalid = (["name", "contact", "qty", "date", "agree"] as const).find((k) => next[k])
    if (firstInvalid) {
      document.getElementById(`f-${firstInvalid}`)?.focus()
      notify(`입력 내용을 확인해 주세요 (${Object.values(next).filter(Boolean).length}곳).`)
      return
    }
    track("generate_lead", { inquiry_type: form.type, item_id: findProduct(form.product)?.id })
    setSummaryOpen(true)
  }

  const summary = useMemo(() => {
    const rows: [string, string][] = [
      ["이름", form.name.trim()],
      ["연락처", form.contact.trim()],
      ["문의 유형", INQUIRY_LABEL[form.type]],
      ["제품", productLabel(form.product)],
      ["수량", form.qty ? `${form.qty}개` : "미정"],
      ["희망 일정", formatDate(form.date)],
      ["내용", form.message.trim() || "-"],
    ]
    const text = `[${CONFIG.brand} 주문·문의]\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`
    const subject = `[${CONFIG.brand}] ${INQUIRY_LABEL[form.type]} 문의 — ${form.name.trim()}`
    const product = findProduct(form.product)
    return {
      rows,
      text,
      channels: [
        {
          key: "email" as const,
          title: "이메일",
          desc: "메일 앱에 요약이 자동으로 채워져요",
          href: `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
          external: false,
        },
        {
          key: "kakao" as const,
          title: "카카오톡 채널",
          desc: "요약을 복사하고 채팅창을 열어요 · 붙여넣기만 하면 돼요",
          href: CONFIG.links.kakaoChat || CONFIG.links.kakao,
          external: true,
        },
        {
          key: "store" as const,
          title: "네이버 스마트스토어",
          desc: "개인 구매는 바로 결제할 수 있어요",
          href: form.type === "personal" && product ? productLink(product.id, "summary") : storeLink("summary"),
          external: true,
        },
      ],
      recommended: RECOMMEND[form.type],
    }
  }, [form])

  const onChannel = (key: Channel) => {
    track(key === "store" ? "click_store" : "contact", { method: key, inquiry_type: form.type, placement: "summary" })
    if (key === "kakao") {
      copyText(summary.text).then((ok) =>
        notify(ok ? "요약을 복사했어요. 카카오톡 채팅창에 붙여넣어 주세요." : "복사가 안 됐어요. ‘요약 복사’를 다시 눌러주세요."),
      )
    } else if (key === "email") {
      notify("메일 앱을 열고 있어요. 내용 확인 후 보내기를 눌러주세요.")
    }
  }

  return (
    <section id="order" data-km="40" data-nav="buy" aria-labelledby="order-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="order-title"
          no="04"
          label="Order & contact"
          split="Split · 40.0 km"
          title="Let’s run together"
          titleKo="주문·문의하기"
          lead="남겨주신 내용은 바로 전송되지 않아요. 한 번 정리해서 보여드리고, 편한 채널을 골라 보내면 끝이에요."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <ol className="grid gap-4">
              {[
                ["01", "폼 작성", "1분이면 충분해요."],
                ["02", "요약 확인", "빠진 내용이 없는지 한 번 더 봐요."],
                ["03", "채널 선택", "이메일·카카오톡·스마트스토어 중 편한 곳으로 보내요."],
              ].map(([no, title, desc]) => (
                <li key={no} className="flex gap-4">
                  <span className="font-mono text-xs leading-6 text-muted-foreground">{no}</span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Separator className="my-8" />
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">카카오톡 채널</dt>
                <dd>
                  <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    @러너스위드
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">이메일</dt>
                <dd>
                  <a href={`mailto:${CONFIG.email}`} className="underline underline-offset-4">
                    {CONFIG.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">운영 시간</dt>
                <dd>평일 10:00–17:00 · 주말·공휴일 휴무</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">답변</dt>
                <dd>영업일 기준 24시간 이내</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={1} className="lg:col-span-8">
            <Card>
              <form noValidate data-js-form onSubmit={onSubmit} aria-describedby="form-note" className="contents">
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="f-name">이름</Label>
                    <Input
                      id="f-name"
                      autoComplete="name"
                      maxLength={40}
                      placeholder="홍길동"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={describedBy("f-name", "name")}
                      required
                    />
                    <FieldMessage id="f-name" error={errors.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="f-contact">연락처</Label>
                    <Input
                      id="f-contact"
                      autoComplete="tel"
                      maxLength={80}
                      placeholder="010-0000-0000"
                      value={form.contact}
                      onChange={(e) => set("contact", e.target.value)}
                      aria-invalid={Boolean(errors.contact)}
                      aria-describedby={describedBy("f-contact", "contact", true)}
                      required
                    />
                    <FieldMessage id="f-contact" error={errors.contact} hint="휴대폰 번호 또는 이메일 모두 괜찮아요." />
                  </div>

                  <fieldset className="grid gap-3 sm:col-span-2">
                    <legend className="mb-3 text-sm font-medium">문의 유형</legend>
                    <RadioGroup value={form.type} onValueChange={(v) => set("type", v as InquiryType)} className="flex flex-wrap gap-2">
                      {(Object.keys(INQUIRY_LABEL) as InquiryType[]).map((key) => (
                        <div
                          key={key}
                          className={cn(
                            "flex h-9 items-center gap-2 rounded-md border pl-3 transition-colors hover:bg-muted",
                            form.type === key && "border-foreground",
                          )}
                        >
                          <RadioGroupItem id={`f-type-${key}`} value={key} />
                          <Label htmlFor={`f-type-${key}`} className="h-full cursor-pointer pr-3 font-normal">
                            {key === "etc" ? "기타" : INQUIRY_LABEL[key]}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </fieldset>

                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="f-product">제품</Label>
                    <Select value={form.product} onValueChange={(v) => set("product", v)}>
                      <SelectTrigger id="f-product" className="w-full">
                        <SelectValue placeholder="선택 안 함 · 상담 후 결정" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">선택 안 함 · 상담 후 결정</SelectItem>
                        <SelectSeparator />
                        {(["러닝화", "의류", "장비"] as const).map((cat) => (
                          <SelectGroup key={cat}>
                            <SelectLabel>{cat}</SelectLabel>
                            {PRODUCTS.filter((p) => p.category.ko === cat).map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} — {p.nameKo}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                        <SelectSeparator />
                        <SelectItem value="multi">여러 제품 (내용에 적어주세요)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="f-qty">수량</Label>
                    <Input
                      id="f-qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={9999}
                      step={1}
                      value={form.qty}
                      onChange={(e) => set("qty", e.target.value)}
                      aria-invalid={Boolean(errors.qty)}
                      aria-describedby={describedBy("f-qty", "qty", true)}
                    />
                    <FieldMessage id="f-qty" error={errors.qty} hint={QTY_HINT[form.type]} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="f-date">희망 일정</Label>
                    <Input
                      id="f-date"
                      type="date"
                      min={minDate}
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                      aria-invalid={Boolean(errors.date)}
                      aria-describedby={describedBy("f-date", "date", true)}
                    />
                    <FieldMessage id="f-date" error={errors.date} hint="수령·행사 날짜가 있다면 골라주세요." />
                  </div>

                  <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="f-message">내용</Label>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums" aria-hidden="true">
                        {form.message.length} / {MESSAGE_MAX}
                      </span>
                    </div>
                    <Textarea
                      id="f-message"
                      rows={5}
                      maxLength={MESSAGE_MAX}
                      placeholder="사이즈, 로고 인쇄 여부, 매장 정보, 배송 지역 등을 자유롭게 적어주세요."
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2 sm:col-span-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="f-agree"
                        checked={form.agree}
                        onCheckedChange={(v) => set("agree", v === true)}
                        aria-invalid={Boolean(errors.agree)}
                        aria-describedby={errors.agree ? "f-agree-error" : "f-agree-detail"}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1">
                        <Label htmlFor="f-agree">개인정보 수집·이용에 동의해요 (필수)</Label>
                        <p id="f-agree-detail" className="text-xs text-muted-foreground">
                          수집 항목: 이름, 연락처 · 목적: 주문·문의 응대 · 보유 기간: 문의 처리 후 1년. 동의하지 않을 수 있으며, 동의하지
                          않으면 이 폼으로는 문의를 접수할 수 없어요(카카오톡·이메일로는 문의할 수 있어요).
                        </p>
                      </div>
                    </div>
                    <FieldMessage id="f-agree" error={errors.agree} />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <Button ref={submitRef} type="submit" size="lg" className="h-10 px-4">
                    문의 내용 정리하기 <ArrowRight data-icon="inline-end" />
                  </Button>
                  <p id="form-note" className="text-xs text-muted-foreground">
                    제출해도 바로 전송되지 않아요. 요약을 확인한 뒤 보낼 채널을 골라요.
                  </p>
                </CardFooter>
              </form>
            </Card>
          </Reveal>
        </div>
      </div>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
          onCloseAutoFocus={(e) => {
            // 제출 버튼으로 연 모달이라, 닫으면 다시 제출 버튼으로 돌아가요
            e.preventDefault()
            submitRef.current?.focus({ preventScroll: true })
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">이렇게 정리했어요</DialogTitle>
            <DialogDescription>아직 전송 전이에요. 보낼 채널을 골라주세요.</DialogDescription>
          </DialogHeader>
          <dl className="divide-y text-sm">
            {summary.rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-4 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-2">
            {summary.channels.map((c) => {
              const recommended = summary.recommended === c.key
              return (
                <Button
                  key={c.key}
                  asChild
                  variant={recommended ? "default" : "outline"}
                  className="h-auto justify-between gap-4 py-3 text-left whitespace-normal"
                >
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => onChannel(c.key)}>
                    <span className="grid gap-0.5">
                      <span className="flex items-center gap-2 font-semibold">
                        {c.title}
                        {recommended ? (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                            추천
                          </Badge>
                        ) : null}
                      </span>
                      <span className={cn("text-xs font-normal", recommended ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {c.desc}
                      </span>
                    </span>
                    <ArrowUpRight />
                  </a>
                </Button>
              )
            })}
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => notify((await copyText(summary.text)) ? "요약을 클립보드에 복사했어요." : "복사가 안 됐어요. 직접 선택해서 복사해 주세요.")}
            >
              <Copy data-icon="inline-start" />
              요약 복사
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                내용 수정하기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
