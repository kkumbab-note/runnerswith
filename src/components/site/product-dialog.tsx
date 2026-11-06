import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSite } from "@/components/site/site-context"
import { Viewer3D } from "@/components/site/viewer-3d"
import { asset, CONFIG, productLink } from "@/lib/config"
import { findProduct, formatPrice, type Product, type ProductId } from "@/lib/products"
import { cn } from "@/lib/utils"

function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const swipeX = useRef<number | null>(null)
  const count = product.images.length
  const go = (i: number) => setIndex((i + count) % count)
  const image = product.images[index]!

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") go(index - 1)
    else if (e.key === "ArrowRight") go(index + 1)
    else return
    e.preventDefault()
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (swipeX.current === null) return
    const dx = e.clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div>
      <div
        tabIndex={0}
        aria-roledescription="사진 갤러리"
        aria-label={`${product.name} 사진 ${index + 1}/${count}. 화살표 키로 넘겨요.`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => (swipeX.current = e.clientX)}
        onPointerUp={onPointerUp}
        className="relative aspect-[4/5] max-h-[min(70vh,640px)] w-full touch-pan-y overflow-hidden bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <img key={image.src} src={asset(image.src)} alt={image.alt} className="size-full animate-in object-cover fade-in-50" />
        <Button variant="outline" size="icon-sm" aria-label="이전 사진" onClick={() => go(index - 1)} className="absolute top-1/2 left-3 -translate-y-1/2 bg-background">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="다음 사진" onClick={() => go(index + 1)} className="absolute top-1/2 right-3 -translate-y-1/2 bg-background">
          <ChevronRight />
        </Button>
        <Badge variant="outline" className="absolute right-3 bottom-3 bg-background font-mono tabular-nums" aria-live="polite">
          {index + 1} / {count}
        </Badge>
      </div>
      <div role="group" aria-label="사진 선택" className="flex gap-2 overflow-x-auto p-3">
        {product.images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            aria-label={`사진 ${i + 1}: ${img.alt}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "size-14 shrink-0 overflow-hidden rounded-md border opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50",
              i === index && "border-foreground opacity-100",
            )}
          >
            <img src={asset(img.src)} alt="" loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const { prefillOrder } = useSite()
  const [tab, setTab] = useState("photo")

  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr]">
      <Tabs value={tab} onValueChange={setTab} className="gap-0 border-b lg:border-r lg:border-b-0">
        <div className="p-3">
          <TabsList>
            <TabsTrigger value="photo">사진</TabsTrigger>
            <TabsTrigger value="3d">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
              3D 보기
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="photo">
          <Gallery product={product} />
        </TabsContent>
        <TabsContent value="3d">
          <Viewer3D productId={product.id} name={product.name} />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-6 p-6">
        <DialogHeader className="gap-2 pr-8">
          <p className="font-mono text-xs text-muted-foreground">
            No.{product.no} — {product.category.ko} · {product.category.en}
          </p>
          <DialogTitle lang="en" className="text-3xl font-semibold tracking-tight">
            {product.name}
          </DialogTitle>
          <DialogDescription>{product.nameKo}</DialogDescription>
        </DialogHeader>

        <div>
          <p className="font-mono text-2xl tabular-nums">
            {formatPrice(product.price)}
            <span className="ml-1 font-sans text-base text-muted-foreground">원</span>
          </p>
          <p className="mt-3 text-pretty">{product.summary}</p>
        </div>

        <ul role="list" className="grid gap-2">
          {product.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {f}
            </li>
          ))}
        </ul>

        <dl className="text-sm">
          {product.specs.map(([label, value], i) => (
            <div key={label}>
              {i > 0 ? <Separator /> : null}
              <div className="grid grid-cols-[6rem_1fr] gap-4 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-auto grid gap-2 sm:grid-cols-[1fr_auto]">
          <Button asChild size="lg" className="h-10">
            <a href={productLink(product.id)} target="_blank" rel="noopener noreferrer">
              스마트스토어에서 구매 <ArrowUpRight data-icon="inline-end" />
              <span className="sr-only">(새 창)</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-10"
            onClick={() => {
              onClose()
              prefillOrder({ type: "group", productId: product.id })
            }}
          >
            단체 문의
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          사이즈가 고민되면{" "}
          <a href={CONFIG.links.kakao} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">
            카카오톡으로 물어봐 주세요
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export function ProductDialog({ productId, onClose }: { productId: ProductId | null; onClose: () => void }) {
  const product = productId ? findProduct(productId) : undefined

  // #product-… 주소로 공유할 수 있게 열린 제품을 주소에 남겨요
  useEffect(() => {
    try {
      if (productId) history.replaceState(null, "", `#product-${productId}`)
      else if (location.hash.startsWith("#product-")) history.replaceState(null, "", location.pathname + location.search)
    } catch {
      // 주소 갱신이 막혀도 모달은 그대로 동작해요
    }
  }, [productId])

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-5xl">
        {product ? <ProductDetail key={product.id} product={product} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  )
}
